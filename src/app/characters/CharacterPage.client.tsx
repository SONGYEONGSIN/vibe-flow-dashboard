// src/app/characters/CharacterPage.client.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Stage } from "./Stage";
import { ActivityFeed } from "./ActivityFeed";
import { useCharacterEngine } from "./useCharacterEngine";
import { useEventsStream } from "./useEventsStream";
import { useStageCounts } from "./useStageCounts";
import dialoguePoolRaw from "./data/dialogue-pool.json";
import type { DialoguePool } from "./lib/dialogue";
import { AGENTS, type AgentId } from "./data/agents";

const dialoguePool = dialoguePoolRaw as DialoguePool;
const STAGE_STORAGE_KEY = "vf.characters.stage.override";

type Props = {
  initialStage: number;
  initialCounts: Record<AgentId, number>;
};

function forceStagesAll(value: number): Record<AgentId, number> {
  const out = {} as Record<AgentId, number>;
  for (const a of AGENTS) out[a.id] = value;
  return out;
}

function loadStoredStage(): number | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STAGE_STORAGE_KEY);
  if (v === null) return null;
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return null;
  if (n < 0 || n > 4) return null;
  return n;
}

export function CharacterPage({ initialStage, initialCounts }: Props) {
  const [connected, setConnected] = useState(false);
  // override가 있으면 우선, 없으면 .vibe-flow.json의 initialStage 사용
  const [stage, setStage] = useState<number>(initialStage);
  const [hasOverride, setHasOverride] = useState<boolean>(false);

  const { stages: autoStages, ingest } = useStageCounts({ initialCounts });

  // override 모드 시 모든 캐릭터에 글로벌 stage 강제 (preview 의미). 해제 시 자동 stages 복귀.
  const effectiveAutoStages = useMemo(
    () => (hasOverride ? forceStagesAll(stage) : autoStages),
    [hasOverride, stage, autoStages],
  );

  // 마운트 시 localStorage 복원
  useEffect(() => {
    const stored = loadStoredStage();
    if (stored !== null && stored !== initialStage) {
      setStage(stored);
      setHasOverride(true);
    }
  }, [initialStage]);

  const onChangeStage = (next: number) => {
    setStage(next);
    if (next === initialStage) {
      // initialStage와 같으면 override 해제 (정상 흐름)
      window.localStorage.removeItem(STAGE_STORAGE_KEY);
      setHasOverride(false);
    } else {
      window.localStorage.setItem(STAGE_STORAGE_KEY, String(next));
      setHasOverride(true);
    }
  };

  const { states, handleEvent, now, feed } = useCharacterEngine({
    stage,
    dialoguePool,
    autoStages: effectiveAutoStages,
  });

  const onEvent = useCallback(
    (event: Record<string, unknown>) => {
      handleEvent(event);
      ingest(event);
    },
    [handleEvent, ingest],
  );

  useEventsStream({
    onEvent,
    onConnectionChange: setConnected,
  });

  return (
    <div className="vf-characters-page flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .vf-characters-page,
          .vf-characters-page *,
          .vf-characters-page *::before,
          .vf-characters-page *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
      <header className="border-b border-zinc-200 bg-white px-8 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200">
              ← Dashboard
            </Link>
            <h1 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              🎮 Characters
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              12 에이전트가 events.jsonl에 반응합니다
              {hasOverride && (
                <span className="ml-2 inline-block rounded bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-orange-500">
                  preview
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Stage selector */}
            <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold">Stage</span>
              <select
                value={stage}
                onChange={(e) => onChangeStage(parseInt(e.target.value, 10))}
                className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                aria-label="Stage 선택"
              >
                {[0, 1, 2, 3, 4].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {hasOverride && (
                <button
                  type="button"
                  onClick={() => onChangeStage(initialStage)}
                  className="text-[10px] text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-200"
                  title=".vibe-flow.json 값으로 복원"
                >
                  reset
                </button>
              )}
            </label>
            {/* Connection */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  connected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {connected ? "live" : "연결 시도 중"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-8 py-6">
        <Stage states={states} currentStage={stage} now={now} />
        <ActivityFeed feed={feed} now={now} />
        <div className="text-xs text-zinc-500">
          캐릭터를 보고 싶은데 비어있다면: 사용자 프로젝트에서 코드 변경/테스트 실행 시 events.jsonl이 생성되며 캐릭터들이 반응합니다.
          {hasOverride && " · 현재 Stage는 미리보기(preview)로 brand new로 복원하려면 reset."}
        </div>
      </main>
    </div>
  );
}
