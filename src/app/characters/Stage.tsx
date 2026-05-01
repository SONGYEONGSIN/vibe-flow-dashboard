"use client";

import { Character } from "./Character";
import { ROOM, stageRowY } from "./lib/wander";
import type { CharacterState } from "./lib/reducer";
import { AGENTS } from "./data/agents";

const WALK_TRANSITION_MS = 600;

const STAGE_INFO = [
  { stage: 0, name: "기획·디자인", desc: "계획 + UI 단계" },
  { stage: 1, name: "도구 사용",   desc: "코드 + 테스트 단계" },
  { stage: 2, name: "협업",       desc: "/pair, /discuss 사용" },
  { stage: 3, name: "자가 평가",   desc: "보안 + 비교 + 회고" },
  { stage: 4, name: "자가 진화",   desc: "extension 영역" },
];

type Props = {
  states: CharacterState[];
  currentStage: number;
};

export function Stage({ states, currentStage }: Props) {
  return (
    <div className="mx-auto w-full max-w-5xl rounded-lg border-2 border-zinc-800 bg-zinc-900 p-2">
      <div
        className="relative w-full overflow-hidden rounded-md"
        style={{
          aspectRatio: `${ROOM.width} / ${ROOM.height}`,
          background: "#0f1218",
        }}
      >
        {/* Stage row 배경 + 라벨 */}
        {STAGE_INFO.map((s) => {
          const yPx = stageRowY(s.stage);
          const yPct = (yPx / ROOM.height) * 100;
          const isUnlocked = s.stage <= currentStage;
          const rowHeightPct = 17;

          return (
            <div key={s.stage}>
              {/* row 배경 */}
              <div
                aria-hidden
                className="absolute left-0 right-0"
                style={{
                  top: `${yPct - rowHeightPct / 2}%`,
                  height: `${rowHeightPct}%`,
                  background: isUnlocked
                    ? "linear-gradient(180deg, rgba(217,119,87,0.04), rgba(217,119,87,0.10))"
                    : "linear-gradient(180deg, rgba(110,116,144,0.03), rgba(110,116,144,0.08))",
                  borderTop: "1px dashed rgba(110,116,144,0.15)",
                  borderBottom: "1px dashed rgba(110,116,144,0.15)",
                }}
              />
              {/* row 라벨 (좌측) */}
              <div
                className="absolute flex items-center"
                style={{
                  left: "1%",
                  top: `${yPct - rowHeightPct / 2}%`,
                  height: `${rowHeightPct}%`,
                  pointerEvents: "none",
                }}
              >
                <div
                  className="flex flex-col"
                  style={{
                    fontSize: "9px",
                    lineHeight: "1.2",
                    color: isUnlocked ? "#d97757" : "#5a607a",
                    fontWeight: 600,
                  }}
                >
                  <span>STAGE {s.stage}</span>
                  <span style={{ fontWeight: 400, opacity: 0.85 }}>{s.name}</span>
                  <span style={{ fontSize: "7.5px", color: "#6e7490", fontWeight: 400 }}>
                    {s.desc}
                  </span>
                  {!isUnlocked && (
                    <span style={{ fontSize: "7.5px", color: "#7a8290", marginTop: 1 }}>
                      🔒 잠금
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

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

      {/* Stage legend (룸 아래 — 빠른 참조) */}
      <div className="mt-2 grid grid-cols-5 gap-1 px-1 text-[10px]">
        {STAGE_INFO.map((s) => {
          const isCurrent = s.stage === currentStage;
          const isReached = s.stage <= currentStage;
          return (
            <div
              key={s.stage}
              className="rounded p-1.5"
              style={{
                background: isCurrent
                  ? "rgba(217,119,87,0.18)"
                  : isReached
                    ? "rgba(217,119,87,0.06)"
                    : "rgba(110,116,144,0.05)",
                border: isCurrent
                  ? "1px solid rgba(217,119,87,0.5)"
                  : "1px solid rgba(110,116,144,0.15)",
              }}
            >
              <div
                style={{
                  color: isReached ? "#d97757" : "#7a8290",
                  fontWeight: 600,
                  fontSize: "10px",
                }}
              >
                Stage {s.stage} · {s.name}
                {isCurrent && <span className="ml-1 text-[9px]">현재</span>}
              </div>
              <div className="mt-0.5 text-[9px] leading-tight text-zinc-400">{s.desc}</div>
              <div className="mt-1 text-[9px] leading-tight text-zinc-500">
                {agentNamesForStage(s.stage)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function agentNamesForStage(stage: number): string {
  return AGENTS.filter((a) => a.unlockStage === stage)
    .map((a) => a.id)
    .join(", ");
}
