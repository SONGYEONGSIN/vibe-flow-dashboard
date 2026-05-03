"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { calculateStages } from "./lib/stage-calculator";
import { countEvent } from "./lib/event-counter";
import type { AgentId } from "./data/agents";
import type { RawEvent } from "./useEventsStream";

type Options = {
  initialCounts: Record<AgentId, number>;
};

export type StageCountsResult = {
  counts: Record<AgentId, number>;
  stages: Record<AgentId, number>;
  /** 새 이벤트를 받아 카운트에 반영. ts 기반 dedupe로 SSE/bootstrap race 방지. */
  ingest: (event: RawEvent) => void;
};

/**
 * events.jsonl 카운트 누적 hook.
 * - 마운트 시 server에서 받은 initialCounts로 hydrate.
 * - 이후 SSE로 도착한 이벤트는 ingest()로 +1 누적.
 * - 동일 ts 이벤트 중복 도착 시 dedupe Set으로 무시.
 */
export function useStageCounts({ initialCounts }: Options): StageCountsResult {
  const [counts, setCounts] = useState<Record<AgentId, number>>(initialCounts);
  const seenTsRef = useRef<Set<string>>(new Set());

  const ingest = useCallback((event: RawEvent) => {
    const ts = typeof event.ts === "string" ? event.ts : "";
    if (ts && seenTsRef.current.has(ts)) return;
    if (ts) seenTsRef.current.add(ts);

    const agent = countEvent(event);
    if (!agent) return;
    setCounts((prev) => ({ ...prev, [agent]: (prev[agent] ?? 0) + 1 }));
  }, []);

  const stages = useMemo(() => calculateStages(counts), [counts]);

  return { counts, stages, ingest };
}
