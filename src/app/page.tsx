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

type RecentMessage = {
  msg_id?: string;
  type?: string;
  from?: string;
  subject?: string;
  ts?: string;
  status?: string;
};

type AgentInbox = {
  agent: string;
  unread: number;
  total: number;
  recent: RecentMessage[];
};

type InboxSummary = {
  active_agents: AgentInbox[];
  quiet_agents: AgentInbox[];
  broadcast_count: number;
  debates_count: number;
  unread_total: number;
};

type StructureNode = {
  name: string;
  count: number;
  detail?: string;
  exists: boolean;
};

type Structure = {
  project_dir: string;
  has_claude: boolean;
  nodes: StructureNode[];
  state?: {
    vibe_flow_version?: string;
    installed_at?: string;
    extensions: string[];
  };
};

type Metrics = {
  analyzed_events: number;
  period_days: number;
  verify: { total: number; pass: number; fail: number; pass_rate: number };
  hook: { success: number; failure: number; success_rate: number };
  commit: {
    total_30d: number;
    daily_avg_30d: number;
    daily_counts_7d: number[];
    sparkline_7d: string;
  };
  top_skills: { type: string; count: number; label: string }[];
};

const MAX_EVENTS = 200;
const PLANS_POLL_MS = 10_000;
const INBOX_POLL_MS = 15_000;
const METRICS_POLL_MS = 30_000;
const STRUCTURE_POLL_MS = 60_000;

export default function Home() {
  const [events, setEvents] = useState<EventLine[]>([]);
  const [plans, setPlans] = useState<ActivePlan[]>([]);
  const [inbox, setInbox] = useState<InboxSummary | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [structure, setStructure] = useState<Structure | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // 활성 plan polling (10s)
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

  // Inbox polling (15s)
  useEffect(() => {
    let cancelled = false;
    const fetchInbox = async () => {
      try {
        const res = await fetch("/api/inbox");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as InboxSummary;
        setInbox(data);
      } catch {
        /* ignore */
      }
    };
    fetchInbox();
    const id = setInterval(fetchInbox, INBOX_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Metrics polling (30s)
  useEffect(() => {
    let cancelled = false;
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/metrics");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as Metrics;
        setMetrics(data);
      } catch {
        /* ignore */
      }
    };
    fetchMetrics();
    const id = setInterval(fetchMetrics, METRICS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Structure polling (60s)
  useEffect(() => {
    let cancelled = false;
    const fetchStructure = async () => {
      try {
        const res = await fetch("/api/structure");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as Structure;
        setStructure(data);
      } catch {
        /* ignore */
      }
    };
    fetchStructure();
    const id = setInterval(fetchStructure, STRUCTURE_POLL_MS);
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
        <section>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard
              title="Verify pass rate"
              value={metrics ? `${metrics.verify.pass_rate}%` : "—"}
              detail={
                metrics
                  ? `${metrics.verify.pass}/${metrics.verify.total} (30d)`
                  : ""
              }
              accent="text-green-600 dark:text-green-400"
            />
            <MetricCard
              title="Hook 성공률"
              value={metrics ? `${metrics.hook.success_rate}%` : "—"}
              detail={
                metrics
                  ? `${metrics.hook.success} ok / ${metrics.hook.failure} fail`
                  : ""
              }
              accent="text-blue-600 dark:text-blue-400"
            />
            <MetricCard
              title="Commit 빈도"
              value={
                metrics
                  ? `${metrics.commit.daily_avg_30d}/일`
                  : "—"
              }
              detail={
                metrics
                  ? `7일 ${metrics.commit.sparkline_7d} (총 ${metrics.commit.total_30d})`
                  : ""
              }
              accent="text-purple-600 dark:text-purple-400"
            />
            <MetricCard
              title="분석된 events"
              value={metrics ? `${metrics.analyzed_events}` : "—"}
              detail={metrics ? `${metrics.period_days}일 누적` : ""}
              accent="text-zinc-700 dark:text-zinc-300"
            />
          </div>

          {metrics && metrics.top_skills.length > 0 && (
            <div className="mt-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="mb-2 text-xs font-semibold text-zinc-500">
                Top 5 스킬 (30일)
              </h3>
              <ol className="space-y-1 text-sm">
                {metrics.top_skills.map((s, i) => (
                  <li
                    key={s.type}
                    className="flex items-center justify-between text-zinc-700 dark:text-zinc-300"
                  >
                    <span>
                      <span className="text-zinc-400">{i + 1}.</span>{" "}
                      <span className="font-mono">{s.label}</span>
                    </span>
                    <span className="font-mono text-xs text-zinc-500">
                      {s.count}회
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              📬 Inbox{" "}
              {inbox ? (
                <span className="ml-2 text-xs font-normal text-zinc-500">
                  unread {inbox.unread_total} · broadcast{" "}
                  {inbox.broadcast_count} · debates {inbox.debates_count}
                </span>
              ) : null}
            </h2>
          </div>
          {!inbox ? (
            <div className="p-6 text-center text-sm text-zinc-500">
              로딩 중...
            </div>
          ) : inbox.active_agents.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">
              모든 에이전트 0 unread (Quiet:{" "}
              {inbox.quiet_agents.length} agents)
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {inbox.active_agents.map((a) => (
                <li key={a.agent} className="px-4 py-3">
                  <InboxRow inbox={a} />
                </li>
              ))}
              {inbox.quiet_agents.length > 0 && (
                <li className="px-4 py-2 text-xs text-zinc-500">
                  Quiet ({inbox.quiet_agents.length}):{" "}
                  {inbox.quiet_agents.map((a) => `@${a.agent}`).join(", ")}
                </li>
              )}
            </ul>
          )}
        </section>

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

        <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              🗂 .claude/ 구조{" "}
              {structure?.state ? (
                <span className="ml-2 text-xs font-normal text-zinc-500">
                  vibe-flow {structure.state.vibe_flow_version} · ext{" "}
                  {structure.state.extensions.length}
                </span>
              ) : null}
            </h2>
          </div>
          {!structure ? (
            <div className="p-6 text-center text-sm text-zinc-500">
              로딩 중...
            </div>
          ) : !structure.has_claude ? (
            <div className="p-6 text-center text-sm text-zinc-500">
              .claude/ 없음 ({structure.project_dir})
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 text-sm dark:divide-zinc-900">
              {structure.nodes.map((n) => (
                <div
                  key={n.name}
                  className={`flex items-center justify-between px-4 py-2 ${
                    n.exists ? "" : "opacity-40"
                  }`}
                >
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {n.name}
                  </span>
                  <span className="flex items-baseline gap-2 text-xs">
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {n.count}
                    </span>
                    {n.detail && (
                      <span className="text-zinc-500">{n.detail}</span>
                    )}
                  </span>
                </div>
              ))}
              {structure.state && structure.state.extensions.length > 0 && (
                <div className="bg-zinc-50 px-4 py-2 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                  활성 extensions: {structure.state.extensions.join(", ")}
                </div>
              )}
            </div>
          )}
        </section>

        <footer className="mt-6 text-xs text-zinc-500">
          <p>
            데이터 소스:{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              {`$VIBE_FLOW_PROJECT/.claude/`}
            </code>
          </p>
          <p className="mt-1">
            Phase C 완료 — 활성 plan ✓ / inbox ✓ / 메트릭 ✓ / .claude 시각화 ✓
          </p>
        </footer>
      </main>
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  accent,
}: {
  title: string;
  value: string;
  detail: string;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs font-medium text-zinc-500">{title}</div>
      <div className={`mt-1 text-2xl font-bold ${accent}`}>{value}</div>
      <div className="mt-1 truncate font-mono text-xs text-zinc-500">
        {detail || " "}
      </div>
    </div>
  );
}

function InboxRow({ inbox }: { inbox: AgentInbox }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          @{inbox.agent}
        </span>
        <span className="shrink-0 text-xs text-zinc-500">
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            {inbox.unread} unread
          </span>{" "}
          / {inbox.total} total
        </span>
      </div>
      {inbox.recent.length > 0 && (
        <ul className="space-y-0.5 text-xs">
          {inbox.recent.map((m, i) => (
            <li
              key={`${inbox.agent}-${m.msg_id ?? i}`}
              className="truncate text-zinc-600 dark:text-zinc-400"
            >
              <span className="text-zinc-400">→</span>{" "}
              <span className="font-medium">
                &ldquo;{m.subject ?? "(no subject)"}&rdquo;
              </span>{" "}
              <span className="text-zinc-500">
                ({m.from ?? "?"} {m.ts ? formatRelative(m.ts) : ""})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatRelative(ts: string): string {
  const t = new Date(ts).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Math.max(0, Date.now() - t);
  if (diff < 60_000) return "방금";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`;
  return `${Math.floor(diff / 86_400_000)}일 전`;
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
