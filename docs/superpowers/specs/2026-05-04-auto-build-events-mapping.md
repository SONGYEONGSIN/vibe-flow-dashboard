# Brainstorm: auto_build_* 이벤트 캐릭터 매핑

## 의도

- **산출물**: dashboard `event-map.ts` + `dialogue-pool.json`에 `auto_build_start` / `auto_build_done` / `auto_build_abort` 3 이벤트 매핑 추가. 각 이벤트 → 1+ 캐릭터(developer/qa/planner) 액션 + 대사 풀.
- **사용자**: vibe-flow maker. 야간 자율 사이클 종료 후 dashboard `/characters` 에서 캐릭터 시각 피드백을 받는 시점. 대체 행동: jsonl 로그 직접 grep.
- **트리거**: vibe-flow PR #30(auto-build Phase 1) 머지 직전 dogfooding. 매핑 부재 시 사이클 종료가 dashboard에 닿아도 12 캐릭터 무반응 → 정서적 피드백 루프 절단. 미루면 auto-build 머지 후 maker 첫 사이클이 무반응으로 끝남.
- **성공**: events.jsonl에 `auto_build_done` 1줄 → developer 캐릭터 액션 + 대사 1개. 단위 테스트 1+ 케이스 통과.

## 제약

- **dashboard 기존 패턴**: `event-map.ts`의 `mapEvent(rawEvent)` 함수 + `SKILL_TO_AGENT` 매핑. 신규 이벤트는 동일 패턴 따라야 함 (drift 방지).
- **3 이벤트 의미**: start(사이클 시작), done(성공 종료), abort(실패 종료). 각각 다른 정서 — 시작은 기대감, 완료는 환호, 중단은 실망.
- **vibe-flow ↔ dashboard 짝 운영 원칙**: 이벤트 type은 vibe-flow run-log.sh 출력 형식과 일치해야 함 (`{ts, run_id, event, ...}` — `event` 필드가 `start|abort|done`).
- **agent-event-map.ts (Stage 자동 진화)**: auto_build_* 이벤트도 Stage 카운트에 가중 — developer/qa/planner에 매핑.

## 대안 비교

| 항목 | A. 3 이벤트 모두 매핑 | B. done만 매핑 (단순화) | C. 모든 12 캐릭터에 broadcast | Z. 매핑 없이 머지 |
|------|-------------------|----------------------|-------------------------|----------------|
| 핵심 | start/done/abort 3 매핑, 각 1~2 캐릭터 액션 | done만 매핑, start/abort는 무시 | 매 이벤트마다 12 캐릭터 모두 반응 | auto-build PR 그대로 머지 |
| 구현 비용 | 작음 (event-map + dialogue + agent-event-map + 테스트) | 매우 작음 (event-map만) | 큼 (대사 36개+ 작성) | 0 |
| 정서 가치 | **높음** (사이클 흐름 시각화) | 중 (완료만 보임) | 산만 (12개 동시 반응 = 노이즈) | 0 (무반응) |
| Stage 진화 통합 | ✓ developer/qa/planner 카운트 | △ done만 카운트 | ✗ 모든 캐릭터 동등 카운트 (의미 손실) | ✗ |
| 위험 | 낮음 (작고 추가적) | 흐름 표현 부족 | 시각 노이즈 + Stage 의미 흐려짐 | maker 첫 사이클 무반응 |

## 추천 + 근거

**대안 A (3 이벤트 모두 매핑) 채택.**

1. **사이클 흐름 시각화**: start→done/abort는 시간 분리된 흐름. start만(B) 또는 done만(B)으로는 "사이클이 진행 중"이 안 보임. A가 사이클 정서 완전 표현.
2. **Stage 자동 진화 의미 정합**: developer 캐릭터가 yet 다른 사이클이 끝날 때마다 카운트 +1 → 자연스럽게 진화. 이건 A 형태일 때만 의미 명확 (B는 done만이라 카운트 절반, C는 모든 캐릭터 동시 카운트라 비대칭 진화 손상).
3. **비용 차이 작음**: B와 A는 매핑 항목 개수 차이만 (3 vs 1). 대사 풀도 9~12개로 충분.

**기각 B (done만)**: 사이클 흐름 결손. 정서 가치 작음.
**기각 C (broadcast)**: Stage 자동 진화의 비대칭 의미 손상. 시각 산만.
**기각 Z**: maker 첫 사이클 무반응 — auto-build 머지의 정서적 가치 절반 손실.

## 다음 단계

- spec 저장: `.claude/memory/brainstorms/20260504-105944-auto-build-events-mapping.md`
- 구현 단위 (예상 4~5 파일):
  - `src/app/characters/data/event-map.ts` — `mapEvent` 분기 3개 추가
  - `src/app/characters/data/dialogue-pool.json` — developer/qa/planner 각각 auto_build_* 컨텍스트 키 + 대사 풀
  - `src/app/characters/data/agent-event-map.ts` — Stage 카운트 룰에 `auto_build_*` 추가
  - `src/app/characters/data/__tests__/event-map.test.ts` — 3 이벤트 매핑 검증
  - `src/app/characters/lib/__tests__/event-counter.test.ts` — Stage 카운트 추가 케이스
- HARD-GATE: 5 파일 = **인라인 등급** → 다음 작업 직접 구현 (plan 생략 가능)
