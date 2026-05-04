// src/app/characters/lib/__tests__/event-counter.test.ts
import { describe, it, expect } from "vitest";
import { countEvent, countEvents } from "@/app/characters/lib/event-counter";
import { AGENT_COUNT_RULES } from "@/app/characters/data/agent-event-map";
import type { AgentId } from "@/app/characters/data/agents";

describe("countEvent", () => {
  it("commit_created → developer", () => {
    expect(countEvent({ type: "commit_created" })).toBe("developer");
  });

  it("plan_created → planner", () => {
    expect(countEvent({ type: "plan_created" })).toBe("planner");
  });

  it("skill_invoked(plan) → planner", () => {
    expect(countEvent({ type: "skill_invoked", skill: "plan" })).toBe("planner");
  });

  it("skill_invoked(brainstorm) → planner", () => {
    expect(countEvent({ type: "skill_invoked", skill: "brainstorm" })).toBe("planner");
  });

  it("skill_invoked(release) → developer", () => {
    expect(countEvent({ type: "skill_invoked", skill: "release" })).toBe("developer");
  });

  it("skill_invoked(commit) → developer", () => {
    expect(countEvent({ type: "skill_invoked", skill: "commit" })).toBe("developer");
  });

  it("tool_result(prettier) → designer", () => {
    expect(countEvent({ type: "tool_result", tool: "prettier", status: "pass" })).toBe("designer");
  });

  it("tool_result(eslint) → designer", () => {
    expect(countEvent({ type: "tool_result", tool: "eslint", status: "fail" })).toBe("designer");
  });

  it("tool_result(tsc) → developer", () => {
    expect(countEvent({ type: "tool_result", tool: "tsc", status: "pass" })).toBe("developer");
  });

  it("tool_result(vitest) → qa", () => {
    expect(countEvent({ type: "tool_result", tool: "vitest", status: "pass" })).toBe("qa");
  });

  it("verify_complete → qa", () => {
    expect(countEvent({ type: "verify_complete", overall: "pass" })).toBe("qa");
  });

  it("perf_audit → qa", () => {
    expect(countEvent({ type: "perf_audit", verdict: "PASS" })).toBe("qa");
  });

  it("skill_invoked(security) → security", () => {
    expect(countEvent({ type: "skill_invoked", skill: "security" })).toBe("security");
  });

  it("security_lint → security", () => {
    expect(countEvent({ type: "security_lint" })).toBe("security");
  });

  it("skill_invoked(review-pr) → validator", () => {
    expect(countEvent({ type: "skill_invoked", skill: "review-pr" })).toBe("validator");
  });

  it("skill_invoked(receive-review) → validator", () => {
    expect(countEvent({ type: "skill_invoked", skill: "receive-review" })).toBe("validator");
  });

  it("skill_invoked(feedback) → feedback", () => {
    expect(countEvent({ type: "skill_invoked", skill: "feedback" })).toBe("feedback");
  });

  it("skill_invoked(pair) → moderator", () => {
    expect(countEvent({ type: "skill_invoked", skill: "pair" })).toBe("moderator");
  });

  it("skill_invoked(menu) → moderator", () => {
    expect(countEvent({ type: "skill_invoked", skill: "menu" })).toBe("moderator");
  });

  it("skill_invoked(evolve) → comparator", () => {
    expect(countEvent({ type: "skill_invoked", skill: "evolve" })).toBe("comparator");
  });

  it("skill_invoked(retrospective) → retrospective", () => {
    expect(countEvent({ type: "skill_invoked", skill: "retrospective" })).toBe("retrospective");
  });

  it("skill_invoked(learn) → retrospective", () => {
    expect(countEvent({ type: "skill_invoked", skill: "learn" })).toBe("retrospective");
  });

  it("skill_invoked(telemetry) → grader", () => {
    expect(countEvent({ type: "skill_invoked", skill: "telemetry" })).toBe("grader");
  });

  it("skill_invoked(inbox) → grader", () => {
    expect(countEvent({ type: "skill_invoked", skill: "inbox" })).toBe("grader");
  });

  it("skill_invoked(skill-creator) → skill-reviewer", () => {
    expect(countEvent({ type: "skill_invoked", skill: "skill-creator" })).toBe("skill-reviewer");
  });

  it("skill_invoked(init) → skill-reviewer", () => {
    expect(countEvent({ type: "skill_invoked", skill: "init" })).toBe("skill-reviewer");
  });

  it("미매칭 (unknown type) → null", () => {
    expect(countEvent({ type: "totally-unknown-event" })).toBeNull();
  });

  it("미매칭 (skill_invoked with unknown skill) → null", () => {
    expect(countEvent({ type: "skill_invoked", skill: "totally-unknown-skill" })).toBeNull();
  });

  it("12 agent 모두 최소 1개 룰 — assert", () => {
    const agents = Object.keys(AGENT_COUNT_RULES) as AgentId[];
    expect(agents).toHaveLength(12);
    for (const a of agents) {
      expect(AGENT_COUNT_RULES[a].length).toBeGreaterThan(0);
    }
  });
});

describe("countEvents", () => {
  it("빈 배열 → 모든 agent 0", () => {
    const result = countEvents([]);
    expect(Object.keys(result)).toHaveLength(12);
    for (const a of Object.keys(result) as AgentId[]) {
      expect(result[a]).toBe(0);
    }
  });

  it("누적 — developer 3, planner 2, qa 1", () => {
    const events = [
      { type: "commit_created" },
      { type: "skill_invoked", skill: "commit" },
      { type: "skill_invoked", skill: "release" },
      { type: "skill_invoked", skill: "plan" },
      { type: "plan_created" },
      { type: "verify_complete" },
    ];
    const result = countEvents(events);
    expect(result.developer).toBe(3);
    expect(result.planner).toBe(2);
    expect(result.qa).toBe(1);
    expect(result.designer).toBe(0);
  });

  it("미매칭 이벤트는 무시", () => {
    const events = [
      { type: "totally-unknown" },
      { type: "commit_created" },
      { type: "skill_invoked", skill: "unknown-skill" },
    ];
    const result = countEvents(events);
    expect(result.developer).toBe(1);
    // 다른 agent 모두 0
    expect(result.planner).toBe(0);
    expect(result.qa).toBe(0);
  });
});
