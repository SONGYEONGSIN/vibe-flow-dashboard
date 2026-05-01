// src/app/characters/lib/__tests__/stage-unlock.test.ts
import { describe, it, expect } from "vitest";
import { isUnlocked, unlockedAgents } from "@/app/characters/data/stage-unlock";

describe("stage-unlock", () => {
  it("Stage 0에서 planner/designer만 unlock", () => {
    expect(isUnlocked("planner", 0)).toBe(true);
    expect(isUnlocked("designer", 0)).toBe(true);
    expect(isUnlocked("developer", 0)).toBe(false);
    expect(isUnlocked("validator", 0)).toBe(false);
  });

  it("Stage 2에서 validator unlock", () => {
    expect(isUnlocked("validator", 2)).toBe(true);
    expect(isUnlocked("security", 2)).toBe(false);
  });

  it("Stage 4에서 모든 캐릭터 unlock", () => {
    const all = unlockedAgents(4);
    expect(all).toHaveLength(12);
  });

  it("Stage 1 default 적용 (음수/null 처리)", () => {
    expect(isUnlocked("developer", -1)).toBe(true); // -1 → 1로 보정
    expect(isUnlocked("developer", null as unknown as number)).toBe(true);
  });
});
