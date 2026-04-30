import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";

import { getVibeFlowProject } from "./vibe-flow-config";

export type StructureNode = {
  name: string;
  count: number;
  detail?: string;
  exists: boolean;
};

export type Structure = {
  project_dir: string;
  has_claude: boolean;
  nodes: StructureNode[];
  state?: {
    vibe_flow_version?: string;
    installed_at?: string;
    extensions: string[];
  };
};

async function countMatching(
  dir: string,
  matcher: (name: string) => boolean,
): Promise<number> {
  if (!existsSync(dir)) return 0;
  try {
    const entries = await fs.readdir(dir);
    return entries.filter(matcher).length;
  } catch {
    return 0;
  }
}

async function countSubdirs(dir: string): Promise<number> {
  if (!existsSync(dir)) return 0;
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).length;
  } catch {
    return 0;
  }
}

async function totalInboxMessages(messagesDir: string): Promise<number> {
  const inboxDir = path.join(messagesDir, "inbox");
  if (!existsSync(inboxDir)) return 0;
  try {
    const agents = await fs.readdir(inboxDir, { withFileTypes: true });
    let total = 0;
    for (const a of agents) {
      if (!a.isDirectory()) continue;
      total += await countMatching(
        path.join(inboxDir, a.name),
        (n) => n.endsWith(".json"),
      );
    }
    return total;
  } catch {
    return 0;
  }
}

export async function getStructure(): Promise<Structure> {
  const project = getVibeFlowProject();
  const claudeDir = path.join(project, ".claude");
  const has_claude = existsSync(claudeDir);

  if (!has_claude) {
    return { project_dir: project, has_claude: false, nodes: [] };
  }

  const messagesDir = path.join(claudeDir, "messages");
  const debatesDir = path.join(messagesDir, "debates");
  const broadcastDir = path.join(messagesDir, "broadcast");

  const [
    skillsCount,
    agentsCount,
    hooksCount,
    rulesCount,
    plansCount,
    inboxTotal,
    debatesCount,
    broadcastCount,
    brainstormsCount,
    reviewsCount,
  ] = await Promise.all([
    countSubdirs(path.join(claudeDir, "skills")),
    countMatching(path.join(claudeDir, "agents"), (n) => n.endsWith(".md")),
    countMatching(path.join(claudeDir, "hooks"), (n) => n.endsWith(".sh")),
    countMatching(path.join(claudeDir, "rules"), (n) => n.endsWith(".md")),
    countMatching(path.join(claudeDir, "plans"), (n) => n.endsWith(".md")),
    totalInboxMessages(messagesDir),
    countMatching(debatesDir, (n) => n.endsWith(".json")),
    countMatching(broadcastDir, (n) => n.endsWith(".json")),
    countMatching(
      path.join(claudeDir, "memory", "brainstorms"),
      (n) => n.endsWith(".md"),
    ),
    countMatching(
      path.join(claudeDir, "memory", "reviews"),
      (n) => n.endsWith(".md"),
    ),
  ]);

  // events.jsonl 라인 수
  let eventsLines = 0;
  const eventsPath = path.join(claudeDir, "events.jsonl");
  if (existsSync(eventsPath)) {
    try {
      const text = await fs.readFile(eventsPath, "utf-8");
      eventsLines = text.split("\n").filter((l) => l.trim().length > 0).length;
    } catch {
      /* ignore */
    }
  }

  // state file
  let state: Structure["state"];
  const statePath = path.join(claudeDir, ".vibe-flow.json");
  if (existsSync(statePath)) {
    try {
      const text = await fs.readFile(statePath, "utf-8");
      const parsed = JSON.parse(text) as {
        vibe_flow_version?: string;
        installed_at?: string;
        extensions?: Record<string, unknown>;
      };
      state = {
        vibe_flow_version: parsed.vibe_flow_version,
        installed_at: parsed.installed_at,
        extensions: Object.keys(parsed.extensions ?? {}),
      };
    } catch {
      /* ignore */
    }
  }

  const nodes: StructureNode[] = [
    { name: "skills/", count: skillsCount, exists: true },
    { name: "agents/", count: agentsCount, exists: true },
    { name: "hooks/", count: hooksCount, exists: true },
    { name: "rules/", count: rulesCount, exists: true },
    { name: "plans/", count: plansCount, exists: existsSync(path.join(claudeDir, "plans")) },
    {
      name: "messages/inbox/",
      count: inboxTotal,
      detail: "총 메시지 (모든 에이전트 inbox)",
      exists: existsSync(path.join(messagesDir, "inbox")),
    },
    {
      name: "messages/debates/",
      count: debatesCount,
      exists: existsSync(debatesDir),
    },
    {
      name: "messages/broadcast/",
      count: broadcastCount,
      exists: existsSync(broadcastDir),
    },
    {
      name: "memory/brainstorms/",
      count: brainstormsCount,
      exists: existsSync(path.join(claudeDir, "memory", "brainstorms")),
    },
    {
      name: "memory/reviews/",
      count: reviewsCount,
      exists: existsSync(path.join(claudeDir, "memory", "reviews")),
    },
    {
      name: "events.jsonl",
      count: eventsLines,
      detail: "라인 수",
      exists: existsSync(eventsPath),
    },
  ];

  return { project_dir: project, has_claude, nodes, state };
}
