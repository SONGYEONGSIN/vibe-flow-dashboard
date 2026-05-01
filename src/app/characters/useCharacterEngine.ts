"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { mapEvent } from "./data/event-map";
import { pickLine, shouldShowWanderBubble, type DialoguePool } from "./lib/dialogue";
import { nextWanderPosition } from "./lib/wander";
import { characterReducer, initialStates, type CharacterState, BUBBLE_TTL_MS } from "./lib/reducer";
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

export function useCharacterEngine({ stage, dialoguePool }: Options) {
  const [states, dispatch] = useReducer(characterReducer, stage, initialStates);
  const lastUsedRef = useRef<Map<string, string[]>>(new Map());

  const handleEvent = useCallback((event: RawEvent) => {
    const instructions = mapEvent(event);
    const now = Date.now();
    for (const inst of instructions) {
      const text = pickLine(dialoguePool, inst.agent, inst.dialogueKey, lastUsedRef.current);
      dispatch({ type: "INSTRUCTION", instruction: inst, bubbleText: text, now });

      if (inst.action === "jump" || inst.action === "clap") {
        setTimeout(() => dispatch({ type: "JUMP_END", agent: inst.agent }), JUMP_MS);
      }
      if (inst.action === "walk-to") {
        setTimeout(() => dispatch({ type: "ARRIVE", agent: inst.agent }), ARRIVE_MS);
      }
    }
  }, [dialoguePool]);

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

  return { states, handleEvent };
}
