import { UserDetails, SurfboardSuggestion } from "@/types/userDetails";
import { BoardDesignInput, BoardParams, BoardTypeId, boardTypeName } from "@/types/boardDesign";

// Preset L × W × T in inches (mirrors the builder's TYPES table).
const PRESETS: Record<BoardTypeId, [number, number, number]> = {
  shortboard: [70, 19, 2.4375], fish: [66, 21, 2.5], hybrid: [84, 21.5, 2.75], longboard: [110, 22.75, 3],
  minimal: [90, 22, 2.875], gun: [88, 19.5, 2.875], groveler: [64, 20.5, 2.5], egg: [76, 21.5, 2.75],
  softtop: [96, 23, 3.25], sup: [126, 32, 4.5], bodyboard: [42, 21.5, 2.5], skim: [48, 20.5, 0.55],
};

/** Choices the surfer picked directly from builder options — these always win over the AI. */
export function explicitBuilderChoices(ud: UserDetails): BoardDesignInput {
  const params: Partial<BoardParams> = {};
  if (ud.tail_shape) params.tailShape = ud.tail_shape;
  if (ud.fin_configuration) params.fins = ud.fin_configuration;
  if (ud.rail_profile) params.railProfile = ud.rail_profile;
  if (ud.finish) params.finish = ud.finish;
  if (typeof ud.stringer === "boolean") params.stringer = ud.stringer;
  if (typeof ud.leash_plug === "boolean") params.leashPlug = ud.leash_plug;

  const colors: BoardDesignInput["colors"] = {};
  if (ud.deck_color) colors.deck = ud.deck_color;
  if (ud.bottom_color) colors.bottom = ud.bottom_color;
  if (ud.fin_color) colors.fins = ud.fin_color;

  return { params, colors, units: ud.units };
}

/** Merge the surfer's explicit picks into an AI-generated design. */
export function applyExplicitChoices(design: SurfboardSuggestion["design"], ud: UserDetails): SurfboardSuggestion["design"] {
  const picks = explicitBuilderChoices(ud);
  return {
    ...design,
    units: picks.units ?? design.units,
    params: { ...design.params, ...picks.params },
    colors: { ...design.colors, ...picks.colors },
  };
}

/** Qualitative wizard answers → approximate builder values (offline fallback only). */
function qualitativeParams(ud: UserDetails): Partial<BoardParams> {
  const p: Partial<BoardParams> = {};
  if (ud.nose_shape) p.noseTip = { pointed: 0.2, medium: 0.5, round: 0.85 }[ud.nose_shape];
  if (ud.wide_point) p.widePoint = { back: -1, centered: 0, forward: 1 }[ud.wide_point];
  if (ud.rail_edge) p.railEdge = { soft: 0.25, medium: 0.5, hard: 0.8 }[ud.rail_edge];
  if (ud.deck_dome) p.deckDome = { flat: 0.15, moderate: 0.45, domed: 0.75 }[ud.deck_dome];
  if (ud.bottom_contour) {
    const c = ud.bottom_contour;
    p.singleConcave = c === "single-concave" ? 0.2 : c === "flat" ? 0 : undefined;
    p.doubleConcave = c === "double-concave" ? 0.12 : c === "flat" ? 0 : undefined;
    p.vee = c === "vee" ? 0.15 : c === "flat" ? 0 : undefined;
    p.channels = c === "channels" ? 0.12 : 0;
  }
  return Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined));
}

/** Rough local estimate used when the AI backend is unreachable. */
export function fallbackSuggestion(ud: UserDetails): SurfboardSuggestion {
  const bigWaves = ud.wave_size === "6-10ft" || ud.wave_size === "10+ft";
  const type: BoardTypeId =
    ud.board_type_preference ??
    (ud.skill === "beginner" ? "softtop" : bigWaves ? "gun" : ud.skill === "intermediate" ? "hybrid" : "shortboard");

  // Guild-factor volume target (liters per kg) by skill and fitness.
  const guild = { beginner: 0.9, intermediate: 0.5, advanced: 0.4, pro: 0.36 }[ud.skill] ?? 0.5;
  const fitness = { sedentary: 1.1, average: 1, athletic: 0.92 }[ud.fitness_level] ?? 1;
  const target = (ud.weight_kg || 75) * guild * fitness;

  const [L, W, T] = PRESETS[type];
  const presetVolume = L * W * T * 0.016387 * 0.56;
  const r = Math.min(1.6, Math.max(0.6, target / presetVolume));
  const round = (v: number, step: number) => Math.round(v / step) * step;

  const params: Partial<BoardParams> = {
    length: round(L * Math.sqrt(r), 1),
    width: round(W * Math.pow(r, 0.25), 0.125),
    thickness: round(T * Math.pow(r, 0.25), 0.0625),
    ...qualitativeParams(ud),
  };

  const design = applyExplicitChoices(
    { version: 1, type, typeName: boardTypeName(type), lengthUnit: "in", params, colors: {} } as SurfboardSuggestion["design"],
    ud
  );

  return {
    design,
    targetVolumeLiters: Math.round(target * 10) / 10,
    reasoning:
      `Offline estimate (AI shaper unavailable): a ${boardTypeName(type).toLowerCase()} sized for about ` +
      `${Math.round(target)} L based on your ${ud.skill} skill, ${ud.fitness_level} fitness and ${ud.weight_kg} kg weight. ` +
      `Fine-tune it in the builder or ask the AI to refine it once the backend is reachable.`,
  };
}
