# Changelog

## [Unreleased]

### 변경 (Breaking — 식별자 rename, 동작 변경 0)
- **`sleep_build_*` event type → `auto_build_*`** (vibe-flow PR #40 짝) — vibe-flow의 sleep-build 스킬이 auto-build로 rename됨에 따라 event consumer 갱신.
  - `event-map.ts` 3 분기 (`sleep_build_start/done/abort` → `auto_build_start/done/abort`)
  - `agent-event-map.ts` Stage 카운트 룰 키
  - `event-map.test.ts` + `event-counter.test.ts` fixture
  - `dialogue-pool.json` 컨텍스트 키 (`sleep_start/done/abort` → `auto_start/done/abort`)
  - `docs/superpowers/specs/2026-05-04-sleep-build-events-mapping.md` → `2026-05-04-auto-build-events-mapping.md`
  - 94/94 unit tests 통과 (회귀 0)
  - 과거 `sleep_build_*` jsonl 데이터 — event-counter unknown 무시 정책으로 안전 (변경 X)

## [1.1.0] - 2026-05-04 — 12 에이전트 캐릭터 시스템 (정적 + 자동 진화)

vibe-flow events.jsonl을 12 픽셀 캐릭터로 시각화. 정서적 피드백 루프를 dashboard 핵심 가치로 격상.

### 추가

#### 캐릭터 시스템 본체
- **12 에이전트 픽셀 룸 무대 (#2)** — Phase D MVP. 12 에이전트(planner/designer/developer/qa/security/validator/feedback/moderator/comparator/retrospective + grader/skill-reviewer)별 픽셀 도트 캐릭터, 단일 룸 stage, reducer + useCharacterEngine 토대.
- **L2 wander + L3 event 이동 (#2)** — 무작위 idle 행동 + 이벤트 트리거 walk-to/jump/clap/idle 액션. `event-map.ts`의 `mapEvent(rawEvent)` 함수가 events.jsonl 라인을 ActionInstruction으로 변환.
- **active/waiting 동적 표시 + Activity Feed (#7)** — 캐릭터별 마지막 활동 시각 + 우측 패널 Activity Feed.

#### 이벤트 매핑 확장
- **`skill_invoked` 이벤트 + 12 캐릭터 skill 대사 (#6)** — `SKILL_TO_AGENT` 매핑 (plan/brainstorm/scaffold/finish→planner, commit/release→developer, test/verify/perf-audit→qa 등). dialogue-pool.json에 `skill_invoked` 컨텍스트 12 캐릭터 분.
- **`inbox_sent` + `perf_audit` 이벤트 (#9)** — 수신자 jump (inbox), verdict 분기 (perf-audit PASS=qa jump / WARN/FAIL=qa idle + designer walk-to qa).
- **`sleep_build_*` 3 이벤트 (#11)** — vibe-flow [#30](https://github.com/SONGYEONGSIN/vibe-flow/pull/30) (sleep-build Phase 1) 짝. start→planner clap, done→developer jump, abort→qa idle + planner walk-to qa. Stage 자동 진화 카운트에도 통합 (start→planner, done→developer, abort→qa).

#### Stage 시스템
- **Stage 어드저스터 UI + localStorage 미리보기 (#8)** — 글로벌 stage 선택기 (0~4), localStorage 영속화, preview 배지.
- **Stage 자동 진화 — telemetry 기반 에이전트별 시각 차이 ([#10](https://github.com/SONGYEONGSIN/vibe-flow-dashboard/pull/10))** — events.jsonl 카운트 → 에이전트별 Stage(0~4) 자동 결정. CSS box-shadow / saturate / Stage 4 펄스로 시각 차이 (픽셀 변경 0). `prefers-reduced-motion: reduce` respect. 어드저스터 UI는 dev override (글로벌 강제, localStorage 우선 → 자동 fallback). 신규 파일 — `stage-thresholds.json`, `agent-event-map.ts` (카운트 룰), `event-counter.ts`, `stage-calculator.ts`, `useStageCounts.ts`. 90 unit tests.

### 변경
- **code review polish (#4)** — RETURN_HOME 액션 + clap 추가, a11y prefers-reduced-motion, visibility hidden 시 idle, dead keys 정리.

### 호환
- ✓ 1.0.0 Phase A/B/C 영역 (events stream / 활성 plan / inbox / 메트릭 / .claude 구조) 모두 유지
- ✓ events.jsonl 읽기 전용 원칙 유지 (vibe-flow source 침범 0)
- 신규 영역: `/characters` 페이지 + 캐릭터 시스템 데이터/lib/컴포넌트

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
