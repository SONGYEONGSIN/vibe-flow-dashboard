import fs from "node:fs/promises";
import { existsSync } from "node:fs";

import { getEventsPath } from "./vibe-flow-config";

type RawEvent = Record<string, unknown> & {
  type?: string;
  ts?: string;
};

export type Metrics = {
  analyzed_events: number;
  period_days: number;
  verify: {
    total: number;
    pass: number;
    fail: number;
    pass_rate: number; // 0-100
  };
  hook: {
    success: number; // tool_result
    failure: number; // tool_failure
    success_rate: number; // 0-100
  };
  commit: {
    total_30d: number;
    daily_avg_30d: number;
    daily_counts_7d: number[]; // 7 entries (오래된→최신)
    sparkline_7d: string;
  };
  top_skills: TopSkill[];
};

type TopSkill = {
  type: string;
  count: number;
  label: string;
};

const SPARKLINE_CHARS = ["░", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

function sparkline(counts: number[]): string {
  if (counts.length === 0) return "";
  const max = Math.max(...counts);
  if (max === 0) return "░".repeat(counts.length);
  return counts
    .map((n) => {
      const idx = Math.min(8, Math.floor((n * 8) / max));
      return SPARKLINE_CHARS[idx];
    })
    .join("");
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86400_000).toISOString();
}

function dateKey(ts: string): string {
  return ts.slice(0, 10); // YYYY-MM-DD
}

function typeToLabel(type: string): string {
  const map: Record<string, string> = {
    commit_created: "/commit",
    learn_save: "/learn",
    skill_evolve: "/evolve",
    pair_session: "/pair",
    review_pr: "/review-pr",
    review_received: "/receive-review",
    design_sync: "/design-sync",
    design_audit: "/design-audit",
    i18n_audit: "/i18n-audit",
    k8s_audit: "/k8s-audit",
    verify_complete: "/verify",
    security_scan: "/security",
    tool_result: "(hook ok)",
    tool_failure: "(hook fail)",
    onboard: "/onboard",
    menu: "/menu",
    inbox: "/inbox",
    budget: "/budget",
    telemetry: "/telemetry",
    brainstorm: "/brainstorm",
    plan_created: "/plan",
    plan_step_complete: "/plan",
    finish: "/finish",
    release: "/release",
    feedback: "/feedback",
    metrics: "/metrics",
    retrospective: "/retrospective",
    discuss: "/discuss",
    eval: "/eval",
    status: "/status",
    test: "/test",
    scaffold: "/scaffold",
    worktree: "/worktree",
  };
  return map[type] ?? type;
}

export async function computeMetrics(periodDays = 30): Promise<Metrics> {
  const eventsPath = getEventsPath();
  const empty: Metrics = {
    analyzed_events: 0,
    period_days: periodDays,
    verify: { total: 0, pass: 0, fail: 0, pass_rate: 0 },
    hook: { success: 0, failure: 0, success_rate: 0 },
    commit: {
      total_30d: 0,
      daily_avg_30d: 0,
      daily_counts_7d: [0, 0, 0, 0, 0, 0, 0],
      sparkline_7d: "░░░░░░░",
    },
    top_skills: [],
  };

  if (!existsSync(eventsPath)) return empty;

  const text = await fs.readFile(eventsPath, "utf-8");
  const lines = text.split("\n").filter((l) => l.trim().length > 0);

  const cutoff = isoDaysAgo(periodDays);
  const cutoff7 = isoDaysAgo(7);

  // Aggregations
  let verify_pass = 0;
  let verify_fail = 0;
  let hook_ok = 0;
  let hook_fail = 0;
  const commit_daily: Record<string, number> = {};
  let commit_total_30d = 0;
  const skill_counts: Record<string, number> = {};
  let analyzed = 0;

  for (const raw of lines) {
    let event: RawEvent;
    try {
      event = JSON.parse(raw) as RawEvent;
    } catch {
      continue;
    }
    const ts = event.ts;
    const type = event.type;
    if (!ts || !type) continue;
    if (ts < cutoff) continue;
    analyzed++;

    // Verify
    if (type === "verify_complete") {
      const overall = String(
        (event as { overall?: unknown }).overall ?? "",
      ).toLowerCase();
      if (overall === "pass") verify_pass++;
      else if (overall === "fail") verify_fail++;
    }

    // Hook
    if (type === "tool_result") hook_ok++;
    if (type === "tool_failure") hook_fail++;

    // Commit
    if (type === "commit_created") {
      commit_total_30d++;
      const k = dateKey(ts);
      commit_daily[k] = (commit_daily[k] ?? 0) + 1;
    }

    // Top skills (모든 type counts)
    skill_counts[type] = (skill_counts[type] ?? 0) + 1;
  }

  // 7일 daily counts (오래된 → 최신)
  const daily_counts_7d: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = isoDaysAgo(i).slice(0, 10);
    daily_counts_7d.push(commit_daily[day] ?? 0);
  }

  // Top 5 (단, hook 자체 events는 제외 — 너무 많아 탑 차지)
  const HIDDEN = new Set(["tool_result", "tool_failure"]);
  const top_skills: TopSkill[] = Object.entries(skill_counts)
    .filter(([k]) => !HIDDEN.has(k))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => ({ type, count, label: typeToLabel(type) }));

  const verify_total = verify_pass + verify_fail;
  const hook_total = hook_ok + hook_fail;

  // analyzed가 cutoff7 기준 commit만 포함하지 않으므로, daily_counts_7d는 별도 계산 (이미 위에서 함)
  void cutoff7;

  return {
    analyzed_events: analyzed,
    period_days: periodDays,
    verify: {
      total: verify_total,
      pass: verify_pass,
      fail: verify_fail,
      pass_rate:
        verify_total > 0 ? Math.round((verify_pass * 100) / verify_total) : 0,
    },
    hook: {
      success: hook_ok,
      failure: hook_fail,
      success_rate:
        hook_total > 0 ? Math.round((hook_ok * 100) / hook_total) : 0,
    },
    commit: {
      total_30d: commit_total_30d,
      daily_avg_30d: Math.round(commit_total_30d / periodDays),
      daily_counts_7d,
      sparkline_7d: sparkline(daily_counts_7d),
    },
    top_skills,
  };
}
