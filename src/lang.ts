import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonMarkdownStructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import {
  BOARD_TYPES,
  BoardColors,
  BoardParams,
  BoardTypeId,
  NUMERIC_PARAMS,
  NumericParam,
  describeSchemaForPrompt,
  normalizeColors,
  normalizeParams,
  normalizeType,
} from "./boardSchema";

const numericFields = Object.fromEntries(
  Object.entries(NUMERIC_PARAMS).map(([k, r]) => [
    k,
    z
      .number()
      .optional()
      .describe(`${r.label} (${r.min}–${r.max} ${r.unit}): ${r.hint}`),
  ]),
) as Record<NumericParam, z.ZodOptional<z.ZodNumber>>;

const llmParamsSchema = z.object({
  ...numericFields,
  tailShape: z.string().optional().describe("Tail shape enum"),
  fins: z.string().optional().describe("Fin setup enum"),
  finish: z.string().optional().describe("Finish enum"),
  railProfile: z
    .string()
    .optional()
    .describe('Rail profile enum, e.g. "60/40"'),
  stringer: z.boolean().optional().describe("Wood stringer on/off"),
  leashPlug: z.boolean().optional().describe("Leash plug on/off"),
});

const parser = new JsonMarkdownStructuredOutputParser(
  z.object({
    boardType: z.string().describe("Board type id (one of the listed ids)"),
    params: llmParamsSchema.describe("Board parameters; all lengths in inches"),
    colors: z
      .object({
        deck: z.string().optional(),
        bottom: z.string().optional(),
        fins: z.string().optional(),
      })
      .optional()
      .describe(
        "Hex colors, only when the surfer expressed a color preference",
      ),
    targetVolumeLiters: z
      .number()
      .optional()
      .describe("Target board volume in liters"),
    reasoning: z
      .string()
      .describe("Concise reasoning tied to the surfer's inputs"),
  }),
);

const systemPrompt = `
You are a professional surfboard shaper and surf coach.
You design boards for a parametric 3D board builder. Every number you output drives the builder directly.

Units:
- ALL length-type params are in INCHES, including "length" (e.g. 6'2" = 74, 9'0" = 108).
- Ratios (noseTip, noseThickness, tailThickness, railEdge, deckDome) are 0–1.
- finCant and finToe are degrees.

Rules:
- Pick the best boardType id for the surfer, honoring their board type preference when given.
- Start from that type's preset and adjust: length, width, thickness, noseWidth, tailWidth and rocker are the most important.
- Fill in every param you have a reasoned opinion on; omit a param to keep the board type's preset value.
- Respect explicit surfer preferences (tail shape, fins, rails, contours, construction, colors).
- Size volume realistically for weight, skill, fitness and wave size, and report it as targetVolumeLiters.
- Use the current board dimensions (when provided) as a reference point.
- Stay inside the listed ranges. Use only the listed enum values.
- DO NOT add fields beyond the schema.
- Final answer MUST follow the format instructions exactly and be valid JSON ONLY — no prose before or after.

Typical lengths: shortboard 5'6"–6'2" (66–74), groveler/fish 5'2"–5'9" (62–69), egg/hybrid 6'6"–8'0" (78–96),
mini-mal 7'0"–8'6" (84–102), gun 6'10"–9'0"+ (82–108+), longboard 9'0"–10'0" (108–120).

PARAMETER REFERENCE
${describeSchemaForPrompt()}
`;

const createModel = (apiKey: string) =>
  new ChatOpenAI({
    apiKey,
    // anthropic/claude-3-7-sonnet was retired on OpenRouter. Opus 5.5 rejects sampling params, so no temperature.
    model: "anthropic/claude-sonnet-5.5",
    // Small JSON answer (+ thinking). Without a cap OpenRouter reserves the model's full output budget per request.
    maxTokens: 8000,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });

export interface BoardDesignResult {
  design: {
    version: 1;
    type: BoardTypeId;
    typeName: string;
    lengthUnit: "in";
    params: BoardParams;
    colors: BoardColors;
  };
  targetVolumeLiters?: number;
  reasoning: string;
}

type LlmOutput = z.infer<typeof parser.schema>;

function toResult(
  out: LlmOutput,
  type: BoardTypeId,
  params: BoardParams,
  colors: BoardColors,
): BoardDesignResult {
  return {
    design: {
      version: 1,
      type,
      typeName: BOARD_TYPES.find((t) => t.id === type)!.name,
      lengthUnit: "in",
      params,
      colors,
    },
    targetVolumeLiters:
      typeof out.targetVolumeLiters === "number"
        ? +out.targetVolumeLiters.toFixed(1)
        : undefined,
    reasoning: out.reasoning ?? "",
  };
}

/** Generate a full board design from the surfer's wizard answers. */
export const generateBoardDesign = async (
  userDetails: unknown,
  apiKey: string,
): Promise<BoardDesignResult> => {
  const prompt = new PromptTemplate({
    template: [
      "{system_prompt}",
      "Read the surfer's profile below and design their board.",
      "",
      "SURFER PROFILE (JSON):",
      "```",
      "{requirements}",
      "```",
      "",
      "{format_instructions}",
    ].join("\n"),
    inputVariables: ["requirements"],
    partialVariables: {
      format_instructions: parser.getFormatInstructions(),
      system_prompt: systemPrompt,
    },
  });

  const out = await prompt
    .pipe(createModel(apiKey))
    .pipe(parser)
    .invoke({
      requirements: JSON.stringify(userDetails),
    });

  return toResult(
    out,
    normalizeType(out.boardType),
    normalizeParams(out.params),
    normalizeColors(out.colors),
  );
};

/** Refine an existing builder design from a free-text request; unchanged params are carried over. */
export const refineBoardDesign = async (
  current: {
    type?: string;
    params: Record<string, unknown>;
    colors?: Record<string, unknown>;
  },
  preference: string,
  apiKey: string,
): Promise<BoardDesignResult> => {
  const prompt = new PromptTemplate({
    template: [
      "{system_prompt}",
      "The surfer is fine-tuning an existing design. Apply their request to the CURRENT DESIGN.",
      "Keep boardType unless the request clearly calls for a different kind of board.",
      "In params, output ONLY the parameters you change; everything you omit stays as it is.",
      "Only include colors if the request is about colors.",
      "",
      "CURRENT DESIGN (JSON, lengths in inches):",
      "```",
      "{current_design}",
      "```",
      "",
      "SURFER REQUEST:",
      "```",
      "{preference}",
      "```",
      "",
      "{format_instructions}",
    ].join("\n"),
    inputVariables: ["current_design", "preference"],
    partialVariables: {
      format_instructions: parser.getFormatInstructions(),
      system_prompt: systemPrompt,
    },
  });

  const out = await prompt
    .pipe(createModel(apiKey))
    .pipe(parser)
    .invoke({
      current_design: JSON.stringify(current),
      preference,
    });

  const type = normalizeType(out.boardType, normalizeType(current.type));
  const params = normalizeParams({
    ...normalizeParams(current.params),
    ...normalizeParams(out.params),
  });
  const colors = {
    ...normalizeColors(current.colors),
    ...normalizeColors(out.colors),
  };
  return toResult(out, type, params, colors);
};
