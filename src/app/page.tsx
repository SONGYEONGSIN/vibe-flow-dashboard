export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-8 py-16">
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            vibe-flow-dashboard
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            <a
              href="https://github.com/SONGYEONGSIN/vibe-flow"
              className="font-medium text-zinc-900 underline dark:text-zinc-50"
              target="_blank"
              rel="noopener noreferrer"
            >
              vibe-flow
            </a>
            의 라이브 메트릭 + inbox + 활성 plan 대시보드.
          </p>
        </header>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            🚧 Phase A — Scaffold
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            UI/WebSocket 미구현. 다음 이터레이션에서 추가.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li>✓ Next.js 16 + TypeScript + Tailwind 4 scaffold</li>
            <li>✓ GitHub repo + first push</li>
          </ul>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            다음 — Phase B (MVP)
          </h2>
          <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li>· events.jsonl 실시간 tail (chokidar)</li>
            <li>· WebSocket 통신 (server actions / socket.io)</li>
            <li>· 단순 1 페이지 UI: 최근 events stream</li>
          </ul>
        </section>

        <footer className="text-sm text-zinc-500 dark:text-zinc-500">
          <p>
            Source 침범 0 — vibe-flow의 Layer 1/2는 그대로. 대시보드는 읽기
            전용.
          </p>
          <p className="mt-1">
            ROADMAP:{" "}
            <a
              href="https://github.com/SONGYEONGSIN/vibe-flow/blob/main/ROADMAP.md"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              vibe-flow Phase 3
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
