// src/app/characters/lib/__tests__/dialogue.test.ts
import { describe, it, expect } from "vitest";
import { pickLine } from "@/app/characters/lib/dialogue";

const pool = {
  designer: {
    tool_pass: ["a", "b", "c"],
    wander: ["x"],
  },
  qa: {},
};

describe("pickLine", () => {
  it("풀에서 한 개 반환", () => {
    const used = new Map<string, string[]>();
    const line = pickLine(pool, "designer", "tool_pass", used, () => 0);
    expect(["a", "b", "c"]).toContain(line);
  });

  it("최근 사용 대사 회피", () => {
    const used = new Map<string, string[]>([["designer:tool_pass", ["a", "b"]]]);
    const line = pickLine(pool, "designer", "tool_pass", used, () => 0);
    expect(line).toBe("c");
  });

  it("모든 대사가 최근 사용이면 풀 전체에서 선택", () => {
    const used = new Map<string, string[]>([["designer:tool_pass", ["a", "b", "c"]]]);
    const line = pickLine(pool, "designer", "tool_pass", used, () => 0);
    expect(["a", "b", "c"]).toContain(line);
  });

  it("빈 풀이면 null", () => {
    const used = new Map<string, string[]>();
    const line = pickLine(pool, "qa", "tool_pass", used, () => 0);
    expect(line).toBeNull();
  });

  it("없는 캐릭터/키이면 null", () => {
    const used = new Map<string, string[]>();
    expect(pickLine(pool, "feedback" as never, "x", used, () => 0)).toBeNull();
  });
});
