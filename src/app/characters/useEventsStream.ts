"use client";

import { useEffect, useRef } from "react";

export type RawEvent = Record<string, unknown>;

type Options = {
  onEvent: (event: RawEvent) => void;
  onConnectionChange?: (connected: boolean) => void;
};

export function useEventsStream({ onEvent, onConnectionChange }: Options) {
  const onEventRef = useRef(onEvent);
  const onConnRef = useRef(onConnectionChange);
  onEventRef.current = onEvent;
  onConnRef.current = onConnectionChange;

  useEffect(() => {
    let es: EventSource | null = null;
    let retryDelay = 3_000;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      es = new EventSource("/api/events");

      es.onopen = () => {
        retryDelay = 3_000;
        onConnRef.current?.(true);
      };

      es.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data) as { raw: string; parsed?: RawEvent };
          if (data.parsed) {
            onEventRef.current(data.parsed);
          }
        } catch {
          // skip malformed
        }
      };

      es.onerror = () => {
        onConnRef.current?.(false);
        es?.close();
        es = null;
        timer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(30_000, retryDelay * 3); // 3 → 9 → 27 → 30 cap
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      es?.close();
    };
  }, []);
}
