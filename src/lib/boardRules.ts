import { BoardTypeId, FinSetup, TailShape, boardTypeName } from "@/types/boardDesign";
import { Complaint, Fitness, Frequency, Goal, Skill, UserDetails, WaveSize, WaveType } from "@/types/userDetails";

// Single source of truth for "what goes with what". A mirror lives in shaper-backend/src/compat.ts
// so the AI is told the same rules and its output is sanitised against them.

export const SKILLS: { value: Skill; label: string; hint: string }[] = [
  { value: "learning", label: "Learning to stand", hint: "Still working on popping up" },
  { value: "green_waves", label: "Catching green waves", hint: "Riding unbroken waves, going straight or trimming" },
  { value: "linking_turns", label: "Linking turns", hint: "Connecting turns down the line" },
  { value: "advanced", label: "Advanced", hint: "Surfing critical sections with power" },
];

export const FITNESS: { value: Fitness; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "average", label: "Average" },
  { value: "athletic", label: "Athletic" },
];

export const FREQUENCY: { value: Frequency; label: string }[] = [
  { value: "occasionally", label: "Occasionally" },
  { value: "weekly", label: "Weekly" },
  { value: "several_per_week", label: "Several times a week" },
];

export const WAVE_SIZES: { value: WaveSize; label: string }[] = [
  { value: "knee-waist", label: "Knee to waist" },
  { value: "waist-head", label: "Waist to head" },
  { value: "head-high-plus", label: "Head high +" },
];

export const WAVE_TYPES: { value: WaveType; label: string; hint: string }[] = [
  { value: "soft", label: "Soft and mushy", hint: "Slow, crumbly waves" },
  { value: "punchy", label: "Punchy beach break", hint: "Quick, steep, short walls" },
  { value: "hollow", label: "Fast and hollow", hint: "Point or reef, powerful and barrelling" },
];

export const GOALS: { value: Goal; label: string; hint: string }[] = [
  { value: "easy-catching", label: "Easy wave catching and stability", hint: "Paddle power, forgiving and steady" },
  { value: "glide", label: "Smooth glide and fun", hint: "Relaxed, flowy, easy-going rides" },
  { value: "speed-flow", label: "Speed and flow", hint: "Drive down the line, long drawn-out turns" },
  { value: "performance", label: "Sharp turns and performance", hint: "Tight, critical, responsive surfing" },
];

export const COMPLAINTS: { value: Complaint; label: string }[] = [
  { value: "hard-to-paddle", label: "Hard to paddle" },
  { value: "hard-to-catch", label: "Hard to catch waves" },
  { value: "unstable", label: "Unstable" },
  { value: "slow", label: "Slow" },
  { value: "stiff", label: "Stiff and hard to turn" },
  { value: "too-loose", label: "Too loose" },
];

const label = <T extends string>(list: { value: T; label: string }[], v?: T) => list.find((x) => x.value === v)?.label;
export const skillLabel = (v?: Skill) => label(SKILLS, v);
export const fitnessLabel = (v?: Fitness) => label(FITNESS, v);
export const frequencyLabel = (v?: Frequency) => label(FREQUENCY, v);
export const waveSizeLabel = (v?: WaveSize) => label(WAVE_SIZES, v);
export const waveTypeLabel = (v?: WaveType) => label(WAVE_TYPES, v);
export const goalLabel = (v?: Goal) => label(GOALS, v);
export const complaintLabel = (v?: Complaint) => label(COMPLAINTS, v);

// ── Board type → what is valid ────────────────────────────────────────────

/** Board types offered in the picker, per skill level (wave sports other than surfing are Shaper-mode only). */
const TYPES_BY_SKILL: Record<Skill, BoardTypeId[]> = {
  learning: ["softtop", "minimal", "longboard"],
  green_waves: ["softtop", "minimal", "longboard", "egg", "hybrid"],
  linking_turns: ["minimal", "longboard", "egg", "hybrid", "fish", "groveler", "shortboard"],
  advanced: ["shortboard", "fish", "hybrid", "groveler", "egg", "minimal", "longboard", "gun"],
};
export const SHAPER_ONLY_TYPES: BoardTypeId[] = ["sup", "bodyboard", "skim"];

export const boardTypesFor = (skill: Skill | undefined, shaperMode = false): BoardTypeId[] => {
  const base = skill ? TYPES_BY_SKILL[skill] : TYPES_BY_SKILL.advanced;
  return shaperMode ? [...new Set([...base, ...TYPES_BY_SKILL.advanced, ...SHAPER_ONLY_TYPES])] : base;
};

const GENERIC_TAILS: TailShape[] = ["squash", "square", "round", "roundpin"];
const TAILS: Partial<Record<BoardTypeId, TailShape[]>> = {
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

const GENERIC_FINS: FinSetup[] = ["single", "thruster", "quad"];
const FINS: Partial<Record<BoardTypeId, FinSetup[]>> = {
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

export type Bottom = NonNullable<UserDetails["bottom_contour"]>;
const BOTTOMS: Partial<Record<BoardTypeId, Bottom[]>> = {
  shortboard: ["single-concave", "double-concave", "vee", "channels"],
  fish: ["flat", "single-concave"],
  hybrid: ["single-concave", "double-concave", "vee", "channels"],
  longboard: ["flat", "vee", "single-concave"],
  minimal: ["flat", "single-concave", "vee"],
  gun: ["single-concave", "double-concave", "vee"],
  groveler: ["flat", "single-concave", "double-concave", "channels"],
  egg: ["flat", "single-concave", "vee"],
  softtop: ["flat", "single-concave"],
};
const ALL_BOTTOMS: Bottom[] = ["flat", "single-concave", "double-concave", "vee", "channels"];

export const tailsFor = (type: BoardTypeId): TailShape[] => TAILS[type] ?? GENERIC_TAILS;
export const finsFor = (type: BoardTypeId): FinSetup[] => FINS[type] ?? GENERIC_FINS;
export const bottomsFor = (type: BoardTypeId): Bottom[] => BOTTOMS[type] ?? ALL_BOTTOMS;

export const isTailAllowed = (type: BoardTypeId, tail: TailShape) => tailsFor(type).includes(tail);
export const isFinAllowed = (type: BoardTypeId, fins: FinSetup) => finsFor(type).includes(fins);

// ── Gentle mismatch warnings ──────────────────────────────────────────────

const HIGH_PERFORMANCE: BoardTypeId[] = ["shortboard", "fish", "groveler", "gun"];
const SKILL_RANK: Record<Skill, number> = { learning: 0, green_waves: 1, linking_turns: 2, advanced: 3 };

const lengthLabel = (type: BoardTypeId) => {
  const m: Partial<Record<BoardTypeId, string>> = {
    shortboard: `5'6" high-performance shortboard`,
    gun: "gun / step-up",
    fish: "fish",
    groveler: "groveler",
  };
  return m[type] ?? boardTypeName(type).toLowerCase();
};

/** Soft warnings, never blocking. Every one of them can be ignored. */
export function getWarnings(d: Partial<UserDetails>): string[] {
  const out: string[] = [];
  const rank = d.skill ? SKILL_RANK[d.skill] : undefined;
  const type = d.board_type_preference;

  if (rank !== undefined && rank <= 1 && type && HIGH_PERFORMANCE.includes(type)) {
    out.push(
      `${d.skill === "learning" ? "Beginner" : "Early-stage"} + ${lengthLabel(type)}: this will be hard to paddle and catch waves on. A bigger, more stable board will progress you faster.`,
    );
  }
  if (rank !== undefined && rank <= 1 && d.goal === "performance") {
    out.push(
      "Sharp turns and performance is a stretch at this stage. The AI will still keep the board forgiving so you can keep catching waves.",
    );
  }
  if (rank !== undefined && rank <= 1 && (d.wave_size === "head-high-plus" || d.wave_type === "hollow")) {
    out.push(
      "Head-high or fast, hollow waves are tough at this level. The AI will favour paddle power and safety over performance.",
    );
  }
  if (type === "gun" && d.wave_size && d.wave_size !== "head-high-plus") {
    out.push("A gun / step-up is built for big waves, so it will feel stiff and clumsy in smaller surf.");
  }
  if (type === "longboard" && d.goal === "performance") {
    out.push("A longboard isn't the easiest route to sharp, tight turns. A hybrid or shortboard suits that goal better.");
  }
  if (type && ["shortboard", "gun"].includes(type) && d.fitness_level === "low") {
    out.push("Low fitness plus a low-volume board makes paddling hard work. Consider a bit more volume.");
  }
  if (d.current_length_in && d.current_volume_l && d.weight_kg && d.current_volume_l / d.weight_kg < 0.32) {
    out.push("Your current board's volume looks low for your weight, which could explain some of the complaints.");
  }
  if (d.shaper_mode && d.rail_edge === "hard" && type && ["fish", "softtop", "longboard", "egg"].includes(type)) {
    out.push(`Hard rails are unusual on a ${boardTypeName(type).toLowerCase()}. They'll feel less forgiving and more catchy.`);
  }
  if (d.shaper_mode && d.nose_rocker === "high" && type === "longboard") {
    out.push("A high nose rocker on a longboard costs glide and nose-riding ability.");
  }
  return out;
}

/** Remove any Shaper-mode pick that no longer fits the chosen board type. */
export function pruneInvalidPicks(d: Partial<UserDetails>): Partial<UserDetails> {
  const type = d.board_type_preference;
  const next: Partial<UserDetails> = {};
  if (!type) {
    // Without a board type we can't tell what is valid, so those picks are left to the AI.
    if (d.tail_shape) next.tail_shape = undefined;
    if (d.fin_configuration) next.fin_configuration = undefined;
    if (d.bottom_contour) next.bottom_contour = undefined;
    return next;
  }
  if (d.tail_shape && !isTailAllowed(type, d.tail_shape)) next.tail_shape = undefined;
  if (d.fin_configuration && !isFinAllowed(type, d.fin_configuration)) next.fin_configuration = undefined;
  if (d.bottom_contour && !bottomsFor(type).includes(d.bottom_contour)) next.bottom_contour = undefined;
  if (d.board_type_preference && d.skill && !boardTypesFor(d.skill, d.shaper_mode).includes(d.board_type_preference)) {
    next.board_type_preference = undefined;
  }
  return next;
}
