// src/app/characters/lib/dialogue.ts
import type { AgentId } from "@/app/characters/data/agents";

export type DialoguePool = Partial<Record<AgentId, Record<string, string[]>>>;

const RECENT_LIMIT = 3;

/**
 * 대사 풀에서 한 개 선택. 최근 RECENT_LIMIT개 사용한 대사를 회피.
 * @param random 0..1 사이 값을 반환하는 함수 (테스트 시 deterministic하게 주입)
 */
export function pickLine(
  pool: DialoguePool,
  agent: AgentId,
  contextKey: string,
  lastUsed: Map<string, string[]>,
  random: () => number = Math.random,
): string | null {
  const lines = pool[agent]?.[contextKey];
  if (!lines || lines.length === 0) return null;

  const usedKey = `${agent}:${contextKey}`;
  const recent = lastUsed.get(usedKey) ?? [];

  let candidates = lines.filter((l) => !recent.includes(l));
  if (candidates.length === 0) candidates = lines;

  const picked = candidates[Math.floor(random() * candidates.length)];
  if (!picked) return null;

  // last-used 갱신 (mutate map ok — 호출 측이 단일 instance 기대)
  const next = [...recent, picked].slice(-RECENT_LIMIT);
  lastUsed.set(usedKey, next);
  return picked;
}

export function shouldShowWanderBubble(random: () => number = Math.random): boolean {
  return random() < 0.3;
}
