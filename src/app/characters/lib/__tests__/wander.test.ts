import { describe, it, expect } from "vitest";
import { nextWanderPosition, ROOM, characterHome } from "@/app/characters/lib/wander";

describe("wander", () => {
  it("home 좌표 ± wander_radius 안으로 산출", () => {
    const home = { x: 200, y: 300 };
    const next = nextWanderPosition(home, () => 0.5);
    expect(next.x).toBeGreaterThanOrEqual(home.x - 60);
    expect(next.x).toBeLessThanOrEqual(home.x + 60);
    expect(next.y).toBeGreaterThanOrEqual(home.y - 60);
    expect(next.y).toBeLessThanOrEqual(home.y + 60);
  });

  it("random 0 → home - radius", () => {
    const home = { x: 200, y: 300 };
    const next = nextWanderPosition(home, () => 0);
    expect(next.x).toBe(140);
    expect(next.y).toBe(240);
  });

  it("room 경계 clamp", () => {
    const home = { x: 30, y: 30 };
    const next = nextWanderPosition(home, () => 0); // home - 60 → -30, clamp to padding
    expect(next.x).toBeGreaterThanOrEqual(ROOM.padding);
    expect(next.y).toBeGreaterThanOrEqual(ROOM.padding);
  });

  it("characterHome — 6×2 격자, index 0~11", () => {
    const h0 = characterHome(0);
    const h11 = characterHome(11);
    expect(h0.x).toBeGreaterThan(0);
    expect(h0.x).toBeLessThan(ROOM.width / 2);
    expect(h11.x).toBeGreaterThan(ROOM.width / 2);
    expect(h0.y).not.toBe(h11.y); // 다른 row
  });
});
