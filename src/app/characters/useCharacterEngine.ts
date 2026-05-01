"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { mapEvent, type ActionInstruction } from "./data/event-map";
import { pickLine, shouldShowWanderBubble, type DialoguePool } from "./lib/dialogue";
import { nextWanderPosition } from "./lib/wander";
import {
  characterReducer,
  initialStates,
  ACTIVE_TTL_MS,
  type CharacterState,
} from "./lib/reducer";
import type { AgentId } from "./data/agents";
import type { RawEvent } from "./useEventsStream";

type Options = {
  stage: number | null | undefined;
  dialoguePool: DialoguePool;
};

const WANDER_MIN_MS = 5_000;
const WANDER_MAX_MS = 15_000;
const ARRIVE_MS = 600; // walk transition 시간 + 약간 여유
const JUMP_MS = 500;
const BUBBLE_SWEEP_MS = 1_000;
const ACTIVITY_TICK_MS = 1_000;
const FEED_MAX = 8;
const RETURN_HOME_MS = 20_000; // walk-to 후 N초 뒤 home 복귀

export type FeedEntry = {
  id: string;            // unique key for React
  kind: "active" | "waiting";
  agent: AgentId;
  message: string;       // e.g., "prettier pass" or "활동 종료"
  at: number;
};

export function useCharacterEngine({ stage, dialoguePool }: Options) {
  const [states, dispatch] = useReducer(characterReducer, stage, initialStates);
  const lastUsedRef = useRef<Map<string, string[]>>(new Map());
  const [now, setNow] = useState<number>(() => Date.now());
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const wasActiveRef = useRef<Set<AgentId>>(new Set());
  const seqRef = useRef<number>(0);
  // 탭 백그라운드 시 wander/activity tick 일시정지 (배터리/CPU 절약)
  const pausedRef = useRef<boolean>(false);

  // visibilitychange listener
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => {
      pausedRef.current = document.hidden;
    };
    pausedRef.current = document.hidden;
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // stage prop 변화 시 unlocked 필드 갱신 (state 보존)
  useEffect(() => {
    if (stage === null || stage === undefined) return;
    dispatch({ type: "STAGE_CHANGE", stage });
  }, [stage]);

  const pushFeed = useCallback((entry: Omit<FeedEntry, "id">) => {
    seqRef.current += 1;
    const id = `${entry.at}-${seqRef.current}`;
    setFeed((prev) => [{ ...entry, id }, ...prev].slice(0, FEED_MAX));
  }, []);

  const handleEvent = useCallback((event: RawEvent) => {
    const instructions = mapEvent(event);
    const eventNow = Date.now();
    for (const inst of instructions) {
      const text = pickLine(dialoguePool, inst.agent, inst.dialogueKey, lastUsedRef.current);
      dispatch({ type: "INSTRUCTION", instruction: inst, bubbleText: text, now: eventNow });
      pushFeed({
        kind: "active",
        agent: inst.agent,
        message: feedMessageFor(inst, event),
        at: eventNow,
      });

      if (inst.action === "jump" || inst.action === "clap") {
        setTimeout(() => dispatch({ type: "JUMP_END", agent: inst.agent }), JUMP_MS);
      }
      if (inst.action === "walk-to") {
        // 도착 후 idle
        setTimeout(() => dispatch({ type: "ARRIVE", agent: inst.agent }), ARRIVE_MS);
        // 일정 시간 후 home 복귀 (action=walk + position=home), 그 다음 ARRIVE로 idle
        setTimeout(() => dispatch({ type: "RETURN_HOME", agent: inst.agent }), RETURN_HOME_MS);
        setTimeout(() => dispatch({ type: "ARRIVE", agent: inst.agent }), RETURN_HOME_MS + ARRIVE_MS);
      }
    }
  }, [dialoguePool, pushFeed]);

  // bubble sweep
  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: "BUBBLE_EXPIRE", now: Date.now() });
    }, BUBBLE_SWEEP_MS);
    return () => clearInterval(id);
  }, []);

  // wander schedule per agent
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    function scheduleWander(agent: CharacterState) {
      if (!agent.unlocked) return;
      const delay = WANDER_MIN_MS + Math.random() * (WANDER_MAX_MS - WANDER_MIN_MS);
      const t = setTimeout(() => {
        // 탭 hidden 상태면 wander 스킵 + 다음 tick 재예약
        if (pausedRef.current) {
          scheduleWander(agent);
          return;
        }
        const pos = nextWanderPosition(agent.home);
        dispatch({ type: "WANDER_TICK", agent: agent.id, newPosition: pos });

        if (shouldShowWanderBubble()) {
          const text = pickLine(dialoguePool, agent.id, "wander", lastUsedRef.current);
          if (text) {
            dispatch({
              type: "INSTRUCTION",
              instruction: { agent: agent.id, action: "idle", dialogueKey: "wander" },
              bubbleText: text,
              now: Date.now(),
            });
          }
        }

        // arrive 후 다시 스케줄
        const arriveTimer = setTimeout(() => {
          dispatch({ type: "ARRIVE", agent: agent.id });
          scheduleWander(agent);
        }, ARRIVE_MS);
        timers.push(arriveTimer);
      }, delay);
      timers.push(t);
    }

    states.forEach((s) => {
      if (s.unlocked) scheduleWander(s);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
    // 첫 마운트 시 1회만 시작 (이후 self-perpetuating)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // activity tick — 1s마다 now 갱신 (active state pulse 페이드용 + transitions 감지)
  useEffect(() => {
    const id = setInterval(() => {
      // 탭 hidden 상태면 tick 스킵
      if (pausedRef.current) return;
      const t = Date.now();
      setNow(t);

      // active → waiting 전이 감지
      const currentlyActive = new Set<AgentId>();
      for (const s of states) {
        if (s.lastEventAt !== null && t - s.lastEventAt < ACTIVE_TTL_MS) {
          currentlyActive.add(s.id);
        }
      }
      // 직전 tick에 active였는데 지금 waiting이면 feed에 push
      for (const id of wasActiveRef.current) {
        if (!currentlyActive.has(id)) {
          pushFeed({
            kind: "waiting",
            agent: id,
            message: "활동 종료 → 대기",
            at: t,
          });
        }
      }
      wasActiveRef.current = currentlyActive;
    }, ACTIVITY_TICK_MS);
    return () => clearInterval(id);
  }, [states, pushFeed]);

  return { states, handleEvent, now, feed };
}

function feedMessageFor(inst: ActionInstruction, event: RawEvent): string {
  const type = String(event.type ?? "");
  const tool = String(event.tool ?? "");
  const status = String(event.status ?? "");

  if (type === "tool_result") {
    return tool ? `${tool} ${status}` : `tool ${status}`;
  }
  if (type === "verify_complete") {
    const overall = String(event.overall ?? "");
    return `verify ${overall}`;
  }
  if (type === "error") {
    return `${tool || "tool"} error`;
  }
  return inst.dialogueKey;
}
