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
const FALLBACK_AGENT: AgentId = "moderator";

function agentForTool(tool: string | undefined): AgentId {
  if (!tool) return FALLBACK_AGENT;
  return TOOL_TO_AGENT[tool] ?? FALLBACK_AGENT;
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

  return [];
}
