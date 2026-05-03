// src/app/characters/lib/stage-calculator.ts
//
// pure 함수 — 카운트 → Stage(0~4). 임계값은 data/stage-thresholds.json.

import thresholds from "../data/stage-thresholds.json";
import { AGENT_COUNT_RULES } from "../data/agent-event-map";
import type { AgentId } from "../data/agents";

const STAGES: Array<{ min: number }> = thresholds.stages;

/** 단일 카운트를 Stage(0~4)로 매핑. 음수/NaN → 0. Infinity → 최대 stage. */
export function countToStage(count: number): number {
  if (Number.isNaN(count) || count < 0) return 0;
  let stage = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (count >= STAGES[i].min) stage = i;
    else break;
  }
  return stage;
}

/** 모든 12 에이전트의 stage 산출. counts에 누락된 키는 0으로 처리. */
export function calculateStages(
  counts: Record<AgentId, number> | Partial<Record<AgentId, number>>
): Record<AgentId, number> {
  const stages: Record<AgentId, number> = {} as Record<AgentId, number>;
  for (const agent of Object.keys(AGENT_COUNT_RULES) as AgentId[]) {
    const c = counts[agent];
    stages[agent] = countToStage(typeof c === "number" ? c : 0);
  }
  return stages;
}
