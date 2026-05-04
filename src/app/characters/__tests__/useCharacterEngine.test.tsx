// src/app/characters/__tests__/useCharacterEngine.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCharacterEngine } from "@/app/characters/useCharacterEngine";
import dialoguePool from "@/app/characters/data/dialogue-pool.json";

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("useCharacterEngine", () => {
  it("initial states 12명", () => {
    const { result } = renderHook(() => useCharacterEngine({ stage: 2, dialoguePool, autoStages: {} }));
    expect(result.current.states).toHaveLength(12);
  });

  it("handleEvent — tool_result pass → designer jump + bubble", () => {
    const { result } = renderHook(() => useCharacterEngine({ stage: 2, dialoguePool, autoStages: {} }));
    act(() => {
      result.current.handleEvent({
        type: "tool_result",
        tool: "prettier",
        status: "pass",
      });
    });
    const designer = result.current.states.find((c) => c.id === "designer")!;
    expect(designer.action).toBe("jump");
    expect(designer.bubble).not.toBeNull();
    expect(dialoguePool.designer.tool_pass).toContain(designer.bubble!.text);
  });

  it("4초 후 bubble 만료", () => {
    const { result } = renderHook(() => useCharacterEngine({ stage: 2, dialoguePool, autoStages: {} }));
    act(() => {
      result.current.handleEvent({ type: "tool_result", tool: "prettier", status: "pass" });
    });
    expect(result.current.states.find((c) => c.id === "designer")!.bubble).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.states.find((c) => c.id === "designer")!.bubble).toBeNull();
  });
});
