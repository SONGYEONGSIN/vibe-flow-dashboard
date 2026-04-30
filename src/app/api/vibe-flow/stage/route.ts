// src/app/api/vibe-flow/stage/route.ts
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getVibeFlowProject } from "@/lib/vibe-flow-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const root = getVibeFlowProject();
  const cfgPath = path.join(root, ".vibe-flow.json");
  if (!existsSync(cfgPath)) {
    return NextResponse.json({ stage: 1, source: "default" });
  }
  try {
    const text = await fs.readFile(cfgPath, "utf-8");
    const data = JSON.parse(text) as { stage?: unknown };
    const stage = typeof data.stage === "number" ? data.stage : 1;
    return NextResponse.json({ stage, source: "file" });
  } catch {
    return NextResponse.json({ stage: 1, source: "fallback" });
  }
}
