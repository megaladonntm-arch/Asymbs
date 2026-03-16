const WS_BASE = "ws://localhost:8000"

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
