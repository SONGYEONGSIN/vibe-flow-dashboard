// src/app/characters/data/stage-unlock.ts
import { AGENTS, type AgentId } from "./agents";

const DEFAULT_STAGE = 1;

function normalizeStage(stage: number | null | undefined): number {
  if (stage === null || stage === undefined || Number.isNaN(stage)) return DEFAULT_STAGE;
  if (stage < 0) return DEFAULT_STAGE;
  return Math.min(4, Math.floor(stage));
}

export function isUnlocked(agent: AgentId, stage: number | null | undefined): boolean {
  const normStage = normalizeStage(stage);
  const meta = AGENTS.find((a) => a.id === agent);
  if (!meta) return false;
  return meta.unlockStage <= normStage;
}

export function unlockedAgents(stage: number | null | undefined): AgentId[] {
  const normStage = normalizeStage(stage);
  return AGENTS.filter((a) => a.unlockStage <= normStage).map((a) => a.id);
}
