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

// Minimal D1 surface we use (avoids pulling in @cloudflare/workers-types).
interface D1Result<T> { results: T[] }
interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  run(): Promise<unknown>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}
interface D1Database { prepare(sql: string): D1Statement }

type Bindings = {
  OPENROUTER_API_KEY: string;
  DB?: D1Database;
  /** Optional secret; when set, GET /api/feedback is enabled for `Authorization: Bearer <token>`. */
  FEEDBACK_ADMIN_TOKEN?: string;
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

const feedbackRequest = z.object({
  boardId: z.string().max(64).optional(),
  boardType: z.string().max(32).optional(),
  looksReal: z.boolean().optional(),
  wouldRide: z.boolean().optional(),
  problemAreas: z.array(z.enum(["nose", "tail", "rails", "fins", "bottom"])).max(5).optional(),
  report: z.string().trim().max(1000).optional(),
  context: z.record(z.unknown()).optional(),
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

const bit = (v: boolean | undefined) => (v === undefined ? null : v ? 1 : 0);

// Beta feedback: stored in D1 (also logged, so nothing is lost if the DB is not bound yet).
app.post("/api/feedback", async (c) => {
  const parsed = feedbackRequest.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Invalid request", issues: parsed.error.issues }, 400);
  }
  const f = parsed.data;
  console.log(JSON.stringify({ event: "board_feedback", at: new Date().toISOString(), ...f }));

  if (!c.env.DB) return c.json({ ok: true, stored: false });
  try {
    await c.env.DB.prepare(
      `INSERT INTO feedback (board_id, board_type, looks_real, would_ride, problem_areas, report, context)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        f.boardId ?? null,
        f.boardType ?? null,
        bit(f.looksReal),
        bit(f.wouldRide),
        JSON.stringify(f.problemAreas ?? []),
        f.report ?? null,
        f.context ? JSON.stringify(f.context) : null,
      )
      .run();
    return c.json({ ok: true, stored: true });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return c.json({ error: "Failed to save feedback" }, 500);
  }
});

// Read feedback back (newest first). Disabled unless FEEDBACK_ADMIN_TOKEN is set as a secret.
app.get("/api/feedback", async (c) => {
  const token = c.env.FEEDBACK_ADMIN_TOKEN;
  if (!token || !c.env.DB) return c.notFound();
  if (c.req.header("Authorization") !== `Bearer ${token}`) return c.json({ error: "Unauthorized" }, 401);
  const limit = Math.min(500, Math.max(1, Number(c.req.query("limit")) || 100));
  const { results } = await c.env.DB.prepare("SELECT * FROM feedback ORDER BY id DESC LIMIT ?").bind(limit).all();
  return c.json({ count: results.length, feedback: results });
});

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
