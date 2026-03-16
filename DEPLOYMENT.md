BACKEND
1) Render
- Create a new Web Service.
- Root directory: backend
- Build command: pip install -r requirements.txt
- Start command: uvicorn main:app --host 0.0.0.0 --port $PORT

Environment variables (Render dashboard):
- SECRET_KEY: set a strong random value
- ACCESS_TOKEN_EXPIRE_MINUTES=120
- MESSAGE_TTL_SECONDS=3600
- FILE_TTL_SECONDS=3600
- MAX_UPLOAD_BYTES=104857600
- CLEANUP_INTERVAL_SECONDS=300
- DATABASE_URL (optional): use Render Postgres for persistence

Notes:
- If you keep SQLite, data resets on deploy/restart. Use Postgres for real data.

FRONTEND
1) Netlify
- Create a new site from repo.
- Base directory: frontend
- Build command: npm install && npm run build
- Publish directory: dist

Environment variables (Netlify dashboard):
- VITE_API_BASE=https://YOUR-RENDER-URL.onrender.com
- VITE_WS_BASE=wss://YOUR-RENDER-URL.onrender.com

Routing:
- netlify.toml already includes SPA redirect to /index.html.

LOCAL DEV
Backend:
- cd backend
- uvicorn main:app --reload

Frontend:
- cd frontend
- npm install
- npm run dev
- VITE_API_BASE and VITE_WS_BASE default to localhost.
