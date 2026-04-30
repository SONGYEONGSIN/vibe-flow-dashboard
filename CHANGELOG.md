# Changelog

## [1.0.0] - 2026-04-30 — 첫 안정 릴리즈 (Phase A + B + C 완료)

### 추가

#### Phase A — Scaffold
- Next.js 16 + TypeScript 5 + Tailwind 4 + Turbopack scaffold
- App Router + src/ + import alias `@/*`
- README + LICENSE (MIT)

#### Phase B — MVP (SSE)
- `chokidar` 의존성 추가
- `src/lib/vibe-flow-config.ts` — `VIBE_FLOW_PROJECT` env 처리
- `src/lib/events-watcher.ts` — chokidar singleton + EventEmitter (rotation 감지, lastSize tracking)
- `src/app/api/events/route.ts` — SSE Route Handler (ReadableStream + 30s heartbeat + cleanup)
- `src/app/page.tsx` — EventSource 클라이언트 + 자동 스크롤

#### Phase C — 풀 기능 (4 영역)
- **C-1 활성 plan**: `src/lib/plans.ts` — frontmatter status:in_progress + step 카운트, `/api/plans` (10s polling), progress bar UI
- **C-2 inbox**: `src/lib/inbox.ts` — 12 에이전트 통합 + Active/Quiet 분류 + 최근 unread 3, `/api/inbox` (15s polling), agent 요약 UI
- **C-3 메트릭**: `src/lib/metrics.ts` — events.jsonl 30일 aggregation (verify/hook/commit + Top 5 + sparkline), `/api/metrics` (30s polling), 4 MetricCard grid + Top 5 리스트
- **C-4 구조 시각화**: `src/lib/structure.ts` — .claude/ 디렉토리 카운트 + state file 파싱, `/api/structure` (60s polling), 노드별 카운트 + extensions 명단

### Stack
- Next.js 16.2 (App Router)
- React 19.2
- TypeScript 5
- Tailwind CSS 4
- chokidar 5

### 데이터 소스 (모두 읽기 전용)
- `$VIBE_FLOW_PROJECT/.claude/events.jsonl`
- `$VIBE_FLOW_PROJECT/.claude/plans/*.md`
- `$VIBE_FLOW_PROJECT/.claude/messages/{inbox,broadcast,debates}/`
- `$VIBE_FLOW_PROJECT/.claude/memory/{brainstorms,reviews}/`
- `$VIBE_FLOW_PROJECT/.claude/.vibe-flow.json`
- `$VIBE_FLOW_PROJECT/.claude/agents.json`

### 출처
- vibe-flow Phase 3 — UI 레이어
- ROADMAP: https://github.com/SONGYEONGSIN/vibe-flow/blob/main/ROADMAP.md
