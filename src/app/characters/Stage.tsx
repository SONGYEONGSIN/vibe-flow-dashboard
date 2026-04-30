"use client";

import { Character } from "./Character";
import { ROOM } from "./lib/wander";
import type { CharacterState } from "./lib/reducer";

const WALK_TRANSITION_MS = 600;

type Props = {
  states: CharacterState[];
};

export function Stage({ states }: Props) {
  return (
    <div className="mx-auto w-full max-w-5xl rounded-lg border-2 border-zinc-800 bg-zinc-900 p-2">
      <div
        className="relative w-full overflow-hidden rounded-md"
        style={{
          aspectRatio: `${ROOM.width} / ${ROOM.height}`,
          background: "linear-gradient(#1a2238 0 60%, #4a3520 60% 100%)",
        }}
      >
        {/* 픽셀 디테일 (창문/그림) — 후속에 픽셀 배경 PNG로 교체 예정.
            지금은 천장 띠 영역(0~12%)에만 배치하여 캐릭터(home y ≈ 30% / 80%)와 겹치지 않게 함. */}
        <div
          aria-hidden
          className="absolute"
          style={{
            left: "6%", top: "3%", width: "5%", height: "8%",
            background: "linear-gradient(#5a8fd8,#2a5db0)",
            border: "1px solid #14161f",
          }}
        />
        <div
          aria-hidden
          className="absolute"
          style={{
            left: "13%", top: "3%", width: "5%", height: "8%",
            background: "linear-gradient(#5a8fd8,#2a5db0)",
            border: "1px solid #14161f",
          }}
        />
        <div
          aria-hidden
          className="absolute"
          style={{
            left: "82%", top: "3%", width: "6%", height: "9%",
            background: "#d97757",
            border: "1px solid #14161f",
          }}
        />

        {/* 캐릭터 anchor — 좌표는 ROOM 기준 percentage */}
        {states.map((s) => (
          <div
            key={s.id}
            className="absolute"
            style={{
              left: `${(s.position.x / ROOM.width) * 100}%`,
              top: `${(s.position.y / ROOM.height) * 100}%`,
              transition:
                s.action === "walk"
                  ? `left ${WALK_TRANSITION_MS}ms linear, top ${WALK_TRANSITION_MS}ms linear`
                  : "none",
            }}
          >
            <Character state={s} />
          </div>
        ))}
      </div>
    </div>
  );
}
