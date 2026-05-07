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

  it("skill_invoked /commit → developer jump", () => {
    const r = mapEvent({ type: "skill_invoked", skill: "commit" });
    expect(r).toEqual([
      { agent: "developer", action: "jump", dialogueKey: "skill_invoked" },
    ]);
  });

  it("skill_invoked /pair → moderator jump", () => {
    const r = mapEvent({ type: "skill_invoked", skill: "pair" });
    expect(r[0].agent).toBe("moderator");
    expect(r[0].action).toBe("jump");
  });

  it("skill_invoked /retrospective → retrospective jump", () => {
    const r = mapEvent({ type: "skill_invoked", skill: "retrospective" });
    expect(r[0].agent).toBe("retrospective");
  });

  it("skill_invoked unknown skill → moderator fallback", () => {
    const r = mapEvent({ type: "skill_invoked", skill: "mystery_skill" });
    expect(r[0].agent).toBe("moderator");
  });

  it("skill_invoked 빈 skill → moderator fallback", () => {
    const r = mapEvent({ type: "skill_invoked" });
    expect(r[0].agent).toBe("moderator");
  });

  it("inbox_sent → 수신자 jump", () => {
    const r = mapEvent({ type: "inbox_sent", to: "developer", msg_type: "info", priority: "medium" });
    expect(r).toEqual([
      { agent: "developer", action: "jump", dialogueKey: "skill_invoked" },
    ]);
  });

  it("inbox_sent 미상 수신자 → moderator fallback", () => {
    const r = mapEvent({ type: "inbox_sent", to: "unknown-agent" });
    expect(r[0].agent).toBe("moderator");
    expect(r[0].action).toBe("jump");
  });

  it("perf_audit verdict=PASS → qa jump", () => {
    const r = mapEvent({ type: "perf_audit", verdict: "PASS", score: 95 });
    expect(r).toEqual([
      { agent: "qa", action: "jump", dialogueKey: "tool_pass" },
    ]);
  });

  it("perf_audit verdict=FAIL → qa idle + designer walk-to qa", () => {
    const r = mapEvent({ type: "perf_audit", verdict: "FAIL", score: 30 });
    expect(r).toContainEqual({ agent: "qa", action: "idle", dialogueKey: "tool_fail" });
    expect(r).toContainEqual({ agent: "designer", action: "walk-to", target: "qa", dialogueKey: "investigation" });
  });

  it("perf_audit verdict=WARN → qa idle + designer walk-to (FAIL과 동일 처리)", () => {
    const r = mapEvent({ type: "perf_audit", verdict: "WARN", score: 65 });
    expect(r.length).toBe(2);
    expect(r[0].agent).toBe("qa");
    expect(r[0].action).toBe("idle");
  });

  it("auto_build_start → planner clap (사이클 시작 알림)", () => {
    const r = mapEvent({
      type: "auto_build_start",
      run_id: "20260504T105917Z-6af8",
      branch: "feat/sleep-20260504T105917Z-foo",
    });
    expect(r).toEqual([
      { agent: "planner", action: "clap", dialogueKey: "auto_start" },
    ]);
  });

  it("auto_build_done → developer jump (사이클 성공)", () => {
    const r = mapEvent({
      type: "auto_build_done",
      run_id: "20260504T105917Z-6af8",
      pr_url: "https://github.com/x/y/pull/1",
    });
    expect(r).toEqual([
      { agent: "developer", action: "jump", dialogueKey: "auto_done" },
    ]);
  });

  it("auto_build_abort → qa idle + planner walk-to qa (재계획 신호)", () => {
    const r = mapEvent({
      type: "auto_build_abort",
      run_id: "20260504T105917Z-6af8",
      exit_reason: "test_failure_retry_exhausted",
    });
    expect(r).toContainEqual({ agent: "qa", action: "idle", dialogueKey: "auto_abort" });
    expect(r).toContainEqual({ agent: "planner", action: "walk-to", target: "qa", dialogueKey: "auto_abort" });
  });
});
