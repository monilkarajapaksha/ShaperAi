// Board design model of the <surfboard-builder> configurator (src/lib/surfboard-builder).
// Length-type params are in INCHES (lengthUnit "in") — including `length`; the builder
// displays them as ft/in or metric depending on `units`.

export const BOARD_TYPES = [
  { id: "shortboard", name: "Shortboard" },
  { id: "fish", name: "Fish" },
  { id: "hybrid", name: "Hybrid / Fun" },
  { id: "longboard", name: "Longboard" },
  { id: "minimal", name: "Mini-mal" },
  { id: "gun", name: "Gun / Step-up" },
  { id: "groveler", name: "Groveler" },
  { id: "egg", name: "Egg" },
  { id: "softtop", name: "Soft-top" },
  { id: "sup", name: "SUP" },
  { id: "bodyboard", name: "Bodyboard" },
  { id: "skim", name: "Skimboard" },
] as const;
export type BoardTypeId = (typeof BOARD_TYPES)[number]["id"];

export const TAIL_SHAPES = [
  { id: "squash", name: "Squash" },
  { id: "square", name: "Square" },
  { id: "swallow", name: "Swallow" },
  { id: "diamond", name: "Diamond" },
  { id: "crescent", name: "Crescent" },
  { id: "round", name: "Round" },
  { id: "roundpin", name: "Rounded pin" },
  { id: "pin", name: "Pin" },
] as const;
export type TailShape = (typeof TAIL_SHAPES)[number]["id"];

export const FIN_SETUPS = [
  { id: "none", name: "None" },
  { id: "single", name: "Single" },
  { id: "twin", name: "Twin keel" },
  { id: "thruster", name: "Thruster" },
  { id: "quad", name: "Quad" },
  { id: "twoplus1", name: "2 + 1" },
  { id: "five", name: "5-fin" },
] as const;
export type FinSetup = (typeof FIN_SETUPS)[number]["id"];

export const RAIL_PROFILES = ["50/50", "60/40", "70/30", "80/20"] as const;
export type RailProfile = (typeof RAIL_PROFILES)[number];

export const FINISHES = [
  { id: "gloss", name: "Gloss" },
  { id: "satin", name: "Satin" },
  { id: "foam", name: "Foam deck" },
] as const;
export type Finish = (typeof FINISHES)[number]["id"];

export const BOARD_COLORS = [
  { hex: "#f4f2ee", name: "Clear white" },
  { hex: "#d8c7a6", name: "Sand" },
  { hex: "#ec3013", name: "Signal red" },
  { hex: "#9b9797", name: "Concrete" },
  { hex: "#9fb8ad", name: "Sea glass" },
  { hex: "#28465a", name: "Deep water" },
  { hex: "#201e1d", name: "Ink" },
] as const;

export const FIN_COLORS = [
  { hex: "#3a3634", name: "Smoke" },
  { hex: "#e8e4dc", name: "Clear" },
  { hex: "#ec3013", name: "Signal red" },
  { hex: "#201e1d", name: "Ink" },
  { hex: "#d8c7a6", name: "Sand" },
] as const;

export interface BoardParams {
  length: number; // in
  width: number; // in
  thickness: number; // in
  noseWidth: number; // in, 12" down from nose
  tailWidth: number; // in, 12" up from tail
  widePoint: number; // in, + forward / − back of center
  noseTip: number; // 0 pointed … 1 round
  tailShape: TailShape;
  tailDepth: number; // in (swallow / diamond / crescent)
  noseRocker: number; // in
  tailRocker: number; // in
  noseThickness: number; // 0–1 of max thickness
  tailThickness: number; // 0–1 of max thickness
  railProfile: RailProfile;
  railEdge: number; // 0 soft … 1 hard
  deckDome: number; // 0 flat … 1 domed
  singleConcave: number; // in
  doubleConcave: number; // in
  vee: number; // in
  channels: number; // in
  fins: FinSetup;
  finDepth: number; // in
  finCant: number; // deg
  finToe: number; // deg
  stringer: boolean;
  leashPlug: boolean;
  finish: Finish;
}

export interface BoardColors {
  deck: string;
  bottom: string;
  fins: string;
}

export type Units = "imperial" | "metric";

/** Full design as returned by the builder's getDesign(). */
export interface BoardDesign {
  version: 1;
  type: BoardTypeId;
  typeName: string;
  lengthUnit: "in";
  units: Units;
  params: BoardParams;
  colors: BoardColors;
  computed: {
    volumeLiters: number;
    dimensions: string;
    widePointWidth: number;
    noseWidthMeasured: number;
    tailWidthMeasured: number;
    finCount: number;
  };
}

/** Partial design accepted by the builder's setDesign() and returned by the AI endpoints. */
export interface BoardDesignInput {
  type?: BoardTypeId;
  typeName?: string;
  lengthUnit?: "in";
  units?: Units;
  params?: Partial<BoardParams>;
  colors?: Partial<BoardColors>;
}

export const boardTypeName = (id?: string) => BOARD_TYPES.find((t) => t.id === id)?.name ?? "Custom";

/** 74 → 6'2" */
export const formatFeetInches = (inches: number) => {
  const i = Math.round(inches);
  return `${Math.floor(i / 12)}'${i % 12}"`;
};

const FRACTIONS: Record<number, string> = { 1: "⅛", 2: "¼", 3: "⅜", 4: "½", 5: "⅝", 6: "¾", 7: "⅞" };
/** 19.25 → 19¼" */
export const formatInches = (inches: number) => {
  const n = Math.round(inches * 8);
  const whole = Math.floor(n / 8);
  const rest = n % 8;
  return `${whole || (rest ? "" : "0")}${rest ? FRACTIONS[rest] : ""}"`;
};

export const formatDims = (p: Pick<BoardParams, "length" | "width" | "thickness">) =>
  `${formatFeetInches(p.length)} × ${formatInches(p.width)} × ${formatInches(p.thickness)}`;
