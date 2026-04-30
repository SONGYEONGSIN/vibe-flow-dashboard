export const ROOM = {
  width: 1024,
  height: 576,
  padding: 50,
  wanderRadius: 60,
};

const COLS = 6;
const ROWS = 2;

export function characterHome(index: number): { x: number; y: number } {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const cellW = ROOM.width / COLS;
  const cellH = ROOM.height / ROWS;
  return {
    x: cellW * col + cellW / 2,
    y: cellH * row + cellH / 2 + 30, // 약간 아래쪽 (위쪽은 룸 천장 여유)
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function nextWanderPosition(
  home: { x: number; y: number },
  random: () => number = Math.random,
): { x: number; y: number } {
  const r = ROOM.wanderRadius;
  const dx = (random() - 0.5) * 2 * r;
  const dy = (random() - 0.5) * 2 * r;
  return {
    x: clamp(home.x + dx, ROOM.padding, ROOM.width - ROOM.padding),
    y: clamp(home.y + dy, ROOM.padding, ROOM.height - ROOM.padding),
  };
}

export function meetingPosition(
  source: { x: number; y: number },
  target: { x: number; y: number },
): { x: number; y: number } {
  // target home 기준 옆 +40px (source가 target과 겹치지 않게)
  const dx = source.x < target.x ? -40 : 40;
  return {
    x: clamp(target.x + dx, ROOM.padding, ROOM.width - ROOM.padding),
    y: target.y,
  };
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
