"use client";

import type { FeedEntry } from "./useCharacterEngine";
import { AGENT_MAP } from "./data/agents";

type Props = {
  feed: FeedEntry[];
  now: number;
};

function formatAgo(now: number, at: number): string {
  const diff = Math.max(0, Math.floor((now - at) / 1000));
  if (diff < 1) return "방금";
  if (diff < 60) return `${diff}s 전`;
  return `${Math.floor(diff / 60)}m 전`;
}

export function ActivityFeed({ feed, now }: Props) {
  return (
    <div className="rounded-lg border-2 border-zinc-800 bg-zinc-900 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          📡 Activity
        </h3>
        <span className="text-[10px] text-zinc-500">최근 {feed.length}건</span>
      </div>

      {feed.length === 0 ? (
        <div className="py-8 text-center text-xs text-zinc-500">
          이벤트 대기 중…
        </div>
      ) : (
        <ul className="space-y-1.5">
          {feed.map((entry) => {
            const meta = AGENT_MAP[entry.agent];
            const isActive = entry.kind === "active";
            return (
              <li
                key={entry.id}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-[11px]"
                style={{
                  background: isActive
                    ? "rgba(217,119,87,0.10)"
                    : "rgba(110,116,144,0.06)",
                  borderLeft: `2px solid ${
                    isActive ? meta?.mainColor ?? "#d97757" : "#5a607a"
                  }`,
                }}
              >
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    background: isActive
                      ? meta?.mainColor ?? "#d97757"
                      : "#5a607a",
                  }}
                />
                <span
                  className="font-semibold"
                  style={{ color: isActive ? "#f5b899" : "#9aa0b4" }}
                >
                  {isActive ? "🔥" : "💤"} {entry.agent}
                </span>
                <span className="flex-1 truncate text-zinc-300">
                  {entry.message}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {formatAgo(now, entry.at)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
