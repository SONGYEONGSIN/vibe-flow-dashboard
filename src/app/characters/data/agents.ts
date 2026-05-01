// src/app/characters/data/agents.ts
export type AgentId =
  | "planner"
  | "designer"
  | "developer"
  | "qa"
  | "security"
  | "validator"
  | "feedback"
  | "moderator"
  | "comparator"
  | "retrospective"
  | "grader"
  | "skill-reviewer";

export type AgentMeta = {
  id: AgentId;
  name: string;          // 표시용 짧은 이름
  concept: string;       // 한 줄 컨셉
  motif: string;         // 핵심 모티프
  mainColor: string;     // CSS 색상
  accentColor?: string;  // 보조 컬러
  spritePath: string;    // public/sprites/ 기준 base path (확장자 제외)
  unlockStage: number;   // 이 stage 이상이어야 unlock
};

export const AGENTS: AgentMeta[] = [
  { id: "planner",        name: "Plan", concept: "길쭉한 안테나 책상님",    motif: "클립보드, 안테나",    mainColor: "#5e9bd6", accentColor: "#ffffff", spritePath: "/sprites/planner",        unlockStage: 0 },
  { id: "designer",       name: "Des",  concept: "베레모 쓴 마젠타",        motif: "베레모, 팔레트",      mainColor: "#e36ba7", accentColor: "#f4d65b", spritePath: "/sprites/designer",       unlockStage: 0 },
  { id: "developer",      name: "Dev",  concept: "정사각 헤드폰러",         motif: "헤드폰",             mainColor: "#5fb380", accentColor: "#1a1a1a", spritePath: "/sprites/developer",      unlockStage: 1 },
  { id: "qa",             name: "QA",   concept: "큰 눈 탐정",             motif: "큰 눈, 돋보기",       mainColor: "#7dd6c2", accentColor: "#1a1a1a", spritePath: "/sprites/qa",             unlockStage: 1 },
  { id: "security",       name: "Sec",  concept: "헬멧+바이저 경비",        motif: "헬멧, 배지",         mainColor: "#3a3a4a", accentColor: "#dba83b", spritePath: "/sprites/security",       unlockStage: 3 },
  { id: "validator",      name: "Val",  concept: "기둥형 + 가슴 별",        motif: "기둥, 별",           mainColor: "#3da068", accentColor: "#f4d65b", spritePath: "/sprites/validator",      unlockStage: 2 },
  { id: "feedback",       name: "Fb",   concept: "털 한 가닥 + 큰 입",      motif: "털, 큰 입",          mainColor: "#f5b8d2", accentColor: "#1a1a1a", spritePath: "/sprites/feedback",       unlockStage: 2 },
  { id: "moderator",      name: "Mod",  concept: "통통 콧수염 망치",        motif: "콧수염, 망치",        mainColor: "#a89366", accentColor: "#5a3f1a", spritePath: "/sprites/moderator",      unlockStage: 2 },
  { id: "comparator",     name: "Cmp",  concept: "듀얼톤 좌우반반",         motif: "VS 표식",            mainColor: "#5e9bd6", accentColor: "#d97757", spritePath: "/sprites/comparator",     unlockStage: 3 },
  { id: "retrospective",  name: "Ret",  concept: "안경 + 책 더미",          motif: "안경, 책",            mainColor: "#8b6cb0", accentColor: "#d97757", spritePath: "/sprites/retrospective",  unlockStage: 3 },
  { id: "grader",         name: "Grd",  concept: "차트 든 회색",            motif: "차트",              mainColor: "#6c8db5", accentColor: "#1a1a1a", spritePath: "/sprites/grader",         unlockStage: 4 },
  { id: "skill-reviewer", name: "SkR",  concept: "캡 + 렌치 작업복",        motif: "캡, 렌치",           mainColor: "#7a8290", accentColor: "#d97757", spritePath: "/sprites/skill-reviewer", unlockStage: 4 },
];

export const AGENT_MAP: Record<AgentId, AgentMeta> = Object.fromEntries(
  AGENTS.map((a) => [a.id, a])
) as Record<AgentId, AgentMeta>;
