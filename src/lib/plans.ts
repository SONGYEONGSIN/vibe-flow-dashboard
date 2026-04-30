import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";

import { getVibeFlowProject } from "./vibe-flow-config";

export type PlanStatus = "in_progress" | "completed" | "abandoned" | "unknown";

export type ActivePlan = {
  filename: string;
  name: string; // filename에서 날짜 prefix 제거
  status: PlanStatus;
  done: number;
  total: number;
  pct: number;
  modifiedAt: string; // ISO
};

function getPlansDir(): string {
  return path.join(getVibeFlowProject(), ".claude", "plans");
}

function parseFrontmatter(text: string): Record<string, string> {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([a-zA-Z_]+):\s*(.+)$/);
    if (m) fm[m[1]] = m[2].trim();
  }
  return fm;
}

function countCheckboxes(text: string): { done: number; total: number } {
  const lines = text.split("\n");
  let done = 0;
  let total = 0;
  for (const line of lines) {
    if (/^\s*- \[[ x]\]/i.test(line)) {
      total++;
      if (/^\s*- \[x\]/i.test(line)) done++;
    }
  }
  return { done, total };
}

function cleanName(filename: string): string {
  // 2026-04-30-foo-bar.md → foo-bar
  return filename
    .replace(/\.md$/, "")
    .replace(/^[\d-]+-?/, "")
    .replace(/^\d{4}-\d{2}-\d{2}-?/, "");
}

export async function listActivePlans(): Promise<ActivePlan[]> {
  const dir = getPlansDir();
  if (!existsSync(dir)) return [];

  const files = await fs.readdir(dir);
  const plans: ActivePlan[] = [];

  for (const f of files) {
    if (!f.endsWith(".md")) continue;
    const fp = path.join(dir, f);
    try {
      const text = await fs.readFile(fp, "utf-8");
      const fm = parseFrontmatter(text);
      const status = (fm.status as PlanStatus) || "unknown";
      if (status !== "in_progress") continue;

      const { done, total } = countCheckboxes(text);
      const stat = await fs.stat(fp);

      plans.push({
        filename: f,
        name: cleanName(f),
        status,
        done,
        total,
        pct: total > 0 ? Math.round((done * 100) / total) : 0,
        modifiedAt: stat.mtime.toISOString(),
      });
    } catch {
      // 파일 read 실패 무시
    }
  }

  // 최근 수정순
  plans.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  return plans;
}
