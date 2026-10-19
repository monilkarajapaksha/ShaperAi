import { z } from "zod";

// Board design parameters, mirroring the <surfboard-builder> public API
// (design-reference/surfboard-builder.js → PUB / GROUPS / TYPES).
// All length-type params travel in INCHES (lengthUnit "in"), including `length`.

export const BOARD_TYPES = [
  { id: "shortboard", name: "Shortboard", lengthIn: 70, widthIn: 19, thicknessIn: 2.4375 },
  { id: "fish", name: "Fish", lengthIn: 66, widthIn: 21, thicknessIn: 2.5 },
  { id: "hybrid", name: "Hybrid / Fun", lengthIn: 84, widthIn: 21.5, thicknessIn: 2.75 },
  { id: "longboard", name: "Longboard", lengthIn: 110, widthIn: 22.75, thicknessIn: 3 },
  { id: "minimal", name: "Mini-mal", lengthIn: 90, widthIn: 22, thicknessIn: 2.875 },
  { id: "gun", name: "Gun / Step-up", lengthIn: 88, widthIn: 19.5, thicknessIn: 2.875 },
  { id: "groveler", name: "Groveler", lengthIn: 64, widthIn: 20.5, thicknessIn: 2.5 },
  { id: "egg", name: "Egg", lengthIn: 76, widthIn: 21.5, thicknessIn: 2.75 },
  { id: "softtop", name: "Soft-top", lengthIn: 96, widthIn: 23, thicknessIn: 3.25 },
  { id: "sup", name: "SUP", lengthIn: 126, widthIn: 32, thicknessIn: 4.5 },
  { id: "bodyboard", name: "Bodyboard", lengthIn: 42, widthIn: 21.5, thicknessIn: 2.5 },
  { id: "skim", name: "Skimboard", lengthIn: 48, widthIn: 20.5, thicknessIn: 0.55 },
] as const;

export type BoardTypeId = (typeof BOARD_TYPES)[number]["id"];
export const BOARD_TYPE_IDS = BOARD_TYPES.map((t) => t.id) as [BoardTypeId, ...BoardTypeId[]];

export const TAIL_SHAPES = ["squash", "square", "swallow", "diamond", "crescent", "round", "roundpin", "pin"] as const;
export const FIN_SETUPS = ["none", "single", "twin", "thruster", "quad", "twoplus1", "five"] as const;
export const FINISHES = ["gloss", "satin", "foam"] as const;
export const RAIL_PROFILES = ["50/50", "60/40", "70/30", "80/20"] as const;

export const BOARD_COLORS = ["#f4f2ee", "#d8c7a6", "#ec3013", "#9b9797", "#9fb8ad", "#28465a", "#201e1d"] as const;
export const FIN_COLORS = ["#3a3634", "#e8e4dc", "#ec3013", "#201e1d", "#d8c7a6"] as const;

type Range = { min: number; max: number; unit: "in" | "deg" | "0-1"; label: string; hint: string };

// Same min/max as the builder's sliders (values outside are clamped by the builder anyway).
export const NUMERIC_PARAMS = {
  length: { min: 30, max: 150, unit: "in", label: "Length", hint: "overall length" },
  width: { min: 12, max: 34, unit: "in", label: "Width", hint: "width at the wide point" },
  thickness: { min: 0.4, max: 6, unit: "in", label: "Thickness", hint: "max thickness" },
  noseWidth: { min: 6, max: 32, unit: "in", label: "Nose width", hint: "measured 12\" down from the nose tip" },
  tailWidth: { min: 6, max: 32, unit: "in", label: "Tail width", hint: "measured 12\" up from the tail" },
  widePoint: { min: -6, max: 6, unit: "in", label: "Wide point", hint: "offset from center; positive = forward, negative = back" },
  noseTip: { min: 0, max: 1, unit: "0-1", label: "Nose tip", hint: "0 = pointed, 0.5 = medium, 1 = round" },
  tailDepth: { min: 0.5, max: 6, unit: "in", label: "Notch / point depth", hint: "only used by swallow, diamond and crescent tails" },
  noseRocker: { min: 0, max: 8, unit: "in", label: "Nose rocker", hint: "nose lift above flat" },
  tailRocker: { min: 0, max: 4, unit: "in", label: "Tail rocker", hint: "tail lift above flat" },
  noseThickness: { min: 0.2, max: 1, unit: "0-1", label: "Nose thickness", hint: "foil: nose thickness as a fraction of max thickness" },
  tailThickness: { min: 0.2, max: 1, unit: "0-1", label: "Tail thickness", hint: "foil: tail thickness as a fraction of max thickness" },
  railEdge: { min: 0, max: 1, unit: "0-1", label: "Rail edge", hint: "0 = soft, 1 = hard" },
  deckDome: { min: 0, max: 1, unit: "0-1", label: "Deck dome", hint: "0 = flat deck, 1 = domed" },
  singleConcave: { min: 0, max: 0.375, unit: "in", label: "Single concave", hint: "depth; 0 = off" },
  doubleConcave: { min: 0, max: 0.25, unit: "in", label: "Double concave", hint: "depth; 0 = off" },
  vee: { min: 0, max: 0.375, unit: "in", label: "Vee off tail", hint: "depth; 0 = off" },
  channels: { min: 0, max: 0.25, unit: "in", label: "Channels", hint: "depth; 0 = off" },
  finDepth: { min: 2.5, max: 11, unit: "in", label: "Fin depth", hint: "depth of the main fin(s)" },
  finCant: { min: 0, max: 10, unit: "deg", label: "Fin cant", hint: "side-fin cant in degrees" },
  finToe: { min: 0, max: 5, unit: "deg", label: "Fin toe", hint: "side-fin toe-in in degrees" },
} as const satisfies Record<string, Range>;

export type NumericParam = keyof typeof NUMERIC_PARAMS;

export const ENUM_PARAMS = {
  tailShape: TAIL_SHAPES,
  fins: FIN_SETUPS,
  finish: FINISHES,
  railProfile: RAIL_PROFILES,
} as const;

export const BOOL_PARAMS = ["stringer", "leashPlug"] as const;

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const numericShape = Object.fromEntries(
  Object.keys(NUMERIC_PARAMS).map((k) => [k, z.number().optional()]),
) as Record<NumericParam, z.ZodOptional<z.ZodNumber>>;

// Request-side validation: permissive shapes, then normalizeParams() clamps and drops bad values.
export const boardParamsInputSchema = z
  .object({
    ...numericShape,
    tailShape: z.string().optional(),
    fins: z.string().optional(),
    finish: z.string().optional(),
    railProfile: z.string().optional(),
    stringer: z.boolean().optional(),
    leashPlug: z.boolean().optional(),
  })
  .passthrough();

export const boardColorsSchema = z.object({
  deck: z.string().optional(),
  bottom: z.string().optional(),
  fins: z.string().optional(),
});

export const boardDesignInputSchema = z.object({
  type: z.string().optional(),
  lengthUnit: z.literal("in").optional(),
  units: z.enum(["imperial", "metric"]).optional(),
  params: boardParamsInputSchema.default({}),
  colors: boardColorsSchema.optional(),
});

export type BoardParams = Partial<Record<NumericParam, number>> & {
  tailShape?: (typeof TAIL_SHAPES)[number];
  fins?: (typeof FIN_SETUPS)[number];
  finish?: (typeof FINISHES)[number];
  railProfile?: (typeof RAIL_PROFILES)[number];
  stringer?: boolean;
  leashPlug?: boolean;
};

export type BoardColors = { deck?: string; bottom?: string; fins?: string };

/** Keep only known params, clamp numbers to the builder's ranges, drop invalid enums. */
export function normalizeParams(raw: Record<string, unknown> | undefined): BoardParams {
  const out: Record<string, unknown> = {};
  if (!raw) return out;
  for (const [key, range] of Object.entries(NUMERIC_PARAMS)) {
    const v = typeof raw[key] === "string" ? Number(raw[key]) : raw[key];
    if (typeof v === "number" && Number.isFinite(v)) out[key] = +clamp(v, range.min, range.max).toFixed(4);
  }
  for (const [key, options] of Object.entries(ENUM_PARAMS)) {
    const v = raw[key];
    if (typeof v === "string" && (options as readonly string[]).includes(v)) out[key] = v;
  }
  for (const key of BOOL_PARAMS) {
    if (typeof raw[key] === "boolean") out[key] = raw[key];
  }
  return out as BoardParams;
}

export function normalizeColors(raw: Record<string, unknown> | undefined): BoardColors {
  const out: BoardColors = {};
  if (!raw) return out;
  for (const k of ["deck", "bottom", "fins"] as const) {
    const v = raw[k];
    if (typeof v === "string" && HEX.test(v)) out[k] = v.toLowerCase();
  }
  return out;
}

export function normalizeType(raw: unknown, fallback: BoardTypeId = "shortboard"): BoardTypeId {
  return typeof raw === "string" && (BOARD_TYPE_IDS as string[]).includes(raw) ? (raw as BoardTypeId) : fallback;
}

/** Human-readable parameter reference for the LLM prompt. */
export function describeSchemaForPrompt(): string {
  const lines: string[] = [];
  lines.push("Board types (id — name — preset length × width × thickness in inches):");
  for (const t of BOARD_TYPES) lines.push(`- ${t.id} — ${t.name} — ${t.lengthIn} × ${t.widthIn} × ${t.thicknessIn}`);
  lines.push("", "Numeric params (key — label — range — meaning):");
  for (const [k, r] of Object.entries(NUMERIC_PARAMS)) lines.push(`- ${k} — ${r.label} — ${r.min} to ${r.max} ${r.unit} — ${r.hint}`);
  lines.push("", "Enum params:");
  lines.push(`- tailShape: ${TAIL_SHAPES.join(", ")}`);
  lines.push(`- fins: ${FIN_SETUPS.join(", ")} (twoplus1 = 2+1, five = 5-fin)`);
  lines.push(`- railProfile: ${RAIL_PROFILES.join(", ")} (upper/lower rail share; 50/50 = soft & full, 80/20 = low & hard)`);
  lines.push(`- finish: ${FINISHES.join(", ")}`);
  lines.push("", "Boolean params: stringer, leashPlug");
  lines.push("", `Colors (hex): deck/bottom from ${BOARD_COLORS.join(", ")}; fins from ${FIN_COLORS.join(", ")}`);
  return lines.join("\n");
}
