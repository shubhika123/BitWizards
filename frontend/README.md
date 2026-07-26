# Frontend

Next.js App Router UI for **BitWizards** — Bharat Feed, Genie, Local Bazaar, Outfit Circle, Sahi Daam, and admin views.

See the [root README](../README.md) for product intent and full-stack setup. The API lives in [`../backend`](../backend).

## Role

- Renders the shopper and admin experience in the browser.
- Calls the FastAPI backend directly from the client (`NEXT_PUBLIC_API_URL`).
- Uses Next.js rewrites and route handlers for some `/api/*` paths; in Docker those talk to the backend via `API_INTERNAL_URL`.

## Layout

```
frontend/
├── src/
│   ├── app/           # App Router pages and route handlers
│   ├── components/    # UI (feed, genie, sahidaam, ...)
│   ├── hooks/
│   ├── lib/           # apiConfig, supabase, firebase helpers
│   ├── store/         # Zustand stores
│   └── utils/
├── public/            # Static assets (catalog images, banners)
├── Dockerfile         # Multi-stage production image (standalone)
├── next.config.ts
└── package.json
```

## Local setup

Requires the backend on [http://localhost:8000](http://localhost:8000).

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (webpack) |
| `npm run build` | Production build (webpack, `output: "standalone"`) |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Environment and API wiring

Defined primarily in [`src/lib/apiConfig.ts`](src/lib/apiConfig.ts) and [`next.config.ts`](next.config.ts).

| Variable | Runtime | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Browser (and build) | Public API base. Default local: `http://localhost:8000`. |
| `API_INTERNAL_URL` | Server / Docker | Backend URL for rewrites and server-side fetches. Compose uses `http://backend:8000`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser | Optional Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser | Optional Supabase anon key |
| `NEXT_PUBLIC_FIREBASE_*` | Browser | Optional Firebase client config (`firebase.ts`) |
| `NEXT_PUBLIC_HF_TOKEN` | Browser | Optional Hugging Face token (e.g. Digital Twin) |

**Local default:** omit env files; the app targets `http://localhost:8000`.

**Docker:** Compose passes build args so the browser still uses `http://localhost:8000` (published host port), while the Next server uses `http://backend:8000` on the Compose network.

## Key routes

| Path | Feature |
|------|---------|
| `/` | Home |
| `/bharat-feed` | AI Bharat Feed |
| `/genie` | Natural language shopping / curation |
| `/local-bazaar` | Local Bazaar + negotiation UI |
| `/OutfitCircle` | Outfit Circle boards |
| `/OutfitCircle/[boardId]` | Single board |
| `/admin/dashboard` | Admin dashboard |
| `/dashboard`, `/profile`, `/bag` | Account / cart-style views |
| `/Category/[CategoryName]` | Category browsing |

## Docker

Multi-stage Dockerfile builds a Next.js **standalone** image (`output: "standalone"` in `next.config.ts`).

```bash
# From repo root (recommended)
docker compose up --build frontend

# Or build alone
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 \
  --build-arg API_INTERNAL_URL=http://backend:8000 \
  -t bitwizards-frontend \
  ./frontend
```

Notes:

- Build args bake `NEXT_PUBLIC_*` into the client bundle.
- Runtime `HOSTNAME=0.0.0.0` is forced so Docker’s container hostname does not break the standalone server bind.
- Frontend Compose service waits until the backend healthcheck passes.

## Related

- [Root README](../README.md)
- [Backend README](../backend/README.md)
