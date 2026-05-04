// src/app/characters/page.tsx
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { getVibeFlowProject } from "@/lib/vibe-flow-config";
import { readAllEvents } from "@/lib/events-watcher";
import { CharacterPage } from "./CharacterPage.client";
import { countEvents } from "./lib/event-counter";
import type { AgentId } from "./data/agents";

export const dynamic = "force-dynamic";

async function loadStage(): Promise<number> {
  const cfg = path.join(getVibeFlowProject(), ".vibe-flow.json");
  if (!existsSync(cfg)) return 1;
  try {
    const text = await fs.readFile(cfg, "utf-8");
    const data = JSON.parse(text) as { stage?: unknown };
    return typeof data.stage === "number" ? data.stage : 1;
  } catch {
    return 1;
  }
}

async function loadInitialCounts(): Promise<Record<AgentId, number>> {
  const lines = await readAllEvents();
  const parsed = lines
    .map((l) => l.parsed)
    .filter((p): p is Record<string, unknown> => !!p);
  return countEvents(parsed);
}

export default async function Page() {
  const [stage, initialCounts] = await Promise.all([loadStage(), loadInitialCounts()]);
  return <CharacterPage initialStage={stage} initialCounts={initialCounts} />;
}
