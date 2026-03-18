BACKEND (Railway)
1) Deploy backend on Railway (Dockerfile in repo root).
2) Set Environment Variables:
- SECRET_KEY (required)
- ACCESS_TOKEN_EXPIRE_MINUTES=120
- MESSAGE_TTL_SECONDS=3600
- FILE_TTL_SECONDS=3600
- MAX_UPLOAD_BYTES=104857600
- CLEANUP_INTERVAL_SECONDS=300
- DATABASE_URL (optional, use Railway Postgres for persistence)

FRONTEND (Netlify)
1) Create a new Netlify site from this repo.
2) Base directory: frontend
3) Build command: bash ./netlify-build.sh
4) Publish directory: dist

Environment variables (Netlify dashboard):
- VITE_API_BASE=https://asymbs-production.up.railway.app
- VITE_WS_BASE=wss://asymbs-production.up.railway.app
- NODE_VERSION=20.11.1

Notes:
- netlify-build.sh installs Node if Netlify image doesn't have npm.
- netlify.toml already contains build settings and SPA redirect.

LOCAL DEV
Backend:
- cd backend
- uvicorn main:app --reload

Frontend:
- cd frontend
- npm install
- npm run dev

