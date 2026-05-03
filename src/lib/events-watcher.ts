import { EventEmitter } from "node:events";
import fs from "node:fs/promises";
import { existsSync, statSync } from "node:fs";

import chokidar from "chokidar";

import { getEventsPath } from "./vibe-flow-config";

export type EventLine = {
  raw: string;
  parsed?: Record<string, unknown>;
};

class EventsWatcher extends EventEmitter {
  private started = false;
  private lastSize = 0;
  private watcher: ReturnType<typeof chokidar.watch> | null = null;

  start() {
    if (this.started) return;
    this.started = true;

    const eventsPath = getEventsPath();

    if (existsSync(eventsPath)) {
      this.lastSize = statSync(eventsPath).size;
    }

    this.watcher = chokidar.watch(eventsPath, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 25 },
    });

    this.watcher.on("change", () => this.handleChange(eventsPath));
    this.watcher.on("add", () => this.handleChange(eventsPath));
  }

  private async handleChange(eventsPath: string) {
    try {
      const stat = await fs.stat(eventsPath);
      if (stat.size <= this.lastSize) {
        // 파일이 회전(rotate)되거나 truncate되면 처음부터
        this.lastSize = 0;
      }
      const fh = await fs.open(eventsPath, "r");
      const length = stat.size - this.lastSize;
      const buffer = Buffer.alloc(length);
      await fh.read(buffer, 0, length, this.lastSize);
      await fh.close();
      this.lastSize = stat.size;

      const text = buffer.toString("utf-8");
      const lines = text.split("\n").filter((l) => l.trim().length > 0);

      for (const raw of lines) {
        const event: EventLine = { raw };
        try {
          event.parsed = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          // raw 그대로 push
        }
        this.emit("event", event);
      }
    } catch (err) {
      // events.jsonl 없거나 읽기 실패 — 무시
      this.emit("error", err);
    }
  }

  /** 최근 N 라인 반환 (페이지 로드 시 초기 표시용) */
  async tail(n = 50): Promise<EventLine[]> {
    const eventsPath = getEventsPath();
    if (!existsSync(eventsPath)) return [];
    const text = await fs.readFile(eventsPath, "utf-8");
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    return lines.slice(-n).map((raw) => {
      const event: EventLine = { raw };
      try {
        event.parsed = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        /* noop */
      }
      return event;
    });
  }
}

/** events.jsonl 전체 라인 반환. 파일 부재 시 []. server component에서 카운트 bootstrap 용. */
export async function readAllEvents(): Promise<EventLine[]> {
  const eventsPath = getEventsPath();
  if (!existsSync(eventsPath)) return [];
  const text = await fs.readFile(eventsPath, "utf-8");
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  return lines.map((raw) => {
    const event: EventLine = { raw };
    try {
      event.parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      /* noop */
    }
    return event;
  });
}

// 모듈 레벨 singleton (Node.js module 1회 로드 보장)
const globalForWatcher = globalThis as unknown as {
  __vfWatcher?: EventsWatcher;
};

export function getEventsWatcher(): EventsWatcher {
  if (!globalForWatcher.__vfWatcher) {
    globalForWatcher.__vfWatcher = new EventsWatcher();
    globalForWatcher.__vfWatcher.start();
  }
  return globalForWatcher.__vfWatcher;
}
