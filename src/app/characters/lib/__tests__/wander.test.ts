import { describe, it, expect } from "vitest";
import { nextWanderPosition, ROOM, characterHome } from "@/app/characters/lib/wander";

describe("wander", () => {
  it("home 좌표 ± wander_radius 안으로 산출", () => {
    const home = { x: 200, y: 300 };
    const next = nextWanderPosition(home, () => 0.5);
    expect(next.x).toBeGreaterThanOrEqual(home.x - ROOM.wanderRadius);
    expect(next.x).toBeLessThanOrEqual(home.x + ROOM.wanderRadius);
    expect(next.y).toBeGreaterThanOrEqual(home.y - ROOM.wanderRadius);
    expect(next.y).toBeLessThanOrEqual(home.y + ROOM.wanderRadius);
  });

  it("random 0 → home - radius", () => {
    const home = { x: 200, y: 300 };
    const next = nextWanderPosition(home, () => 0);
    expect(next.x).toBe(home.x - ROOM.wanderRadius);
    expect(next.y).toBe(home.y - ROOM.wanderRadius);
  });

  it("room 경계 clamp", () => {
    const home = { x: 30, y: 30 };
    const next = nextWanderPosition(home, () => 0);
    expect(next.x).toBeGreaterThanOrEqual(ROOM.padding);
    expect(next.y).toBeGreaterThanOrEqual(ROOM.padding);
  });

  it("characterHome — Stage row 레이아웃, index 0~11", () => {
    // AGENTS[0] = planner (Stage 0), AGENTS[11] = skill-reviewer (Stage 4)
    const h0 = characterHome(0);
    const h11 = characterHome(11);
    expect(h0.x).toBeGreaterThan(0);
    expect(h11.x).toBeGreaterThan(0);
    expect(h0.y).toBeLessThan(h11.y); // planner는 위쪽 stage, skill-reviewer는 아래쪽
  });
});
