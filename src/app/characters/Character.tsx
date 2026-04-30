"use client";

import { AGENT_MAP } from "./data/agents";
import { SpeechBubble } from "./SpeechBubble";
import { ChibiSprite } from "./ChibiSprite";
import type { CharacterState } from "./lib/reducer";

const SLOT_WIDTH = 48;
const SLOT_HEIGHT = 64;

type Props = {
  state: CharacterState;
};

export function Character({ state }: Props) {
  const meta = AGENT_MAP[state.id];
  const jumpY = state.action === "jump" ? -12 : 0;
  const flip = state.facing === "left" ? "scaleX(-1)" : "";

  return (
    <div
      className="absolute"
      style={{
        width: SLOT_WIDTH,
        height: SLOT_HEIGHT,
        left: -SLOT_WIDTH / 2,
        top: -SLOT_HEIGHT,
        transform: `translateY(${jumpY}px)`,
        transition:
          state.action === "jump"
            ? "transform 250ms cubic-bezier(.5,1.5,.5,1)"
            : "none",
        opacity: state.unlocked ? 1 : 0.35,
        filter: state.unlocked ? "none" : "grayscale(0.6)",
      }}
      aria-label={`${meta.name} (${state.action})`}
    >
      <div style={{ width: "100%", height: "100%", transform: flip, transformOrigin: "center" }}>
        <ChibiSprite agentId={state.id} />
      </div>
      {state.bubble && (
        <SpeechBubble text={state.bubble.text} expiresAt={state.bubble.expiresAt} />
      )}
      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold text-zinc-200">
        {meta.id}
        {!state.unlocked && (
          <span className="ml-1 font-normal text-zinc-400">· Stage {meta.unlockStage}</span>
        )}
      </span>
    </div>
  );
}
