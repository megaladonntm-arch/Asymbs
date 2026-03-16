BACKEND (Railway)
1) Create a new Railway project and deploy from this repo.
2) Railway will detect `railway.json` and `Dockerfile` automatically.
3) Set Environment Variables in Railway:
- SECRET_KEY (required)
- ACCESS_TOKEN_EXPIRE_MINUTES=120
- MESSAGE_TTL_SECONDS=3600
- FILE_TTL_SECONDS=3600
- MAX_UPLOAD_BYTES=104857600
- CLEANUP_INTERVAL_SECONDS=300
- DATABASE_URL (optional, use Railway Postgres for persistence)

Notes:
- SQLite on Railway is ephemeral. Use Railway Postgres for real data.

FRONTEND (Netlify)
1) Create a new site from repo.
2) Base directory: frontend
3) Build command: npm install && npm run build
4) Publish directory: dist

Environment variables (Netlify dashboard):
- VITE_API_BASE=https://YOUR-RAILWAY-URL.up.railway.app
- VITE_WS_BASE=wss://YOUR-RAILWAY-URL.up.railway.app

Routing:
- netlify.toml includes SPA redirect to /index.html.

LOCAL DEV
Backend:
- cd backend
- uvicorn main:app --reload

Frontend:
- cd frontend
- npm install
- npm run dev
- VITE_API_BASE and VITE_WS_BASE default to localhost.
