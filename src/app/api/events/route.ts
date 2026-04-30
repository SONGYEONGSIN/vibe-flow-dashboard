import { getEventsWatcher, type EventLine } from "@/lib/events-watcher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * SSE — Server-Sent Events.
 * 클라이언트가 EventSource('/api/events')로 연결.
 * events.jsonl 변경 시 새 line을 'event' 메시지로 push.
 */
export async function GET() {
  const watcher = getEventsWatcher();
  const initial = await watcher.tail(50);

  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: EventLine) => {
        const data = JSON.stringify(event);
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // controller 이미 닫힘 — cleanup 호출
          cleanup?.();
        }
      };

      // 즉시 ping — EventSource onopen 안정적 발화 보장 (file 없을 때도)
      try {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      } catch {
        cleanup?.();
      }

      // 초기 50 라인 push
      for (const e of initial) send(e);

      // 이후 변경분 구독
      const onEvent = (e: EventLine) => send(e);
      watcher.on("event", onEvent);

      // heartbeat — 30초마다 ping (proxy timeout 방지)
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          cleanup?.();
        }
      }, 30_000);

      cleanup = () => {
        watcher.off("event", onEvent);
        clearInterval(heartbeat);
        cleanup = null;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
