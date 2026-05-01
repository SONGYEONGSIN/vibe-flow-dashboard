import { AGENTS } from "@/app/characters/data/agents";

export const ROOM = {
  width: 1024,
  height: 576,
  padding: 50,
  wanderRadius: 35,    // 지금은 row 안에서 작은 wander만 (이전 60에서 축소)
};

// 5 행 = Stage 0~4 (각 stage의 unlock 캐릭터들이 한 행에 모임)
export const STAGE_ROWS = [0, 1, 2, 3, 4] as const;

/** Stage row의 y 좌표 (룸 높이 비율 기준). */
const STAGE_Y_RATIOS = [0.14, 0.31, 0.49, 0.67, 0.85] as const;

export function stageRowY(stage: number): number {
  const idx = Math.max(0, Math.min(4, stage));
  return ROOM.height * STAGE_Y_RATIOS[idx];
}

/** 같은 Stage에 속한 캐릭터들. */
function stagePeers(stage: number): string[] {
  return AGENTS.filter((a) => a.unlockStage === stage).map((a) => a.id);
}

export function characterHome(index: number): { x: number; y: number } {
  const agent = AGENTS[index];
  if (!agent) return { x: ROOM.width / 2, y: ROOM.height / 2 };
  const peers = stagePeers(agent.unlockStage);
  const inStageIdx = peers.indexOf(agent.id);
  const count = peers.length;
  const cellW = ROOM.width / (count + 1);
  return {
    x: cellW * (inStageIdx + 1),
    y: stageRowY(agent.unlockStage),
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
  const dx = source.x < target.x ? -40 : 40;
  return {
    x: clamp(target.x + dx, ROOM.padding, ROOM.width - ROOM.padding),
    y: target.y,
  };
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
