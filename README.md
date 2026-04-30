# vibe-flow-dashboard

> [vibe-flow](https://github.com/SONGYEONGSIN/vibe-flow)의 라이브 메트릭 + inbox + 활성 plan + .claude 구조 대시보드. Next.js + chokidar + SSE. localhost:9999.

[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green)](https://github.com/SONGYEONGSIN/vibe-flow-dashboard/releases)

## 기능

5 영역 통합 대시보드:

| 섹션 | 데이터 | 갱신 방식 |
|---|---|---|
| 📡 Events Stream | `.claude/events.jsonl` 실시간 tail | SSE (chokidar) |
| 📋 활성 Plan | `plans/*.md` status:in_progress + 진행도 | 10s polling |
| 📬 Inbox | 12 에이전트 inbox + broadcast/debates | 15s polling |
| 📊 메트릭 | verify pass / hook 성공률 / commit 빈도 / Top 5 | 30s polling |
| 🗂 .claude/ 구조 | 디렉토리별 카운트 + state file | 60s polling |

**Source 침범 0** — vibe-flow Layer 1/2 (스킬/에이전트/훅/규칙) 그대로. 대시보드는 읽기 전용.

## 시작

```bash
# 의존 설치
npm install

# 본인 vibe-flow 프로젝트 지정 + 개발 서버 (http://localhost:9999)
VIBE_FLOW_PROJECT=/path/to/your/project npm run dev

# 또는 환경변수 미지정 (현재 디렉토리의 .claude/ 사용)
npm run dev
```

## 데이터 소스

```
$VIBE_FLOW_PROJECT/.claude/
├── events.jsonl              ← SSE 라이브 tail
├── plans/*.md                ← frontmatter status:in_progress
├── messages/inbox/<agent>/*.json  ← 12 에이전트
├── messages/broadcast/, debates/  ← 카운트
├── memory/brainstorms, reviews/   ← 카운트
├── .vibe-flow.json           ← state (version + extensions)
└── agents.json               ← 에이전트 명단
```

## 아키텍처

```
vibe-flow 프로젝트 (.claude/)
   │
   ├── events.jsonl   ─── chokidar watch ──→  SSE broadcast
   ├── plans/*.md     ─── status:in_progress
   ├── messages/inbox ─── 12 에이전트
   ├── memory/        ─── brainstorms / reviews
   └── .vibe-flow.json ─ state (version + extensions)
                                  ↓
                       vibe-flow-dashboard (localhost:9999)
                       Next.js 16 + TypeScript 5 + Tailwind 4
                                  ↓
                       브라우저: 라이브 5 영역 통합 뷰
```

## API

| Route | 데이터 |
|---|---|
| `GET /api/events` | SSE 스트림 (events.jsonl 라이브) |
| `GET /api/plans` | 활성 plan 목록 + 진행도 |
| `GET /api/inbox` | 에이전트별 inbox 요약 |
| `GET /api/metrics` | 30일 verify/hook/commit/Top 5 |
| `GET /api/structure` | .claude/ 디렉토리 카운트 + state |

## 의존

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- chokidar 5 (file watcher)

## 로드맵

### v1.0.0 — 완료
- [x] Phase A scaffold (Next.js 16 + TS + Tailwind 4)
- [x] Phase B MVP (events.jsonl SSE)
- [x] Phase C-1 활성 plan
- [x] Phase C-2 inbox
- [x] Phase C-3 메트릭
- [x] Phase C-4 .claude/ 구조 시각화

### v1.x — 향후
- [ ] settings.local.json hook 파이프라인 시각화
- [ ] events 필터/검색 (type/timerange)
- [ ] 다중 vibe-flow 프로젝트 동시 모니터링
- [ ] /budget 사용량 차트
- [ ] /telemetry 30일 추이 그래프

## 라이선스

MIT

## 출처

vibe-flow Phase 3 — UI 레이어. ROADMAP: [vibe-flow/ROADMAP.md](https://github.com/SONGYEONGSIN/vibe-flow/blob/main/ROADMAP.md).
