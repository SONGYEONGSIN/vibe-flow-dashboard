"use client";

import { AGENT_MAP } from "./data/agents";
import { SpeechBubble } from "./SpeechBubble";
import { ChibiSprite } from "./ChibiSprite";
import { isActive, type CharacterState } from "./lib/reducer";

const SLOT_WIDTH = 48;
const SLOT_HEIGHT = 64;

type Props = {
  state: CharacterState;
  now: number;
};

// Stage 0~4 시각 효과 매핑 — 픽셀 변경 없이 CSS만 사용
const STAGE_GLOW_ALPHA = ["00", "44", "66", "99", "cc"]; // hex8 alpha
const STAGE_GLOW_BLUR = [0, 2, 4, 7, 10];
const STAGE_GLOW_INSET = [0, -6, -8, -10, -12];
const STAGE_SATURATE = [1, 1, 1.05, 1.1, 1.15];

function clampStage(s: number | undefined): number {
  if (typeof s !== "number" || Number.isNaN(s)) return 0;
  return Math.max(0, Math.min(4, Math.floor(s)));
}

export function Character({ state, now }: Props) {
  const meta = AGENT_MAP[state.id];
  // jump와 clap 모두 살짝 위로 들어올림 (현재 별도 sprite 없음 — 시각 일관성 위해 동일 처리)
  const jumpY = state.action === "jump" || state.action === "clap" ? -12 : 0;
  const flip = state.facing === "left" ? "scaleX(-1)" : "";
  const active = state.unlocked && isActive(state, now);
  const stage = clampStage(state.autoStage);
  const showStageGlow = state.unlocked && stage > 0;
  const sat = STAGE_SATURATE[stage];

  return (
    <div
      className="vf-character-root absolute"
      style={{
        width: SLOT_WIDTH,
        height: SLOT_HEIGHT,
        left: -SLOT_WIDTH / 2,
        top: -SLOT_HEIGHT,
        transform: `translateY(${jumpY}px) scale(${active ? 1.08 : 1})`,
        transition: "transform 300ms ease-out",
        opacity: state.unlocked ? 1 : 0.35,
        filter: state.unlocked
          ? sat > 1 ? `saturate(${sat})` : "none"
          : "grayscale(0.6)",
      }}
      aria-label={`${meta.name} (${state.action}, stage ${stage})`}
    >
      {/* Stage 글로우 — 자기 색 기반 누적 숙련도 표현 (active와 별개 레이어, 아래) */}
      {showStageGlow && (
        <span
          aria-hidden
          className={`vf-stage-glow absolute${stage === 4 ? " vf-stage-pulse" : ""}`}
          style={{
            inset: STAGE_GLOW_INSET[stage],
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${meta.mainColor}${STAGE_GLOW_ALPHA[stage]}, transparent)`,
            filter: `blur(${STAGE_GLOW_BLUR[stage]}px)`,
            pointerEvents: "none",
          }}
        />
      )}
      {/* active 글로우 ring */}
      {active && (
        <span
          aria-hidden
          className="absolute inset-[-6px] rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(217,119,87,0.45), rgba(217,119,87,0))",
            animation: "vfPulse 1.6s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transform: flip,
          transformOrigin: "center",
        }}
      >
        <ChibiSprite agentId={state.id} />
      </div>
      {state.bubble && (
        <SpeechBubble text={state.bubble.text} expiresAt={state.bubble.expiresAt} />
      )}
      <span
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold"
        style={{
          color: active ? "#f5b899" : state.unlocked ? "#d2d6e0" : "#7a8090",
          textShadow: active ? "0 0 6px rgba(217,119,87,0.8)" : "none",
        }}
      >
        {meta.id}
        {!state.unlocked && (
          <span className="ml-1 font-normal text-zinc-400">· Stage {meta.unlockStage}</span>
        )}
      </span>

      {/* keyframes (전역 reduced-motion은 CharacterPage에서 한 번에 처리) */}
      <style>{`
        @keyframes vfPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.18); }
        }
        @keyframes vfStagePulse {
          0%, 100% { opacity: 0.85; }
          50%      { opacity: 1; }
        }
        .vf-stage-pulse {
          animation: vfStagePulse 4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .vf-stage-pulse { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
