// src/app/characters/lib/__tests__/event-map.test.ts
import { describe, it, expect } from "vitest";
import { mapEvent } from "@/app/characters/data/event-map";

describe("event-map", () => {
  it("tool_result pass → 매칭 캐릭터 jump", () => {
    const r = mapEvent({
      type: "tool_result",
      tool: "prettier",
      status: "pass",
    });
    expect(r).toEqual([
      { agent: "designer", action: "jump", dialogueKey: "tool_pass" },
    ]);
  });

  it("tool_result fail → 매칭 + qa walk-to", () => {
    const r = mapEvent({
      type: "tool_result",
      tool: "tsc",
      status: "fail",
    });
    expect(r).toContainEqual({ agent: "developer", action: "idle", dialogueKey: "tool_fail" });
    expect(r).toContainEqual({ agent: "qa", action: "walk-to", target: "developer", dialogueKey: "investigation" });
  });

  it("verify_complete pass → validator jump", () => {
    const r = mapEvent({ type: "verify_complete", overall: "pass", results: [] });
    expect(r).toEqual([
      { agent: "validator", action: "jump", dialogueKey: "approved" },
    ]);
  });

  it("verify_complete fail → validator walk-to 첫 실패 hook", () => {
    const r = mapEvent({
      type: "verify_complete",
      overall: "fail",
      results: [
        { hook: "tsc", status: "fail" },
        { hook: "test", status: "pass" },
      ],
    });
    expect(r).toContainEqual({ agent: "validator", action: "walk-to", target: "developer", dialogueKey: "rejected" });
    expect(r).toContainEqual({ agent: "developer", action: "idle", dialogueKey: "tool_fail" });
  });

  it("unknown tool → moderator fallback", () => {
    const r = mapEvent({ type: "tool_result", tool: "mystery_tool", status: "pass" });
    expect(r[0].agent).toBe("moderator");
  });

  it("알 수 없는 type → 빈 배열", () => {
    const r = mapEvent({ type: "garbage" });
    expect(r).toEqual([]);
  });
});
