import kb from "./knowledge/boardModels.json";

// Knowledge base built from the CSVs in the backend folder (see scripts/build-knowledge.py).
type Model = (typeof kb.models)[number];

const fmt = (r: { min: number; max: number }) => `${r.min}–${r.max}`;

/** The plain-English columns for every model; this goes into the system prompt. */
export const englishKnowledge = (): string =>
  kb.models
    .map(
      (m) =>
        `- ${m.id} ${m.model} (${m.family}, typically ${m.typicalLength}): ${m.english.whatItIs} ` +
        `Feel: ${m.english.feel} Best waves: ${m.english.bestWaves} Surfer level: ${m.english.surferLevel}.`,
    )
    .join("\n");

export const glossaryKnowledge = (): string =>
  kb.glossary.map((g) => `- ${g.term}: ${g.meaning} (${g.why})`).join("\n");

const LEVELS = ["beginner", "intermediate", "advanced", "expert"];
const FAMILY_BY_TYPE: Record<string, string[]> = {
  shortboard: ["Shortboard"], groveler: ["Shortboard"], fish: ["Fish"], hybrid: ["Hybrid"],
  egg: ["Mid-length"], minimal: ["Funboard"], softtop: ["Funboard"], longboard: ["Longboard"], gun: ["Step-up"],
};

/** Rank models for the surfer: skill-level fit, board type preference, then keyword overlap with free text. */
export function retrieveModels(details: Record<string, unknown>, limit = 3): Model[] {
  const SKILL_LEVEL: Record<string, number> = { learning: 0, green_waves: 1, linking_turns: 1, advanced: 2 };
  const raw = String(details.skill ?? "");
  const skill = raw in SKILL_LEVEL ? SKILL_LEVEL[raw] : LEVELS.indexOf(raw);
  const families = FAMILY_BY_TYPE[String(details.board_type_preference ?? "")] ?? [];
  const words = String(
    [details.additional_notes, details.goal, details.wave_type, details.wave_size].filter(Boolean).join(" "),
  )
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);

  const scored = kb.models.map((m) => {
    const level = m.english.surferLevel.toLowerCase();
    let score = 0;
    if (skill >= 0) {
      const hit = LEVELS.map((l, i) => (level.includes(l) ? i : -1)).filter((i) => i >= 0);
      if (hit.length) {
        const lo = Math.min(...hit);
        const hi = level.includes(" to ") ? Math.max(...hit) : lo;
        score += skill >= lo && skill <= hi ? 3 : -Math.min(Math.abs(skill - lo), Math.abs(skill - hi));
      }
    }
    if (families.includes(m.family)) score += 5;
    const text = `${m.model} ${m.family} ${m.english.whatItIs} ${m.english.bestWaves}`.toLowerCase();
    score += words.filter((w) => text.includes(w)).length;
    return { m, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.m);
}

/** Measurement and shape ranges for the retrieved models; this goes into the request prompt. */
export const measurementContext = (models: Model[]): string =>
  models
    .map((m) => {
      const r = m.ranges;
      return (
        `${m.id} ${m.model}: length ${fmt(r.length)} in, width ${fmt(r.width)} in, thickness ${fmt(r.thickness)} in, ` +
        `volume ${fmt(r.volumeL)} L, nose width@12" ${fmt(r.noseWidth)} in, tail width@12" ${fmt(r.tailWidth)} in, ` +
        `nose rocker ${fmt(r.noseRocker)} in, tail rocker ${fmt(r.tailRocker)} in. ` +
        `Wide point: ${m.shape.widePoint}. Rails: ${m.shape.rails} Bottom: ${m.shape.bottom} ` +
        `Tail: ${m.shape.tail}. Nose: ${m.shape.nose}. Fins: ${m.shape.fins}.`
      );
    })
    .join("\n");
