"use client";

import { useEffect, useRef, useState } from "react";

type EventLine = {
  raw: string;
  parsed?: Record<string, unknown>;
};

type ActivePlan = {
  filename: string;
  name: string;
  status: string;
  done: number;
  total: number;
  pct: number;
  modifiedAt: string;
};

const MAX_EVENTS = 200;
const PLANS_POLL_MS = 10_000;

export default function Home() {
  const [events, setEvents] = useState<EventLine[]>([]);
  const [plans, setPlans] = useState<ActivePlan[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // 활성 plan polling (10s 주기)
  useEffect(() => {
    let cancelled = false;
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { plans: ActivePlan[] };
        setPlans(data.plans);
      } catch {
        /* ignore */
      }
    };
    fetchPlans();
    const id = setInterval(fetchPlans, PLANS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const source = new EventSource("/api/events");

    source.onopen = () => {
      setConnected(true);
      setError(null);
    };

    source.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data) as EventLine;
        setEvents((prev) => {
          const next = [...prev, event];
          // 최근 MAX_EVENTS만 유지
          return next.length > MAX_EVENTS ? next.slice(-MAX_EVENTS) : next;
        });
      } catch (e) {
        setError(`Parse error: ${e instanceof Error ? e.message : String(e)}`);
      }
    };

    source.onerror = () => {
      setConnected(false);
      setError("SSE connection error (재연결 시도 중...)");
    };

    return () => source.close();
  }, []);

  // 자동 스크롤 — 새 이벤트 도착 시 맨 아래로
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-8 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              vibe-flow-dashboard
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              events.jsonl 라이브 스트림 · Phase B (MVP)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              {connected ? "연결됨" : "연결 끊김"}
            </span>
            <span className="ml-4 text-sm text-zinc-500">
              {events.length} events
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-8 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-8 py-6">
        <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              📋 활성 Plan ({plans.length})
            </h2>
          </div>
          {plans.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">
              활성 plan 없음 (
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                .claude/plans/*.md
              </code>{" "}
              에 frontmatter{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                status: in_progress
              </code>{" "}
              필요)
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {plans.map((p) => (
                <li key={p.filename} className="px-4 py-3">
                  <PlanRow plan={p} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              📡 Events Stream (최근 {MAX_EVENTS}건)
            </h2>
          </div>
          <div
            ref={listRef}
            className="h-[70vh] overflow-y-auto font-mono text-xs"
          >
            {events.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                events 대기 중... (
                <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                  VIBE_FLOW_PROJECT
                </code>{" "}
                환경변수 또는 현재 디렉토리의{" "}
                <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                  .claude/events.jsonl
                </code>{" "}
                필요)
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {events.map((e, i) => (
                  <li
                    key={`${i}-${e.raw.slice(0, 30)}`}
                    className="px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    {e.parsed ? (
                      <EventRow event={e.parsed} />
                    ) : (
                      <span className="text-zinc-500">{e.raw}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <footer className="mt-6 text-xs text-zinc-500">
          <p>
            데이터 소스:{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              {`$VIBE_FLOW_PROJECT/.claude/events.jsonl`}
            </code>
          </p>
          <p className="mt-1">
            Phase C 다음:{" "}
            <a
              href="https://github.com/SONGYEONGSIN/vibe-flow-dashboard#로드맵"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              활성 plan / inbox / 메트릭 / .claude 시각화
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

function PlanRow({ plan }: { plan: ActivePlan }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {plan.name || plan.filename}
        </span>
        <span className="shrink-0 text-xs text-zinc-500">
          {plan.done}/{plan.total} ({plan.pct}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full bg-blue-500 transition-all dark:bg-blue-400"
          style={{ width: `${plan.pct}%` }}
        />
      </div>
    </div>
  );
}

function EventRow({ event }: { event: Record<string, unknown> }) {
  const type = String(event.type ?? "?");
  const ts = String(event.ts ?? "");
  const time = ts ? new Date(ts).toLocaleTimeString("ko-KR") : "";

  // type 외 다른 키만 추출 (compact 표시)
  const rest = Object.entries(event).filter(
    ([k]) => k !== "type" && k !== "ts",
  );

  return (
    <div className="flex items-start gap-3">
      <span className="w-20 shrink-0 text-zinc-400">{time}</span>
      <span className="w-32 shrink-0 font-semibold text-blue-600 dark:text-blue-400">
        {type}
      </span>
      <span className="flex-1 truncate text-zinc-600 dark:text-zinc-400">
        {rest
          .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
          .join(" · ")}
      </span>
    </div>
  );
}
