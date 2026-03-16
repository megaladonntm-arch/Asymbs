const WS_BASE = import.meta.env.VITE_WS_BASE || "wss://anon-messenger-backend-production-7c1a.up.railway.app"

export function createSocket(username, token, onMessage, onStatus, onTyping) {
  const ws = new WebSocket(`${WS_BASE}/chat/${encodeURIComponent(username)}?token=${encodeURIComponent(token)}`)

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type === "message") onMessage?.(data)
      if (data.type === "status") onStatus?.(data)
      if (data.type === "typing") onTyping?.(data)
    } catch {
      // ignore
    }
  }

  return ws
}
