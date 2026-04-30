// src/app/characters/page.tsx
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { getVibeFlowProject } from "@/lib/vibe-flow-config";
import { CharacterPage } from "./CharacterPage.client";

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

export default async function Page() {
  const stage = await loadStage();
  return <CharacterPage initialStage={stage} />;
}
