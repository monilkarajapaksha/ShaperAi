import type { BoardParams, BoardTypeId } from "./boardSchema";

// Mirror of frontend/src/lib/boardRules.ts: which tails and fins are valid per board type.
export const TAILS_BY_TYPE: Partial<Record<BoardTypeId, string[]>> = {
  shortboard: ["squash", "square", "round", "roundpin", "swallow", "diamond"],
  fish: ["swallow", "crescent"],
  hybrid: ["squash", "round", "roundpin", "swallow", "diamond"],
  longboard: ["round", "roundpin", "square", "diamond"],
  minimal: ["round", "roundpin", "squash", "square"],
  gun: ["roundpin", "pin", "round", "diamond"],
  groveler: ["squash", "square", "swallow", "round"],
  egg: ["round", "roundpin", "diamond", "squash"],
  softtop: ["round", "squash", "square"],
};

export const FINS_BY_TYPE: Partial<Record<BoardTypeId, string[]>> = {
  shortboard: ["thruster", "quad", "five"],
  fish: ["twin", "quad", "thruster"],
  hybrid: ["thruster", "quad", "twoplus1", "five"],
  longboard: ["single", "twoplus1", "thruster"],
  minimal: ["thruster", "twoplus1", "single"],
  gun: ["thruster", "quad"],
  groveler: ["thruster", "quad", "twin", "five"],
  egg: ["single", "twoplus1", "thruster", "twin"],
  softtop: ["thruster", "single", "twoplus1"],
};

export const compatRulesForPrompt = (): string =>
  Object.keys(TAILS_BY_TYPE)
    .map((t) => `- ${t}: tails [${TAILS_BY_TYPE[t as BoardTypeId]!.join(", ")}]; fins [${FINS_BY_TYPE[t as BoardTypeId]!.join(", ")}]`)
    .join("\n");

/** Replace a tail or fin setup that doesn't fit the board type with the type's first (most typical) option. */
export function sanitizeForType(type: BoardTypeId, params: BoardParams): BoardParams {
  const out = { ...params } as Record<string, unknown>;
  const tails = TAILS_BY_TYPE[type];
  const fins = FINS_BY_TYPE[type];
  if (tails && typeof out.tailShape === "string" && !tails.includes(out.tailShape)) out.tailShape = tails[0];
  if (fins && typeof out.fins === "string" && !fins.includes(out.fins)) out.fins = fins[0];
  return out as BoardParams;
}

const SKILL: Record<string, string> = {
  learning: "learning to stand", green_waves: "catching green waves", linking_turns: "linking turns", advanced: "advanced",
};
const FIT: Record<string, string> = { low: "low", average: "average", athletic: "athletic" };
const FREQ: Record<string, string> = { occasionally: "occasionally", weekly: "weekly", several_per_week: "several times a week" };
const SIZE: Record<string, string> = { "knee-waist": "knee to waist", "waist-head": "waist to head", "head-high-plus": "head high and bigger" };
const TYPE: Record<string, string> = {
  soft: "soft and mushy", punchy: "punchy beach break", hollow: "fast and hollow (point or reef)",
};
const GOAL: Record<string, string> = {
  "easy-catching": "easy wave catching and stability (maximize paddle power and stability)",
  glide: "smooth glide and fun (relaxed, flowy, forgiving)",
  "speed-flow": "speed and flow (drive and long, drawn-out turns)",
  performance: "sharp turns and performance (responsive, tight rail-to-rail)",
};
const COMPLAINT: Record<string, string> = {
  "hard-to-paddle": "hard to paddle, so add volume/width/length or reduce rocker",
  "hard-to-catch": "hard to catch waves, so add volume, length and a fuller outline, with less rocker",
  unstable: "unstable, so add width and thickness and make the rails fuller",
  slow: "slow, so reduce rocker, use a straighter outline and a more efficient bottom",
  stiff: "stiff and hard to turn, so add rocker, narrow the tail and make the rails more refined",
  "too-loose": "too loose, so add length, a wider tail/more area, more fin area and less rocker",
};

const inches = (n: unknown) => (typeof n === "number" ? `${Math.floor(n / 12)}'${Math.round((n % 12) * 4) / 4}" (${n} in)` : undefined);

/** Plain-English brief of the surfer's answers; this is what the AI actually reasons from. */
export function buildBrief(d: Record<string, unknown>): string {
  const s = (v: unknown, map: Record<string, string>) => (typeof v === "string" ? (map[v] ?? v) : undefined);
  const lines = [
    `Height ${d.height_cm} cm, weight ${d.weight_kg} kg, fitness ${s(d.fitness_level, FIT)}, skill: ${s(d.skill, SKILL)}, surfs ${s(d.surf_frequency, FREQ)}.`,
    `Usual waves: ${s(d.wave_size, SIZE)}, ${s(d.wave_type, TYPE)}.`,
    `What they want most (single priority): ${s(d.goal, GOAL)}.`,
  ];
  const cur = [
    d.current_length_in !== undefined && `length ${inches(d.current_length_in)}`,
    d.current_volume_l !== undefined && `volume ${d.current_volume_l} L`,
  ].filter(Boolean);
  if (cur.length) lines.push(`Current board: ${cur.join(", ")}.`);
  if (d.current_board_complaint) lines.push(`Biggest complaint about the current board: ${s(d.current_board_complaint, COMPLAINT)}. Correct this.`);
  if (d.board_type_preference) lines.push(`Board type chosen by surfer (use it): ${d.board_type_preference}.`);
  if (d.fin_configuration) lines.push(`Fin setup chosen by surfer (use it): ${d.fin_configuration}.`);
  if (d.additional_notes) lines.push(`Notes: ${d.additional_notes}`);
  return lines.join("\n");
}

/** Shaper-mode picks, passed through as hard constraints. */
export function shaperPicks(d: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!d.shaper_mode) return undefined;
  const keys = [
    "age", "stance", "nose_shape", "tail_shape", "wide_point", "nose_rocker", "tail_rocker", "rail_profile", "rail_edge",
    "deck_dome", "bottom_contour", "fin_size", "fin_placement", "stringer", "leash_plug", "finish",
  ];
  const picks = Object.fromEntries(keys.filter((k) => d[k] !== undefined).map((k) => [k, d[k]]));
  return Object.keys(picks).length ? picks : undefined;
}
