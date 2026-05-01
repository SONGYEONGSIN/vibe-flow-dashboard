"use client";

import type { AgentId } from "./data/agents";

type Props = {
  agentId: AgentId;
};

const PIN = "absolute" as const;

/**
 * 12 에이전트의 실루엣별 chibi sprite. CSS 도형으로 렌더 (PNG 미사용).
 * 후속 spec에서 실제 픽셀 PNG로 교체 가능 — Character.tsx의 sprite 모드만 다시 켜면 됨.
 */
export function ChibiSprite({ agentId }: Props) {
  switch (agentId) {
    case "planner":      return <Planner />;
    case "designer":     return <Designer />;
    case "developer":    return <Developer />;
    case "qa":           return <QA />;
    case "security":     return <Security />;
    case "validator":    return <Validator />;
    case "feedback":     return <Feedback />;
    case "moderator":    return <Moderator />;
    case "comparator":   return <Comparator />;
    case "retrospective": return <Retrospective />;
    case "grader":       return <Grader />;
    case "skill-reviewer": return <SkillReviewer />;
  }
}

const SLOT: React.CSSProperties = {
  position: "relative",
  width: 48,
  height: 64,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
};

// 1. PLANNER — tall, slim, antenna, clipboard
function Planner() {
  return (
    <div style={SLOT}>
      <div style={{ position: "relative", width: 32, height: 60 }}>
        <div style={{ position: PIN, left: 14, bottom: 48, width: 2, height: 8, background: "#5e9bd6" }}>
          <div style={{ position: PIN, top: -3, left: -2, width: 6, height: 6, background: "#fff", borderRadius: "50%" }} />
        </div>
        <div style={{ position: PIN, left: 8, bottom: 34, width: 16, height: 14, background: "#5e9bd6", borderRadius: "6px 6px 2px 2px" }} />
        <div style={{ position: PIN, left: 6, bottom: 8, width: 20, height: 30, background: "#5e9bd6", borderRadius: "4px 4px 2px 2px" }} />
        <div style={{ position: PIN, left: 11, bottom: 42, width: 3, height: 3, background: "#1a1a1a" }} />
        <div style={{ position: PIN, left: 18, bottom: 42, width: 3, height: 3, background: "#1a1a1a" }} />
        <div style={{ position: PIN, left: -4, bottom: 18, width: 10, height: 14, background: "#fff", border: "2px solid #1a1a1a" }} />
        <div style={{ position: PIN, left: 9, bottom: 0, width: 4, height: 8, background: "#5e9bd6" }} />
        <div style={{ position: PIN, left: 19, bottom: 0, width: 4, height: 8, background: "#5e9bd6" }} />
      </div>
    </div>
  );
}

// 2. DESIGNER — beret, palette
function Designer() {
  return (
    <div style={SLOT}>
      <div style={{ position: "relative", width: 36, height: 54 }}>
        <div style={{ position: PIN, left: 8, bottom: 38, width: 22, height: 8, background: "#1a1a1a", borderRadius: "50%" }}>
          <div style={{ position: PIN, top: -4, right: 2, width: 4, height: 4, background: "#1a1a1a", borderRadius: "50%" }} />
        </div>
        <div style={{ position: PIN, left: 10, bottom: 24, width: 18, height: 16, background: "#e36ba7", borderRadius: "50%" }} />
        <div style={{ position: PIN, left: 8, bottom: 6, width: 22, height: 24, background: "#e36ba7", borderRadius: "50% 50% 6px 6px" }} />
        <div style={{ position: PIN, left: 13, bottom: 30, width: 3, height: 3, background: "#1a1a1a" }} />
        <div style={{ position: PIN, left: 21, bottom: 30, width: 3, height: 3, background: "#1a1a1a" }} />
        <div style={{ position: PIN, right: -6, bottom: 14, width: 14, height: 10, background: "#f4d65b", borderRadius: "50%" }}>
          <div style={{ position: PIN, left: 3, top: 3, width: 3, height: 3, background: "#5fb380", borderRadius: "50%", boxShadow: "5px 0 0 #d97757" }} />
        </div>
        <div style={{ position: PIN, left: 12, bottom: 0, width: 4, height: 6, background: "#e36ba7" }} />
        <div style={{ position: PIN, left: 22, bottom: 0, width: 4, height: 6, background: "#e36ba7" }} />
      </div>
    </div>
  );
}

// 3. DEVELOPER — square, headphones
function Developer() {
  return (
    <div style={SLOT}>
      <div style={{ position: "relative", width: 40, height: 50 }}>
        <div style={{ position: PIN, left: 6, bottom: 32, width: 28, height: 4, background: "#1a1a1a", borderRadius: "4px 4px 0 0" }} />
        <div style={{ position: PIN, left: 0, bottom: 18, width: 8, height: 14, background: "#1a1a1a", borderRadius: "4px 0 0 4px" }} />
        <div style={{ position: PIN, right: 0, bottom: 18, width: 8, height: 14, background: "#1a1a1a", borderRadius: "0 4px 4px 0" }} />
        <div style={{ position: PIN, left: 6, bottom: 6, width: 28, height: 30, background: "#5fb380", borderRadius: 3 }} />
        <div style={{ position: PIN, left: 13, bottom: 22, width: 4, height: 6, background: "#1a1a1a" }} />
        <div style={{ position: PIN, left: 23, bottom: 22, width: 4, height: 6, background: "#1a1a1a" }} />
        <div style={{ position: PIN, left: 11, bottom: 0, width: 5, height: 8, background: "#5fb380" }} />
        <div style={{ position: PIN, left: 24, bottom: 0, width: 5, height: 8, background: "#5fb380" }} />
      </div>
    </div>
  );
}

// 4. QA — tiny, big eyes, magnifier
function QA() {
  return (
    <div style={SLOT}>
      <div style={{ position: "relative", width: 36, height: 42 }}>
        <div style={{ position: PIN, left: 8, bottom: 4, width: 20, height: 22, background: "#7dd6c2", borderRadius: "50%" }} />
        <div style={{ position: PIN, left: 11, bottom: 14, width: 6, height: 8, background: "#fff", border: "1px solid #1a1a1a", borderRadius: "50%" }}>
          <div style={{ position: PIN, top: 2, left: 1, width: 3, height: 4, background: "#1a1a1a", borderRadius: "50%" }} />
        </div>
        <div style={{ position: PIN, left: 19, bottom: 14, width: 6, height: 8, background: "#fff", border: "1px solid #1a1a1a", borderRadius: "50%" }}>
          <div style={{ position: PIN, top: 2, left: 1, width: 3, height: 4, background: "#1a1a1a", borderRadius: "50%" }} />
        </div>
        <div style={{ position: PIN, right: -6, bottom: 6, width: 10, height: 10, border: "2px solid #1a1a1a", borderRadius: "50%", background: "rgba(255,255,255,0.3)" }}>
          <div style={{ position: PIN, right: -4, bottom: -4, width: 6, height: 2, background: "#1a1a1a", transform: "rotate(45deg)" }} />
        </div>
        <div style={{ position: PIN, left: 11, bottom: 0, width: 4, height: 6, background: "#7dd6c2" }} />
        <div style={{ position: PIN, left: 21, bottom: 0, width: 4, height: 6, background: "#7dd6c2" }} />
      </div>
    </div>
  );
}

// 5. SECURITY — helmet, visor, badge
function Security() {
  return (
    <div style={SLOT}>
      <div style={{ position: "relative", width: 40, height: 46 }}>
        <div style={{ position: PIN, left: 4, bottom: 24, width: 32, height: 14, background: "#dba83b", borderRadius: "16px 16px 0 0" }} />
        <div style={{ position: PIN, left: 8, bottom: 18, width: 24, height: 6, background: "#1a1a1a", borderRadius: "0 0 4px 4px" }} />
        <div style={{ position: PIN, left: 6, bottom: 4, width: 28, height: 24, background: "#3a3a4a", borderRadius: "50%" }} />
        <div style={{ position: PIN, left: 16, bottom: 14, width: 8, height: 8, background: "#dba83b", borderRadius: "50%" }}>
          <div style={{ position: PIN, left: 2, top: 2, width: 4, height: 4, background: "#3a3a4a", borderRadius: "50%" }} />
        </div>
        <div style={{ position: PIN, left: 11, bottom: 0, width: 5, height: 6, background: "#3a3a4a" }} />
        <div style={{ position: PIN, left: 24, bottom: 0, width: 5, height: 6, background: "#3a3a4a" }} />
      </div>
    </div>
  );
}

// 6. VALIDATOR — pillar, star
function Validator() {
  return (
    <div style={SLOT}>
      <div style={{ position: "relative", width: 32, height: 60 }}>
        <div style={{ position: PIN, left: 6, bottom: 6, width: 20, height: 42, background: "#3da068", borderRadius: "8px 8px 4px 4px" }} />
        <div style={{ position: PIN, left: 10, bottom: 36, width: 3, height: 3, background: "#1a1a1a" }} />
        <div style={{ position: PIN, left: 19, bottom: 36, width: 3, height: 3, background: "#1a1a1a" }} />
        <div style={{ position: PIN, left: 13, bottom: 30, width: 6, height: 2, background: "#1a1a1a" }} />
        <div style={{ position: PIN, left: 12, bottom: 14, width: 8, height: 8, background: "#f4d65b", clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" }} />
        <div style={{ position: PIN, left: 9, bottom: 0, width: 4, height: 8, background: "#3da068" }} />
        <div style={{ position: PIN, left: 19, bottom: 0, width: 4, height: 8, background: "#3da068" }} />
      </div>
    </div>
  );
}

// 7. FEEDBACK — soft round, big mouth
function Feedback() {
  return (
    <div style={SLOT}>
      <div style={{ position: "relative", width: 38, height: 44 }}>
        <div style={{ position: PIN, left: 14, bottom: 26, width: 10, height: 6, background: "#f5b8d2", borderRadius: "50%" }} />
        <div style={{ position: PIN, left: 6, bottom: 4, width: 26, height: 24, background: "#f5b8d2", borderRadius: "50%" }} />
        <div style={{ position: PIN, left: 12, bottom: 18, width: 3, height: 5, background: "#1a1a1a", borderRadius: "50%" }} />
        <div style={{ position: PIN, left: 23, bottom: 18, width: 3, height: 5, background: "#1a1a1a", borderRadius: "50%" }} />
        <div style={{ position: PIN, left: 14, bottom: 10, width: 10, height: 5, background: "#1a1a1a", borderRadius: "0 0 6px 6px" }} />
        <div style={{ position: PIN, left: 11, bottom: 0, width: 4, height: 6, background: "#f5b8d2" }} />
        <div style={{ position: PIN, left: 23, bottom: 0, width: 4, height: 6, background: "#f5b8d2" }} />
      </div>
    </div>
  );
}

// 8. MODERATOR — wide, mustache, gavel
function Moderator() {
  return (
    <div style={SLOT}>
      <div style={{ position: "relative", width: 42, height: 46 }}>
        <div style={{ position: PIN, left: 10, bottom: 22, width: 22, height: 14, background: "#a89366", borderRadius: "6px 6px 0 0" }} />
        <div style={{ position: PIN, left: 4, bottom: 4, width: 34, height: 22, background: "#a89366", borderRadius: 4 }} />
        <div style={{ position: PIN, left: 14, bottom: 28, width: 3, height: 3, background: "#1a1a1a" }} />
        <div style={{ position: PIN, left: 25, bottom: 28, width: 3, height: 3, background: "#1a1a1a" }} />
        <div style={{ position: PIN, left: 14, bottom: 23, width: 14, height: 3, background: "#1a1a1a", borderRadius: "0 0 6px 6px" }} />
        <div style={{ position: PIN, right: -2, bottom: 8, width: 14, height: 6, background: "#5a3f1a", borderRadius: 2, transform: "rotate(-15deg)" }} />
        <div style={{ position: PIN, left: 11, bottom: 0, width: 5, height: 6, background: "#a89366" }} />
        <div style={{ position: PIN, left: 26, bottom: 0, width: 5, height: 6, background: "#a89366" }} />
      </div>
    </div>
  );
}

// 9. COMPARATOR — two-tone, VS
function Comparator() {
  return (
    <div style={SLOT}>
      <div style={{ position: "relative", width: 40, height: 48 }}>
        <div style={{ position: PIN, left: 6, bottom: 4, width: 14, height: 30, background: "#5e9bd6", borderRadius: "14px 0 0 4px" }} />
        <div style={{ position: PIN, left: 20, bottom: 4, width: 14, height: 30, background: "#d97757", borderRadius: "0 14px 4px 0" }} />
        <div style={{ position: PIN, left: 11, bottom: 22, width: 3, height: 3, background: "#fff" }} />
        <div style={{ position: PIN, left: 25, bottom: 22, width: 3, height: 3, background: "#fff" }} />
        <div style={{ position: PIN, left: 13, bottom: 8, width: 14, height: 8, background: "#1a1a1a", borderRadius: 2, color: "#fff", fontSize: 7, fontWeight: "bold", textAlign: "center", lineHeight: "8px", fontFamily: "monospace" }}>VS</div>
        <div style={{ position: PIN, left: 11, bottom: 0, width: 4, height: 6, background: "#5e9bd6" }} />
        <div style={{ position: PIN, left: 25, bottom: 0, width: 4, height: 6, background: "#d97757" }} />
      </div>
    </div>
  );
}

// 10. RETROSPECTIVE — glasses, books
function Retrospective() {
  return (
    <div style={SLOT}>
      <div style={{ position: "relative", width: 40, height: 50 }}>
        <div style={{ position: PIN, left: 8, bottom: 14, width: 22, height: 24, background: "#8b6cb0", borderRadius: "8px 8px 4px 4px" }} />
        <div style={{ position: PIN, left: 10, bottom: 24, width: 6, height: 6, border: "1.5px solid #1a1a1a", borderRadius: "50%", background: "#fff" }} />
        <div style={{ position: PIN, left: 22, bottom: 24, width: 6, height: 6, border: "1.5px solid #1a1a1a", borderRadius: "50%", background: "#fff" }} />
        <div style={{ position: PIN, left: 16, bottom: 26, width: 4, height: 1.5, background: "#1a1a1a" }} />
        <div style={{ position: PIN, left: 6, bottom: 6, width: 28, height: 5, background: "#d97757" }} />
        <div style={{ position: PIN, left: 8, bottom: 1, width: 24, height: 5, background: "#5fb380" }} />
      </div>
    </div>
  );
}

// 11. GRADER — chart (locked dim handled by Character.tsx wrapper opacity)
function Grader() {
  return (
    <div style={SLOT}>
      <div style={{ position: "relative", width: 38, height: 42 }}>
        <div style={{ position: PIN, left: 10, bottom: 24, width: 18, height: 8, background: "#6c8db5", borderRadius: "8px 8px 0 0" }} />
        <div style={{ position: PIN, left: 6, bottom: 4, width: 26, height: 24, background: "#6c8db5", borderRadius: "6px 6px 4px 4px" }} />
        <div style={{ position: PIN, left: 13, bottom: 14, width: 3, height: 3, background: "#1a1a1a" }} />
        <div style={{ position: PIN, left: 22, bottom: 14, width: 3, height: 3, background: "#1a1a1a" }} />
        <div style={{ position: PIN, left: 11, bottom: 6, width: 16, height: 5, background: "#fff" }}>
          <div style={{ position: PIN, left: 1, bottom: 0, width: 2, height: 2, background: "#1a1a1a", boxShadow: "4px 0 0 #1a1a1a, 8px 1px 0 #1a1a1a, 12px 2px 0 #1a1a1a" }} />
        </div>
        <div style={{ position: PIN, left: 11, bottom: 0, width: 4, height: 6, background: "#6c8db5" }} />
        <div style={{ position: PIN, left: 23, bottom: 0, width: 4, height: 6, background: "#6c8db5" }} />
      </div>
    </div>
  );
}

// 12. SKILL-REVIEWER — cap, wrench
function SkillReviewer() {
  return (
    <div style={SLOT}>
      <div style={{ position: "relative", width: 38, height: 46 }}>
        <div style={{ position: PIN, left: 8, bottom: 32, width: 22, height: 6, background: "#d97757", borderRadius: "8px 8px 0 0" }}>
          <div style={{ position: PIN, right: -3, top: 1, width: 5, height: 3, background: "#d97757", borderRadius: "0 4px 4px 0" }} />
        </div>
        <div style={{ position: PIN, left: 10, bottom: 22, width: 18, height: 12, background: "#7a8290", borderRadius: "4px 4px 2px 2px" }} />
        <div style={{ position: PIN, left: 6, bottom: 4, width: 26, height: 22, background: "#7a8290", borderRadius: 4 }} />
        <div style={{ position: PIN, left: 13, bottom: 25, width: 3, height: 3, background: "#1a1a1a" }} />
        <div style={{ position: PIN, left: 22, bottom: 25, width: 3, height: 3, background: "#1a1a1a" }} />
        <div style={{ position: PIN, right: -4, bottom: 8, width: 4, height: 14, background: "#dba83b", transform: "rotate(20deg)" }}>
          <div style={{ position: PIN, top: -3, left: -2, width: 8, height: 4, background: "#dba83b" }} />
        </div>
        <div style={{ position: PIN, left: 11, bottom: 0, width: 4, height: 6, background: "#7a8290" }} />
        <div style={{ position: PIN, left: 23, bottom: 0, width: 4, height: 6, background: "#7a8290" }} />
      </div>
    </div>
  );
}
