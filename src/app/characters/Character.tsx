"use client";

import { AGENT_MAP } from "./data/agents";
import { SpeechBubble } from "./SpeechBubble";
import type { CharacterState } from "./lib/reducer";

const SPRITE_SIZE = 48;

type Props = {
  state: CharacterState;
};

export function Character({ state }: Props) {
  const meta = AGENT_MAP[state.id];
  const spriteSuffix =
    state.action === "walk" ? `walk-${state.facing}` : `idle-${state.facing}`;
  const spriteUrl = `${meta.spritePath}-${spriteSuffix}.png`;

  const jumpY = state.action === "jump" ? -12 : 0;

  return (
    <div
      className="absolute"
      style={{
        width: SPRITE_SIZE,
        height: SPRITE_SIZE,
        left: -SPRITE_SIZE / 2,
        top: -SPRITE_SIZE,
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
      <div
        className="h-full w-full"
        style={{
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: meta.mainColor,
          imageRendering: "pixelated",
          borderRadius: 4,
        }}
      />
      {state.bubble && (
        <SpeechBubble text={state.bubble.text} expiresAt={state.bubble.expiresAt} />
      )}
      {!state.unlocked && (
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] text-zinc-300">
          Stage {meta.unlockStage}
        </span>
      )}
    </div>
  );
}
