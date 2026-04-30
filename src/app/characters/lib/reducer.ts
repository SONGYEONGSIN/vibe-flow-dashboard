// src/app/characters/lib/reducer.ts
import { AGENTS, type AgentId } from "@/app/characters/data/agents";
import { isUnlocked } from "@/app/characters/data/stage-unlock";
import type { ActionInstruction, CharacterAction } from "@/app/characters/data/event-map";
import { characterHome, meetingPosition } from "./wander";

export type CharacterState = {
  id: AgentId;
  home: { x: number; y: number };
  position: { x: number; y: number };
  facing: "left" | "right";
  action: "idle" | "walk" | "jump" | "clap";
  bubble: { text: string; expiresAt: number } | null;
  usageCount: number;
  unlocked: boolean;
};

export const BUBBLE_TTL_MS = 4000;

export function initialStates(stage: number | null | undefined): CharacterState[] {
  return AGENTS.map((meta, idx) => {
    const home = characterHome(idx);
    return {
      id: meta.id,
      home,
      position: home,
      facing: "right" as const,
      action: "idle" as const,
      bubble: null,
      usageCount: 0,
      unlocked: isUnlocked(meta.id, stage),
    };
  });
}

export type ReducerAction =
  | { type: "INSTRUCTION"; instruction: ActionInstruction; bubbleText: string | null; now: number }
  | { type: "WANDER_TICK"; agent: AgentId; newPosition: { x: number; y: number } }
  | { type: "ARRIVE"; agent: AgentId }
  | { type: "JUMP_END"; agent: AgentId }
  | { type: "RETURN_HOME"; agent: AgentId }
  | { type: "BUBBLE_EXPIRE"; now: number };

function update(states: CharacterState[], id: AgentId, patch: Partial<CharacterState>): CharacterState[] {
  return states.map((s) => (s.id === id ? { ...s, ...patch } : s));
}

function findState(states: CharacterState[], id: AgentId): CharacterState | undefined {
  return states.find((s) => s.id === id);
}

export function characterReducer(states: CharacterState[], action: ReducerAction): CharacterState[] {
  switch (action.type) {
    case "INSTRUCTION": {
      const inst = action.instruction;
      const me = findState(states, inst.agent);
      if (!me || !me.unlocked) return states;

      const bubble = action.bubbleText
        ? { text: action.bubbleText, expiresAt: action.now + BUBBLE_TTL_MS }
        : me.bubble;
      const usage = me.usageCount + 1;

      if (inst.action === "jump") {
        return update(states, inst.agent, { action: "jump", bubble, usageCount: usage });
      }
      if (inst.action === "clap") {
        return update(states, inst.agent, { action: "clap", bubble, usageCount: usage });
      }
      if (inst.action === "idle") {
        return update(states, inst.agent, { action: "idle", bubble, usageCount: usage });
      }
      if (inst.action === "walk-to" && inst.target) {
        const target = findState(states, inst.target);
        if (!target) return states;
        const dest = meetingPosition(me.position, target.home);
        const facing: "left" | "right" = dest.x >= me.position.x ? "right" : "left";
        return update(states, inst.agent, {
          action: "walk",
          position: dest,
          facing,
          bubble,
          usageCount: usage,
        });
      }
      return states;
    }

    case "WANDER_TICK": {
      const me = findState(states, action.agent);
      if (!me || !me.unlocked || me.action === "walk") return states;
      const facing: "left" | "right" = action.newPosition.x >= me.position.x ? "right" : "left";
      return update(states, action.agent, { action: "walk", position: action.newPosition, facing });
    }

    case "ARRIVE": {
      const me = findState(states, action.agent);
      if (!me) return states;
      return update(states, action.agent, { action: "idle" });
    }

    case "JUMP_END": {
      return update(states, action.agent, { action: "idle" });
    }

    case "RETURN_HOME": {
      const me = findState(states, action.agent);
      if (!me) return states;
      const facing: "left" | "right" = me.home.x >= me.position.x ? "right" : "left";
      return update(states, action.agent, { action: "walk", position: me.home, facing });
    }

    case "BUBBLE_EXPIRE": {
      return states.map((s) => {
        if (!s.bubble) return s;
        if (s.bubble.expiresAt <= action.now) return { ...s, bubble: null };
        return s;
      });
    }
  }
}
