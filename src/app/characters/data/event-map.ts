// src/app/characters/data/event-map.ts
import type { AgentId } from "./agents";

export type CharacterAction = "idle" | "walk-to" | "jump" | "clap";

export type ActionInstruction = {
  agent: AgentId;
  action: CharacterAction;
  target?: AgentId;       // walk-to 시 대상
  dialogueKey: string;    // dialogue-pool.json의 contextKey
};

const TOOL_TO_AGENT: Record<string, AgentId> = {
  prettier: "designer",
  eslint: "designer",
  tsc: "developer",
  test: "qa",
  vitest: "qa",
  playwright: "qa",
};

// 스킬 이름(또는 그 prefix) → 담당 에이전트 매핑.
// 매칭 안 되면 FALLBACK_AGENT.
const SKILL_TO_AGENT: Record<string, AgentId> = {
  // planner
  plan: "planner",
  brainstorm: "planner",
  scaffold: "planner",
  onboard: "planner",
  finish: "planner",
  // designer
  "design-sync": "designer",
  // developer
  commit: "developer",
  release: "developer",
  // qa
  test: "qa",
  verify: "qa",
  "fewer-permission-prompts": "qa",
  // security
  security: "security",
  "security-review": "security",
  // validator
  review: "validator",
  "review-pr": "validator",
  "receive-review": "validator",
  // feedback
  feedback: "feedback",
  // moderator
  pair: "moderator",
  discuss: "moderator",
  menu: "moderator",
  worktree: "moderator",
  budget: "moderator",
  "writing-plans": "moderator",
  "executing-plans": "moderator",
  // comparator
  evolve: "comparator",
  // retrospective
  retrospective: "retrospective",
  retro: "retrospective",
  learn: "retrospective",
  // grader
  telemetry: "grader",
  status: "grader",
  inbox: "grader",
  "perf-audit": "qa",
  // skill-reviewer
  "skill-creator": "skill-reviewer",
  init: "skill-reviewer",
};
const FALLBACK_AGENT: AgentId = "moderator";

function agentForTool(tool: string | undefined): AgentId {
  if (!tool) return FALLBACK_AGENT;
  return TOOL_TO_AGENT[tool] ?? FALLBACK_AGENT;
}

function agentForSkill(skill: string | undefined): AgentId {
  if (!skill) return FALLBACK_AGENT;
  return SKILL_TO_AGENT[skill] ?? FALLBACK_AGENT;
}

type RawEvent = Record<string, unknown>;

export function mapEvent(event: RawEvent): ActionInstruction[] {
  const type = event.type;

  if (type === "tool_result") {
    const tool = String(event.tool ?? "");
    const status = event.status;
    const agent = agentForTool(tool);
    if (status === "pass") {
      return [{ agent, action: "jump", dialogueKey: "tool_pass" }];
    }
    if (status === "fail") {
      return [
        { agent, action: "idle", dialogueKey: "tool_fail" },
        { agent: "qa", action: "walk-to", target: agent, dialogueKey: "investigation" },
      ];
    }
  }

  if (type === "verify_complete") {
    const overall = event.overall;
    if (overall === "pass") {
      return [{ agent: "validator", action: "jump", dialogueKey: "approved" }];
    }
    if (overall === "fail") {
      const results = Array.isArray(event.results) ? (event.results as Array<Record<string, unknown>>) : [];
      const firstFail = results.find((r) => r.status === "fail");
      const failedHook = firstFail ? String(firstFail.hook ?? "") : "";
      const target = agentForTool(failedHook);
      return [
        { agent: "validator", action: "walk-to", target, dialogueKey: "rejected" },
        { agent: target, action: "idle", dialogueKey: "tool_fail" },
      ];
    }
  }

  if (type === "error") {
    const tool = String(event.tool ?? "");
    const target = agentForTool(tool);
    return [
      { agent: "qa", action: "walk-to", target, dialogueKey: "bug_found" },
      { agent: target, action: "idle", dialogueKey: "tool_fail" },
    ];
  }

  if (type === "skill_invoked") {
    const skill = String(event.skill ?? "");
    const agent = agentForSkill(skill);
    return [{ agent, action: "jump", dialogueKey: "skill_invoked" }];
  }

  // /inbox send 위임 결과 — 수신 에이전트가 메시지 받음 표시 (jump)
  if (type === "inbox_sent") {
    const to = event.to ? String(event.to) : "";
    // to가 알려진 에이전트인지 SKILL_TO_AGENT의 value 집합으로 검증 (안 알려져도 fallback X — 수신자 명시되지 않으면 무시)
    const knownAgents = new Set<AgentId>(Object.values(SKILL_TO_AGENT));
    if (to && knownAgents.has(to as AgentId)) {
      return [{ agent: to as AgentId, action: "jump", dialogueKey: "skill_invoked" }];
    }
    // to 누락 또는 미상 에이전트 → moderator fallback
    return [{ agent: FALLBACK_AGENT, action: "jump", dialogueKey: "skill_invoked" }];
  }

  // /perf-audit 결과 — verdict 기반 분기
  if (type === "perf_audit") {
    const verdict = String(event.verdict ?? "");
    if (verdict === "PASS") {
      return [{ agent: "qa", action: "jump", dialogueKey: "tool_pass" }];
    }
    if (verdict === "WARN" || verdict === "FAIL") {
      return [
        { agent: "qa", action: "idle", dialogueKey: "tool_fail" },
        { agent: "designer", action: "walk-to", target: "qa", dialogueKey: "investigation" },
      ];
    }
  }

  // /sleep-build 자율 사이클 — start/done/abort 3 이벤트 (vibe-flow run-log.sh에서 push)
  if (type === "sleep_build_start") {
    return [{ agent: "planner", action: "clap", dialogueKey: "sleep_start" }];
  }
  if (type === "sleep_build_done") {
    return [{ agent: "developer", action: "jump", dialogueKey: "sleep_done" }];
  }
  if (type === "sleep_build_abort") {
    return [
      { agent: "qa", action: "idle", dialogueKey: "sleep_abort" },
      { agent: "planner", action: "walk-to", target: "qa", dialogueKey: "sleep_abort" },
    ];
  }

  return [];
}
