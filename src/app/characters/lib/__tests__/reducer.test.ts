// src/app/characters/lib/__tests__/reducer.test.ts
import { describe, it, expect } from "vitest";
import { initialStates, characterReducer, isActive, ACTIVE_TTL_MS, type CharacterState } from "@/app/characters/lib/reducer";

describe("characterReducer", () => {
  it("initialStates — 12 캐릭터, home에서 idle", () => {
    const s = initialStates(2); // stage 2
    expect(s).toHaveLength(12);
    const planner = s.find((c) => c.id === "planner")!;
    expect(planner.action).toBe("idle");
    expect(planner.position).toEqual(planner.home);
    expect(planner.unlocked).toBe(true);
    const grader = s.find((c) => c.id === "grader")!;
    expect(grader.unlocked).toBe(false);
  });

  it("ACTION_INSTRUCTION — jump 적용", () => {
    const s = initialStates(2);
    const next = characterReducer(s, {
      type: "INSTRUCTION",
      instruction: { agent: "designer", action: "jump", dialogueKey: "tool_pass" },
      bubbleText: "디자인 살아남!",
      now: 1000,
    });
    const designer = next.find((c) => c.id === "designer")!;
    expect(designer.action).toBe("jump");
    expect(designer.bubble).toEqual({ text: "디자인 살아남!", expiresAt: 1000 + 4000 });
    expect(designer.usageCount).toBe(1);
  });

  it("ACTION_INSTRUCTION — walk-to (target 옆으로 이동)", () => {
    const s = initialStates(2);
    const next = characterReducer(s, {
      type: "INSTRUCTION",
      instruction: { agent: "qa", action: "walk-to", target: "developer", dialogueKey: "investigation" },
      bubbleText: "🔍",
      now: 2000,
    });
    const qa = next.find((c) => c.id === "qa")!;
    const developer = s.find((c) => c.id === "developer")!;
    expect(qa.action).toBe("walk");
    // qa는 developer home 옆에 있어야 함
    expect(Math.abs(qa.position.x - developer.home.x)).toBeLessThanOrEqual(60);
  });

  it("WANDER_TICK — 캐릭터를 wander 좌표로 이동", () => {
    const s = initialStates(2);
    const next = characterReducer(s, {
      type: "WANDER_TICK",
      agent: "planner",
      newPosition: { x: 100, y: 100 },
    });
    const planner = next.find((c) => c.id === "planner")!;
    expect(planner.action).toBe("walk");
    expect(planner.position).toEqual({ x: 100, y: 100 });
  });

  it("ARRIVE — walk → idle", () => {
    let s = initialStates(2);
    s = characterReducer(s, { type: "WANDER_TICK", agent: "planner", newPosition: { x: 100, y: 100 } });
    s = characterReducer(s, { type: "ARRIVE", agent: "planner" });
    const planner = s.find((c) => c.id === "planner")!;
    expect(planner.action).toBe("idle");
  });

  it("BUBBLE_EXPIRE — 만료된 bubble만 제거", () => {
    let s = initialStates(2);
    s = characterReducer(s, {
      type: "INSTRUCTION",
      instruction: { agent: "designer", action: "jump", dialogueKey: "tool_pass" },
      bubbleText: "hi",
      now: 1000,
    });
    s = characterReducer(s, { type: "BUBBLE_EXPIRE", now: 1000 + 5000 });
    const designer = s.find((c) => c.id === "designer")!;
    expect(designer.bubble).toBeNull();
  });

  it("locked 캐릭터는 이벤트 무시", () => {
    const s = initialStates(0); // grader/skill-reviewer 잠김 (& developer/qa도 0이면 잠김)
    const next = characterReducer(s, {
      type: "INSTRUCTION",
      instruction: { agent: "grader", action: "jump", dialogueKey: "tool_pass" },
      bubbleText: "hi",
      now: 1000,
    });
    const grader = next.find((c) => c.id === "grader")!;
    expect(grader.action).toBe("idle"); // 변화 없음
    expect(grader.bubble).toBeNull();
  });

  it("INSTRUCTION이 lastEventAt 갱신", () => {
    const s = initialStates(2);
    const planner = s.find((c) => c.id === "planner")!;
    expect(planner.lastEventAt).toBeNull();
    const next = characterReducer(s, {
      type: "INSTRUCTION",
      instruction: { agent: "planner", action: "jump", dialogueKey: "tool_pass" },
      bubbleText: "ok",
      now: 5000,
    });
    expect(next.find((c) => c.id === "planner")!.lastEventAt).toBe(5000);
  });

  it("STAGE_CHANGE — unlocked 필드만 갱신, 다른 state 보존", () => {
    let s = initialStates(0); // 초기: developer/qa 잠금
    expect(s.find((c) => c.id === "developer")!.unlocked).toBe(false);

    // 이벤트 발생 → bubble 추가
    s = characterReducer(s, {
      type: "INSTRUCTION",
      instruction: { agent: "planner", action: "jump", dialogueKey: "tool_pass" },
      bubbleText: "test",
      now: 1000,
    });
    const plannerBefore = s.find((c) => c.id === "planner")!;
    expect(plannerBefore.bubble).not.toBeNull();
    expect(plannerBefore.lastEventAt).toBe(1000);

    // Stage 2로 변경
    const s2 = characterReducer(s, { type: "STAGE_CHANGE", stage: 2 });

    // unlocked 갱신
    expect(s2.find((c) => c.id === "developer")!.unlocked).toBe(true);
    expect(s2.find((c) => c.id === "validator")!.unlocked).toBe(true);
    expect(s2.find((c) => c.id === "security")!.unlocked).toBe(false); // Stage 3

    // 다른 state 보존
    const plannerAfter = s2.find((c) => c.id === "planner")!;
    expect(plannerAfter.bubble).toEqual(plannerBefore.bubble);
    expect(plannerAfter.lastEventAt).toBe(1000);
  });

  it("isActive — TTL 안이면 true, 후면 false, null이면 false", () => {
    const baseState: CharacterState = {
      id: "planner",
      home: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
      facing: "right",
      action: "idle",
      bubble: null,
      usageCount: 0,
      unlocked: true,
      lastEventAt: 1000,
    };
    expect(isActive(baseState, 1500)).toBe(true);
    expect(isActive(baseState, 1000 + ACTIVE_TTL_MS - 1)).toBe(true);
    expect(isActive(baseState, 1000 + ACTIVE_TTL_MS)).toBe(false);
    expect(isActive(baseState, 1000 + ACTIVE_TTL_MS + 100)).toBe(false);
    expect(isActive({ ...baseState, lastEventAt: null }, 1500)).toBe(false);
  });
});
