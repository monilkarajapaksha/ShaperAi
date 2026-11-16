import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { z } from "zod";
import { generateBoardDesign, refineBoardDesign } from "./lang";
import {
  BOARD_TYPES,
  BOARD_COLORS,
  BOOL_PARAMS,
  ENUM_PARAMS,
  FIN_COLORS,
  NUMERIC_PARAMS,
  boardDesignInputSchema,
} from "./boardSchema";

type Bindings = {
  OPENROUTER_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use("*", logger());
app.use("*", cors());

const boardConfigurationRequest = z.object({
  userDetails: z.record(z.unknown()),
});

const reconfigureBoardRequest = z.object({
  design: boardDesignInputSchema,
  preference: z.string().trim().min(1).max(2000),
});

// Routes
app.get("/", (c) => c.text("ShaperAI API is running"));

// Parameter schema shared with the frontend board builder (lengths in inches).
app.get("/api/board-schema", (c) =>
  c.json({
    lengthUnit: "in",
    types: BOARD_TYPES,
    numeric: NUMERIC_PARAMS,
    enums: ENUM_PARAMS,
    booleans: BOOL_PARAMS,
    colors: { deck: BOARD_COLORS, bottom: BOARD_COLORS, fins: FIN_COLORS },
  }),
);

app.post("/api/board-configuration", async (c) => {
  const parsed = boardConfigurationRequest.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Invalid request", issues: parsed.error.issues }, 400);
  }

  const apiKey = c.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return c.json({ error: "OPENROUTER_API_KEY not configured" }, 500);
  }

  try {
    return c.json(await generateBoardDesign(parsed.data.userDetails, apiKey));
  } catch (error) {
    console.error("Error in /api/board-configuration:", error);
    return c.json({ error: "Failed to get response" }, 500);
  }
});

app.post("/api/reconfigure-board", async (c) => {
  const parsed = reconfigureBoardRequest.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Invalid request", issues: parsed.error.issues }, 400);
  }

  const apiKey = c.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return c.json({ error: "OPENROUTER_API_KEY not configured" }, 500);
  }

  try {
    const { design, preference } = parsed.data;
    return c.json(await refineBoardDesign(design, preference, apiKey));
  } catch (error) {
    console.error("Error in /api/reconfigure-board:", error);
    return c.json({ error: "Failed to get response" }, 500);
  }
});

export default app;
