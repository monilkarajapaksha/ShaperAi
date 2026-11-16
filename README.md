# Shaper AI

AI-assisted surfboard design. A surfer answers a short profile wizard, an AI shaper designs a board from a
knowledge base of reference board models, and the result opens in a parametric 3D board builder where it can be
refined with plain-English requests.

## Repository layout

| Folder | What it is |
|---|---|
| `frontend/` | React + Vite + TypeScript + Tailwind/shadcn UI, Firebase auth, 3D board builder |
| `shaper-backend/` | Hono API on Cloudflare Workers (LangChain + OpenRouter) with the RAG knowledge base |

## How it works

1. **Wizard** (`/create`): Surfer Profile → Fins & Finish → Review. Style, conditions and board shape are not asked;
   the AI infers them.
2. **Design**: `POST /api/board-configuration` sends the profile to the model.
3. **RAG knowledge base**: built from two CSVs in `shaper-backend/`.
   - The plain-English columns for every reference model and the glossary go into the **system prompt**.
   - Per request, the closest reference models (by skill level, board type and keywords in the surfer's notes)
     are retrieved and their measurement and shape ranges are added to the prompt.
4. **Refine**: `POST /api/reconfigure-board` applies a free-text request to the current design.

All lengths on the wire are in **inches**.

## Run locally

Prerequisites: Node 20+ and npm.

### Backend (port 8787)

```bash
cd shaper-backend
npm install
cp .dev.vars.example .dev.vars   # then set OPENROUTER_API_KEY
npm run dev                      # wrangler dev → http://localhost:8787
```

### Frontend (port 8080)

```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8787" > .env.local
npm run dev                      # http://localhost:8080
```

Auth uses Firebase (Google sign-in and email/password); the project config is in `frontend/src/lib/firebase.ts`.

> **macOS note:** if the repo lives in an iCloud-synced folder (e.g. `~/Desktop`), files can become "dataless" and
> `wrangler dev` may hang. Run the backend from a non-iCloud location.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Health check |
| GET | `/api/board-schema` | Parameter ranges, enums and colors shared with the builder |
| POST | `/api/board-configuration` | `{ "userDetails": {...} }` → board design, target volume, reasoning |
| POST | `/api/reconfigure-board` | `{ "design": {...}, "preference": "..." }` → refined design |

## Updating the knowledge base

Edit the two CSVs in `shaper-backend/`, then regenerate the JSON the Worker bundles:

```bash
cd shaper-backend
python3 scripts/build-knowledge.py
```

The reference ranges are typical starting values; have a shaper review them before treating them as ground truth.

## Deploy

- **Backend**: `cd shaper-backend && npm run deploy`. Set the key with `npx wrangler secret put OPENROUTER_API_KEY`.
- **Frontend**: `cd frontend && npm run build` (Netlify config in `frontend/netlify.toml`).
