// src/app/characters/lib/__tests__/stage-calculator.test.ts
import { describe, it, expect } from "vitest";
import { countToStage, calculateStages } from "@/app/characters/lib/stage-calculator";
import type { AgentId } from "@/app/characters/data/agents";

describe("countToStage", () => {
  it("경계 — 0 → 0", () => expect(countToStage(0)).toBe(0));
  it("경계 — 9 → 0", () => expect(countToStage(9)).toBe(0));
  it("경계 — 10 → 1", () => expect(countToStage(10)).toBe(1));
  it("경계 — 49 → 1", () => expect(countToStage(49)).toBe(1));
  it("경계 — 50 → 2", () => expect(countToStage(50)).toBe(2));
  it("경계 — 199 → 2", () => expect(countToStage(199)).toBe(2));
  it("경계 — 200 → 3", () => expect(countToStage(200)).toBe(3));
  it("경계 — 499 → 3", () => expect(countToStage(499)).toBe(3));
  it("경계 — 500 → 4", () => expect(countToStage(500)).toBe(4));
  it("매우 큰 값 — 99999 → 4", () => expect(countToStage(99999)).toBe(4));

  it("음수 → 0", () => expect(countToStage(-5)).toBe(0));
  it("NaN → 0", () => expect(countToStage(Number.NaN)).toBe(0));
  it("Infinity → 4 (모든 임계값 충족)", () => expect(countToStage(Number.POSITIVE_INFINITY)).toBe(4));
});

describe("calculateStages", () => {
  it("12 agent 모두 0 (빈 counts)", () => {
    const stages = calculateStages({} as Record<AgentId, number>);
    const ids: AgentId[] = [
      "planner", "designer", "developer", "qa", "security", "validator",
      "feedback", "moderator", "comparator", "retrospective", "grader", "skill-reviewer",
    ];
    for (const id of ids) {
      expect(stages[id]).toBe(0);
    }
  });

  it("누락된 키는 0 fallback", () => {
    const stages = calculateStages({ developer: 100 } as Record<AgentId, number>);
    expect(stages.developer).toBe(2); // 100 ∈ [50, 199]
    expect(stages.planner).toBe(0);
    expect(stages.qa).toBe(0);
  });

  it("혼합 카운트 — 각 agent 별도 stage", () => {
    const stages = calculateStages({
      planner: 0,
      developer: 25,
      qa: 200,
      designer: 600,
    } as Record<AgentId, number>);
    expect(stages.planner).toBe(0);
    expect(stages.developer).toBe(1);
    expect(stages.qa).toBe(3);
    expect(stages.designer).toBe(4);
  });
});
