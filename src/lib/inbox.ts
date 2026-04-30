import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";

import { getVibeFlowProject } from "./vibe-flow-config";

export type AgentInbox = {
  agent: string;
  unread: number;
  total: number;
  recent: RecentMessage[];
};

export type RecentMessage = {
  msg_id?: string;
  type?: string;
  from?: string;
  subject?: string;
  ts?: string;
  status?: string;
};

export type InboxSummary = {
  agents: AgentInbox[];
  active_agents: AgentInbox[];
  quiet_agents: AgentInbox[];
  broadcast_count: number;
  debates_count: number;
  unread_total: number;
};

function getMessagesDir(): string {
  return path.join(getVibeFlowProject(), ".claude", "messages");
}

async function loadAgentList(): Promise<string[]> {
  const project = getVibeFlowProject();
  const agentsJson = path.join(project, ".claude", "agents.json");

  if (existsSync(agentsJson)) {
    try {
      const text = await fs.readFile(agentsJson, "utf-8");
      const parsed = JSON.parse(text) as { agents?: string[] };
      if (Array.isArray(parsed.agents)) return parsed.agents;
    } catch {
      /* fall through */
    }
  }

  // Fallback: inbox 디렉토리에서 추론
  const inboxDir = path.join(getMessagesDir(), "inbox");
  if (!existsSync(inboxDir)) return [];
  try {
    const entries = await fs.readdir(inboxDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

async function readAgentInbox(agent: string): Promise<AgentInbox> {
  const dir = path.join(getMessagesDir(), "inbox", agent);
  const empty: AgentInbox = { agent, unread: 0, total: 0, recent: [] };

  if (!existsSync(dir)) return empty;

  try {
    const files = await fs.readdir(dir);
    const messages: RecentMessage[] = [];
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      try {
        const text = await fs.readFile(path.join(dir, f), "utf-8");
        const parsed = JSON.parse(text) as RecentMessage;
        messages.push(parsed);
      } catch {
        /* skip */
      }
    }

    const unread = messages.filter((m) => m.status === "unread");
    // 최근 unread 3개 (ts 내림차순)
    const recent = unread
      .slice()
      .sort((a, b) => (b.ts ?? "").localeCompare(a.ts ?? ""))
      .slice(0, 3);

    return {
      agent,
      unread: unread.length,
      total: messages.length,
      recent,
    };
  } catch {
    return empty;
  }
}

async function countDir(dir: string): Promise<number> {
  if (!existsSync(dir)) return 0;
  try {
    const files = await fs.readdir(dir);
    return files.filter((f) => f.endsWith(".json")).length;
  } catch {
    return 0;
  }
}

export async function getInboxSummary(): Promise<InboxSummary> {
  const agentList = await loadAgentList();
  const inboxes = await Promise.all(agentList.map(readAgentInbox));

  const active = inboxes
    .filter((i) => i.unread > 0)
    .sort((a, b) => b.unread - a.unread);
  const quiet = inboxes.filter((i) => i.unread === 0);

  const messagesDir = getMessagesDir();
  const broadcast_count = await countDir(path.join(messagesDir, "broadcast"));
  const debates_count = await countDir(path.join(messagesDir, "debates"));

  const unread_total = inboxes.reduce((sum, i) => sum + i.unread, 0);

  return {
    agents: inboxes,
    active_agents: active,
    quiet_agents: quiet,
    broadcast_count,
    debates_count,
    unread_total,
  };
}
