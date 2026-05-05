---
plan_id: 20260504-075255-character-stage-auto-evolution
status: completed
created: 2026-05-03T22:52:55Z
completed: 2026-05-03T23:10:00Z
hard_gate: brief
source: /Users/yss/개발/build/vibe-flow/.claude/memory/brainstorms/20260504-074253-character-system-extension.md
stage_model: B
---

# Plan: 캐릭터 Stage 자동 진화 (telemetry 기반)

## Goal

events.jsonl 카운트를 입력으로 **에이전트별 Stage(0~4)** 를 자동 결정하고, 그 결과를 캐릭터 시각(box-shadow / hue-rotate / opacity)에 반영한다. 기존 글로벌 stage 어드저스터 UI는 dev override로 보존하며, override가 없을 때 자동 stage가 적용된다.

**성공 기준**
- events.jsonl 누적 카운트만으로 12 에이전트 각각의 Stage가 결정된다 (수동 입력 0).
- 시각 차이가 단계마다 식별 가능하다 (Stage 4 캐릭터는 후광/채도 차이로 즉시 구분).
- 어드저스터 UI는 글로벌 override로 동작 (localStorage 우선 → 자동 fallback) — 기존 reset 동작 호환.
- `stage-calculator` / `event-counter` 단위 테스트 100% (임계값 경계, 역매핑, 누적).

## Approach

**Stage 모델: 해석 B (에이전트별 개별 autoStage)** 채택.

근거:
1. brainstorm spec 본문이 명시적으로 "에이전트별 매핑된 이벤트 type 합산" 명시.
2. 진척감 가치(retrospective 루프)는 비대칭 진화 — "내가 자주 쓰는 에이전트가 빠르게 진화"에서 발생.
3. unlock(글로벌 게이트) ↔ stage(개별 숙련도)가 의미 분리됨 → 타입/모델 선명.
4. 비용 차이 적음 — `CharacterState.autoStage` 필드 1개 + 시각 prop 1개 추가.

**아키텍처**

```
events.jsonl (vibe-flow repo)
   │ SSE
   ▼
useEventsStream → onEvent(rawEvent)
   ├─→ useCharacterEngine.handleEvent (기존 instruction 분기)
   └─→ stage-counter (신규) — 에이전트별 카운트 누적 (client-side)
         ▼
   stage-calculator (신규, pure) — 카운트 → Stage(0~4) per agent
         ▼
   reducer state.autoStage (신규 필드)
         ▼
   ChibiSprite/Character — autoStage prop으로 box-shadow/hue/opacity 결정
```

**핵심 결정**
- 카운트 누적은 client-side. 초기 카운트는 server bootstrap (events.jsonl 전체 스캔, `src/lib/events-watcher.ts` 기반 helper 추가).
- 임계값은 JSON 파일(`stage-thresholds.json`) — 코드 변경 없이 조정.
- 역매핑은 `agent-event-map.ts` **별도 파일** 신규 — `event-map.ts`의 `SKILL_TO_AGENT`와 의미 차원 다름(액션 트리거 ↔ 카운트 룰). drift 방지 위해 분리.
- 어드저스터 override 시 모든 12 캐릭터에 글로벌 stage 강제 (preview 의미 유지). override 해제 시 자동 stages 복귀.

**시각 표현 (Stage별)**
- 0: 기본
- 1: opacity 1.0 + 미세 box-shadow (자기 색)
- 2: box-shadow 강화 + hue-rotate(0~5deg)
- 3: 후광(blur 8~12px) + saturate(1.1)
- 4: 후광 강조 + 미세 펄스 (`prefers-reduced-motion: reduce` respect)

CSS만 사용 — 픽셀/스프라이트 변경 0.

## Out of Scope

- 새 캐릭터 외형(skin/이름) personalization — brainstorm B 항목, 별도 작업
- /pair 협업 애니메이션 — brainstorm C 항목
- 임계값 자동 학습
- Stage 4 도달 알림/toast (시각 변화로 충분)
- events.jsonl 서버 측 미리계산 캐시

## 영향 파일

| 파일 | 변경 유형 | 비고 |
|------|---------|------|
| `src/app/characters/data/stage-thresholds.json` | 신규 | 임계값 5단계 |
| `src/app/characters/data/agent-event-map.ts` | 신규 | agent → 카운트 룰 매처 |
| `src/app/characters/lib/event-counter.ts` | 신규 | event → AgentId 카운트 (pure) |
| `src/app/characters/lib/__tests__/event-counter.test.ts` | 신규 | 매핑 룰 정확성 |
| `src/app/characters/lib/stage-calculator.ts` | 신규 | counts → Map<AgentId, stage> |
| `src/app/characters/lib/__tests__/stage-calculator.test.ts` | 신규 | 임계값 경계 + 누적 |
| `src/app/characters/useStageCounts.ts` | 신규 | hook: bootstrap + SSE 누적 |
| `src/lib/events-watcher.ts` | 수정 (소량) | 전체 events 읽기 helper 추가 또는 readAll() 메서드 |
| `src/app/characters/lib/reducer.ts` | 수정 | `autoStage` 필드 + `AUTO_STAGE_UPDATE` 액션 |
| `src/app/characters/useCharacterEngine.ts` | 수정 | autoStages prop + dispatch |
| `src/app/characters/CharacterPage.client.tsx` | 수정 | useStageCounts 통합 + override |
| `src/app/characters/page.tsx` | 수정 | initialCounts SSR fetch |
| `src/app/characters/Character.tsx` 또는 `ChibiSprite.tsx` | 수정 | Stage 시각 효과 CSS |
| `src/app/characters/Stage.tsx` | 수정 (작음) | autoStage 자식 전달 |

총 13 파일 — **간략 설계 등급**.

## 단계

### Phase 1 — Pure 함수 + 테스트

#### T1: stage-thresholds.json 작성
- **상태**: pending
- **파일**: `src/app/characters/data/stage-thresholds.json`
- **변경**: `{ "stages": [{"min":0},{"min":10},{"min":50},{"min":200},{"min":500}] }`
- **DoD**: JSON parse 성공 / 5개 단계 / min 단조증가
- **의존**: 없음

#### T2: agent-event-map.ts 카운트 룰 정의
- **상태**: pending
- **파일**: `src/app/characters/data/agent-event-map.ts`
- **변경**: `AGENT_COUNT_RULES: Record<AgentId, EventMatcher[]>` — 12 agent 모두 채움. EventMatcher = `{ type; tool?; skill? }`
- **DoD**: 컴파일 통과 / `Object.keys(AGENT_COUNT_RULES).length === 12` assert
- **의존**: 없음

#### T3: event-counter.ts pure matcher
- **상태**: pending
- **파일**: `src/app/characters/lib/event-counter.ts`
- **변경**: `countEvent(event): AgentId | null` + `countEvents(events[]): Record<AgentId, number>`
- **DoD**: T4 테스트 통과
- **의존**: T2

#### T4: event-counter.test.ts
- **상태**: pending
- **파일**: `src/app/characters/lib/__tests__/event-counter.test.ts`
- **변경**: 케이스 — commit_created→developer / skill_invoked(plan)→planner / skill_invoked(release)→developer / tool_result(prettier,pass)→designer / verify_complete→qa / 미매칭→null. 각 agent ≥1 케이스.
- **DoD**: `npm test event-counter` 통과
- **의존**: T3

#### T5: stage-calculator.ts
- **상태**: pending
- **파일**: `src/app/characters/lib/stage-calculator.ts`
- **변경**: `calculateStages(counts: Record<AgentId, number>): Record<AgentId, number>` — thresholds JSON 기반 0~4 산출
- **DoD**: T6 테스트 통과
- **의존**: T1

#### T6: stage-calculator.test.ts
- **상태**: pending
- **파일**: `src/app/characters/lib/__tests__/stage-calculator.test.ts`
- **변경**: 경계 — 0/9/10/49/50/199/200/499/500 → 0/0/1/1/2/2/3/3/4. 누락 키 0 fallback.
- **DoD**: `npm test stage-calculator` 통과
- **의존**: T5

### Phase 2 — Hook + reducer

#### T7: useStageCounts hook
- **상태**: pending
- **파일**: `src/app/characters/useStageCounts.ts`
- **변경**: `useStageCounts({ initialCounts }): { counts, stages, increment(agent) }`. 마운트 시 hydrate, increment +1, useMemo로 stages 계산.
- **DoD**: 컴파일 + Phase 3 통합 시 동작
- **의존**: T3, T5

#### T8: events-watcher readAll helper + page bootstrap
- **상태**: pending
- **파일**: `src/lib/events-watcher.ts` (수정), 필요 시 helper export
- **변경**: `readAllEvents(): Promise<EventLine[]>` 추가 (tail 로직 응용, n 제한 없음). server component에서 직접 import.
- **DoD**: `readAllEvents()` 호출 시 events.jsonl 전체 라인 반환 / 파일 부재 시 `[]`
- **의존**: 없음
- **비고**: 별도 API route 신규 X (server component 직접 import로 단순화 — R3 해소)

#### T9: reducer.ts autoStage 필드 + 액션
- **상태**: pending
- **파일**: `src/app/characters/lib/reducer.ts`
- **변경**: `CharacterState.autoStage: number` (default 0). `{ type: "AUTO_STAGE_UPDATE"; stages: Record<AgentId, number> }` 액션 추가.
- **DoD**: 타입 체크 + 기존 reducer 테스트 깨지지 않음
- **의존**: 없음

#### T10: useCharacterEngine 통합
- **상태**: pending
- **파일**: `src/app/characters/useCharacterEngine.ts`
- **변경**: Options에 `autoStages: Record<AgentId, number>` 추가. useEffect로 변화 시 `AUTO_STAGE_UPDATE` dispatch.
- **DoD**: 타입 체크 + state.autoStage 변화 확인
- **의존**: T9, T7

### Phase 3 — UI + 시각

#### T11: CharacterPage.client.tsx 통합
- **상태**: pending
- **파일**: `src/app/characters/CharacterPage.client.tsx`
- **변경**: `initialCounts` prop 추가. `useStageCounts` 호출. `useEventsStream.onEvent`에서 handleEvent + counts.increment 둘 다 호출. autoStages를 `useCharacterEngine`에 전달. override 모드 시 모든 12 agent에 글로벌 stage 값 채워서 전달.
- **DoD**: 페이지 렌더 / 이벤트 수신 시 카운트 증가 / override on/off 전환 동작
- **의존**: T7, T10

#### T12: page.tsx initialCounts SSR
- **상태**: pending
- **파일**: `src/app/characters/page.tsx`
- **변경**: server component에서 `readAllEvents()` → `countEvents()` → CharacterPage.client에 `initialCounts` props 전달.
- **DoD**: 새로고침 시 SSE 누적 전에도 stages 즉시 반영
- **의존**: T11, T8

#### T13: Stage 시각 효과 CSS
- **상태**: pending
- **파일**: `src/app/characters/Character.tsx` 또는 `ChibiSprite.tsx` (현 위치 확인)
- **변경**: `autoStage: number` prop 추가. CSS variable / inline style로 box-shadow(0/2/4/8/12px), filter saturate/hue-rotate, Stage 4 펄스 keyframe. `prefers-reduced-motion: reduce` respect.
- **DoD**: 어드저스터로 0~4 수동 변경 시 시각 차이 식별 가능
- **의존**: 없음

#### T14: Stage.tsx autoStage 전달
- **상태**: pending
- **파일**: `src/app/characters/Stage.tsx`
- **변경**: states 배열에서 character 별 autoStage prop 자식에 전달.
- **DoD**: 컴파일 + T13 통합 동작
- **의존**: T13, T9

### Phase 4 — 검증

#### T15: 어드저스터 override 동작 검증
- **상태**: pending
- **파일**: 변경 없음
- **변경**: 시나리오 (1) override 없음 → 자동 적용 (2) Stage selector → 12 캐릭터 동일 강제 (3) reset → 자동 복귀
- **DoD**: 수동 브라우저 검증 + preview 배지 표시 동작
- **의존**: T11

#### T16: 최종 빌드 + lint + test
- **상태**: pending
- **파일**: 없음
- **변경**: `npm run lint && npm run build && npm test`
- **DoD**: 모두 pass
- **의존**: T1~T15

## 리스크

### R1 (resolved): Stage 모델 미스매치
사용자 합의로 해석 B 채택. plan 본 진행.

### R2: SSE 재연결 시 이벤트 중복 누적 (MEDIUM)
- SSE 재연결 시 같은 이벤트 두 번 도착 가능. server bootstrap과 SSE 시작 시점 race.
- **완화**: 이벤트 `ts` 기반 dedupe Set을 useStageCounts에 유지 (T7). SSE `lastSize` 기반 watcher가 이미 cursor 처리하지만 client 측 mount 후 첫 SSE 수신 이벤트가 bootstrap 카운트와 겹칠 위험. T11에서 bootstrap 시점 ts를 cursor로 보관 → SSE 수신 ts가 그 이하면 skip.

### R3 (resolved): events.jsonl 읽기 layer 부재
`src/lib/events-watcher.ts`에 `tail()`, `getEventsPath()` 존재. T8에서 `readAllEvents()` helper 추가로 해소.

### R4: Stage 4 펄스 산만 (LOW)
- 12 캐릭터 모두 Stage 4 도달 시 화면이 번쩍거림 가능.
- **완화**: 펄스 미세 (opacity 0.95~1.0, 4초 주기). `prefers-reduced-motion: reduce` 강제. 사용자 검증 후 강도 조정.

### R5: agent-event-map.ts ↔ event-map.ts drift (LOW)
- 두 파일 매핑이 시간이 지나며 어긋날 위험.
- **완화**: agent-event-map.ts 헤더 주석에 "카운트 전용, 액션 트리거는 event-map.ts. SKILL_TO_AGENT 변경 시 양쪽 검토" 명시. 단위 테스트에서 12 agent 키 누락 검사.

## 진행 추적

| 시각 | 단계 | 상태 변경 | 비고 |
|------|------|----------|------|
| 2026-05-03T22:52:55Z | - | plan 생성 | 사용자 합의 (해석 B) |
| 2026-05-03T22:55Z | T1 | done | stage-thresholds.json 5단계, 단조증가 |
| 2026-05-03T22:56Z | T2 | done | AGENT_COUNT_RULES 12 agent 매핑 |
| 2026-05-03T22:57Z | T3 | done | countEvent / countEvents pure |
| 2026-05-03T22:58Z | T4 | done | 32 케이스 통과 |
| 2026-05-03T22:57Z | T5 | done | countToStage / calculateStages |
| 2026-05-03T22:58Z | T6 | done | 16 경계 케이스 통과 (Infinity 룰 보정) |
| 2026-05-03T22:59Z | T7 | done | useStageCounts ts dedupe Set |
| 2026-05-03T22:59Z | T8 | done | readAllEvents helper export |
| 2026-05-03T22:59Z | T9 | done | autoStage 필드 + AUTO_STAGE_UPDATE 액션 |
| 2026-05-03T23:00Z | T10 | done | useCharacterEngine autoStages prop |
| 2026-05-03T23:00Z | T13 | done | Stage 글로우 + saturate + Stage4 펄스 + reduced-motion |
| 2026-05-03T23:00Z | T14 | done | Stage.tsx 변경 불필요 (state.autoStage 자동 전달) |
| 2026-05-03T23:01Z | T11 | done | useStageCounts 통합 + override forceStagesAll |
| 2026-05-03T23:01Z | T12 | done | page.tsx readAllEvents+countEvents SSR |
| 2026-05-03T23:05Z | T9 | revise | reducer same-ref 반환 (OOM 무한 루프 수정) |
| 2026-05-03T23:06Z | T16 | done | tsc clean + 90 tests + next build pass |
| 2026-05-03T23:06Z | T15 | pending | 브라우저 시각 검증 (사용자) |
| 2026-05-03T23:10Z | T15 | done | 사용자 브라우저 확인 완료 |
| 2026-05-03T23:10Z | - | plan_completed | 16/16 단계 완료 |
