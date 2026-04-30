// src/app/characters/CharacterPage.client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Stage } from "./Stage";
import { useCharacterEngine } from "./useCharacterEngine";
import { useEventsStream } from "./useEventsStream";
import dialoguePoolRaw from "./data/dialogue-pool.json";
import type { DialoguePool } from "./lib/dialogue";

const dialoguePool = dialoguePoolRaw as DialoguePool;

type Props = {
  initialStage: number;
};

export function CharacterPage({ initialStage }: Props) {
  const [connected, setConnected] = useState(false);
  const { states, handleEvent } = useCharacterEngine({
    stage: initialStage,
    dialoguePool,
  });

  useEventsStream({
    onEvent: handleEvent,
    onConnectionChange: setConnected,
  });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-8 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200">
              ← Dashboard
            </Link>
            <h1 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              🎮 Characters
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              12 에이전트가 events.jsonl에 반응합니다 · Stage {initialStage}
            </p>
          </div>
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
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-8 py-6">
        <Stage states={states} />
        <div className="text-xs text-zinc-500">
          캐릭터를 보고 싶은데 비어있다면: 사용자 프로젝트에서 코드 변경/테스트 실행 시 events.jsonl이 생성되며 캐릭터들이 반응합니다.
        </div>
      </main>
    </div>
  );
}
