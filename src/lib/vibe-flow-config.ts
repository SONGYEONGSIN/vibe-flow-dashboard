import path from "node:path";

/**
 * vibe-flow 프로젝트 디렉토리.
 *
 * 우선순위:
 * 1. VIBE_FLOW_PROJECT 환경변수
 * 2. process.cwd() (dashboard repo 자체)
 */
export function getVibeFlowProject(): string {
  return process.env.VIBE_FLOW_PROJECT || process.cwd();
}

export function getEventsPath(): string {
  return path.join(getVibeFlowProject(), ".claude", "events.jsonl");
}
