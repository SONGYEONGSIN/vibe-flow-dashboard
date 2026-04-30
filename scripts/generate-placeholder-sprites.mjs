// Generate placeholder sprite PNG files for characters.
// 48 PNG = 12 characters × 4 frames (idle-l, idle-r, walk-l, walk-r)
// All files are 1×1 transparent PNG to allow Character.tsx mainColor fallback

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const AGENTS = [
  ["planner", "#5e9bd6"],
  ["designer", "#e36ba7"],
  ["developer", "#5fb380"],
  ["qa", "#7dd6c2"],
  ["security", "#3a3a4a"],
  ["validator", "#3da068"],
  ["feedback", "#f5b8d2"],
  ["moderator", "#a89366"],
  ["comparator", "#5e9bd6"],
  ["retrospective", "#8b6cb0"],
  ["grader", "#6c8db5"],
  ["skill-reviewer", "#7a8290"],
];

const FRAMES = ["idle-l", "idle-r", "walk-l", "walk-r"];

// Output directory: public/sprites
const outDir = path.join(__dirname, "..", "public", "sprites");
mkdirSync(outDir, { recursive: true });

// 1×1 transparent PNG (base64)
// Character.tsx uses backgroundColor: mainColor as fallback when PNG is not loaded
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

let n = 0;
for (const [agent] of AGENTS) {
  for (const frame of FRAMES) {
    const f = path.join(outDir, `${agent}-${frame}.png`);
    if (!existsSync(f)) {
      writeFileSync(f, TRANSPARENT_PNG);
      n += 1;
    }
  }
}

console.log(`Created ${n} placeholder PNG sprites in ${outDir}`);
