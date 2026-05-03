// src/app/characters/data/agent-event-map.ts
//
// 카운트 전용 매핑 — 한 이벤트가 어떤 에이전트의 카운트로 +1 되는가.
// 액션 트리거는 event-map.ts(SKILL_TO_AGENT/TOOL_TO_AGENT)가 담당.
// SKILL_TO_AGENT 변경 시 이 파일도 함께 검토할 것 (drift 방지).
//
// 매처 우선순위: skill > tool > status > type 단독.
// 한 이벤트는 첫 매칭된 agent의 카운트만 +1 한다 (deterministic).

import type { AgentId } from "./agents";

export type EventMatcher = {
  type: string;
  tool?: string;
  skill?: string;
  status?: string;
};

export const AGENT_COUNT_RULES: Record<AgentId, EventMatcher[]> = {
  planner: [
    { type: "skill_invoked", skill: "plan" },
    { type: "skill_invoked", skill: "brainstorm" },
    { type: "skill_invoked", skill: "scaffold" },
    { type: "skill_invoked", skill: "onboard" },
    { type: "skill_invoked", skill: "finish" },
    { type: "skill_invoked", skill: "writing-plans" },
    { type: "skill_invoked", skill: "executing-plans" },
    { type: "plan_created" },
    { type: "plan_step_complete" },
    { type: "brainstorm" },
  ],
  designer: [
    { type: "skill_invoked", skill: "design-sync" },
    { type: "tool_result", tool: "prettier" },
    { type: "tool_result", tool: "eslint" },
  ],
  developer: [
    { type: "skill_invoked", skill: "commit" },
    { type: "skill_invoked", skill: "release" },
    { type: "commit_created" },
    { type: "tool_result", tool: "tsc" },
  ],
  qa: [
    { type: "skill_invoked", skill: "test" },
    { type: "skill_invoked", skill: "verify" },
    { type: "skill_invoked", skill: "fewer-permission-prompts" },
    { type: "skill_invoked", skill: "perf-audit" },
    { type: "tool_result", tool: "test" },
    { type: "tool_result", tool: "vitest" },
    { type: "tool_result", tool: "playwright" },
    { type: "verify_complete" },
    { type: "perf_audit" },
  ],
  security: [
    { type: "skill_invoked", skill: "security" },
    { type: "skill_invoked", skill: "security-review" },
    { type: "security_lint" },
  ],
  validator: [
    { type: "skill_invoked", skill: "review" },
    { type: "skill_invoked", skill: "review-pr" },
    { type: "skill_invoked", skill: "receive-review" },
  ],
  feedback: [
    { type: "skill_invoked", skill: "feedback" },
  ],
  moderator: [
    { type: "skill_invoked", skill: "pair" },
    { type: "skill_invoked", skill: "discuss" },
    { type: "skill_invoked", skill: "menu" },
    { type: "skill_invoked", skill: "worktree" },
    { type: "skill_invoked", skill: "budget" },
  ],
  comparator: [
    { type: "skill_invoked", skill: "evolve" },
  ],
  retrospective: [
    { type: "skill_invoked", skill: "retrospective" },
    { type: "skill_invoked", skill: "retro" },
    { type: "skill_invoked", skill: "learn" },
  ],
  grader: [
    { type: "skill_invoked", skill: "telemetry" },
    { type: "skill_invoked", skill: "status" },
    { type: "skill_invoked", skill: "inbox" },
  ],
  "skill-reviewer": [
    { type: "skill_invoked", skill: "skill-creator" },
    { type: "skill_invoked", skill: "init" },
  ],
};
