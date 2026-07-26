# Backend

FastAPI service for **BitWizards** — feeds, search, Local Bazaar, Genie, Sahi Daam, Outfit Circle, auth, and admin.

See the [root README](../README.md) for product intent and full-stack setup.

## Role

- Serves the HTTP API consumed by the Next.js frontend (and browser direct calls).
- Persists catalog, festivals, bazaar, social boards, and game state via SQLModel.
- Calls external AI / weather providers when API keys are configured.

## Layout

```
backend/
├── app/
│   ├── api/           # Route handlers (feed, bazaar, genie, sahidaam, ...)
│   ├── models/        # SQLModel schemas
│   ├── repository/    # Data access
│   ├── services/      # Business logic, LLM, fixtures
│   ├── utils/         # Helpers (geo, etc.)
│   ├── config.py      # Settings from env / .env
│   ├── database.py    # Engine, migrations helpers, seed on startup
│   └── main.py        # FastAPI app + CORS + routers
├── scripts/           # Seed / maintenance scripts
├── tests/             # Unit / API tests (unittest)
├── Dockerfile
├── requirements.txt
└── .env.example
```

## Local setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill in keys you need
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- Health: [http://localhost:8000/](http://localhost:8000/)
- OpenAPI: [http://localhost:8000/docs](http://localhost:8000/docs)

## Database

| Mode | How |
|------|-----|
| **SQLite (default)** | Leave `DATABASE_URL` empty. Uses `myntra.db` next to the app (local) or `/app/data/myntra.db` in Docker. |
| **Postgres** | Set `DATABASE_URL` to a SQLAlchemy URI (e.g. Supabase pooler URL). |

On startup, [`app/database.py`](app/database.py):

1. Creates tables (`SQLModel.metadata.create_all`)
2. Applies light schema fixes where needed
3. Seeds categories, products, festivals, boost rules, and bazaar fixtures if empty

## Environment variables

Copy [`.env.example`](.env.example) to `.env`.

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Recommended | Natural language search and explanations |
| `DATABASE_URL` | No | Postgres URI; omit for SQLite |
| `GEMINI_API_KEY` | No | Gemini-backed flows when used |
| `PINECONE_API_KEY` | No | Vector search |
| `PRUNA_API_KEY` | No | Try-on / image APIs |
| `HF_API_KEY` | No | Hugging Face integrations |
| `OPENWEATHER_API_KEY` | No | Live weather; simulated patterns if unset |
| `SUPABASE_URL` | No | Supabase project URL (backend) |
| `SUPABASE_KEY` | No | Supabase key (backend) |
| `PORT` | No | Listen port (default `8000`) |
| `HOST` | No | Bind host (default `0.0.0.0`) |
| `DEBUG` | No | FastAPI debug flag (default `True`) |

Settings are loaded in [`app/config.py`](app/config.py).

## API map

Routers are registered in [`app/main.py`](app/main.py).

| Prefix / path | Area |
|---------------|------|
| `GET /` | Health / status |
| `GET /fetch-feed` | Bharat feed |
| `GET /api/festivals/active` | Active festivals |
| `/outfit-circle/*` | Outfit Circle boards, pins, polls |
| `/api/bazaar/*` | Local Bazaar search, negotiate, sellers |
| `/api/genie/*` | Genie parse / curate / try-on |
| `/api/sahidaam/*` | Sahi Daam deck, guesses, rewards |
| `/api/admin/*` | Admin dashboard, reseed, resets |
| `/api/search/*`, `/api/social/*` | Search and social helpers |
| `/auth/*` | Phone check / register / verify |
| `/docs` | Swagger UI |

CORS allows local frontend origins (`localhost:3000` / `3001`) and the deployed Vercel host.

## Docker

Build context is this directory (`backend/`).

```bash
# From repo root
docker compose up --build backend
```

Compose sets:

- `DATABASE_URL=sqlite:////app/data/myntra.db`
- Named volume `backend_data` → `/app/data`
- Optional `env_file: backend/.env` (`required: false`)
- Healthcheck on `GET /`

Standalone image:

```bash
docker build -t bitwizards-backend ./backend
docker run --rm -p 8000:8000 --env-file backend/.env bitwizards-backend
```

## Tests

Tests under `tests/` use the Python standard library `unittest` runner (and FastAPI `TestClient` where applicable).

```bash
cd backend
source venv/bin/activate
python -m unittest discover -s tests -v
```

Ad-hoc scripts at the repo root of `backend/` (`test_genie.py`, `test_pruna.py`, etc.) are manual smoke scripts, not part of the automated suite.

## Related

- [Root README](../README.md)
- [Frontend README](../frontend/README.md)
