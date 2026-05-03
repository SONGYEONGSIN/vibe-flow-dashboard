// src/app/characters/lib/event-counter.ts
//
// pure 함수 — RawEvent 한 개 또는 배열을 받아 에이전트별 카운트 산출.
// 매칭 규칙은 data/agent-event-map.ts의 AGENT_COUNT_RULES.

import { AGENT_COUNT_RULES, type EventMatcher } from "../data/agent-event-map";
import type { AgentId } from "../data/agents";

type RawEvent = Record<string, unknown>;

function matches(event: RawEvent, matcher: EventMatcher): boolean {
  if (event.type !== matcher.type) return false;
  if (matcher.tool !== undefined && event.tool !== matcher.tool) return false;
  if (matcher.skill !== undefined && event.skill !== matcher.skill) return false;
  if (matcher.status !== undefined && event.status !== matcher.status) return false;
  return true;
}

/** 한 이벤트가 어느 에이전트의 카운트로 잡히는지. 미매칭 시 null. */
export function countEvent(event: RawEvent): AgentId | null {
  for (const agent of Object.keys(AGENT_COUNT_RULES) as AgentId[]) {
    const rules = AGENT_COUNT_RULES[agent];
    for (const rule of rules) {
      if (matches(event, rule)) return agent;
    }
  }
  return null;
}

/** 이벤트 배열을 누적해 에이전트별 카운트 반환. 매칭되지 않은 이벤트는 무시. */
export function countEvents(events: RawEvent[]): Record<AgentId, number> {
  const counts: Record<AgentId, number> = {} as Record<AgentId, number>;
  for (const agent of Object.keys(AGENT_COUNT_RULES) as AgentId[]) {
    counts[agent] = 0;
  }
  for (const event of events) {
    const agent = countEvent(event);
    if (agent !== null) counts[agent] += 1;
  }
  return counts;
}
