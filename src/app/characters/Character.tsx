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

export function Character({ state, now }: Props) {
  const meta = AGENT_MAP[state.id];
  // jump와 clap 모두 살짝 위로 들어올림 (현재 별도 sprite 없음 — 시각 일관성 위해 동일 처리)
  const jumpY = state.action === "jump" || state.action === "clap" ? -12 : 0;
  const flip = state.facing === "left" ? "scaleX(-1)" : "";
  const active = state.unlocked && isActive(state, now);

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
        filter: state.unlocked ? "none" : "grayscale(0.6)",
      }}
      aria-label={`${meta.name} (${state.action})`}
    >
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
      `}</style>
    </div>
  );
}
