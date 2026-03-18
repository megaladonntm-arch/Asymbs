const WS_BASE = import.meta.env.VITE_WS_BASE || "wss://asymbs-production.up.railway.app"

export function createSocket(username, token, onMessage, onStatus, onTyping, onClose, onOpen) {
  const ws = new WebSocket(`${WS_BASE}/chat/${encodeURIComponent(username)}?token=${encodeURIComponent(token)}`)

  ws.onopen = () => {
    onOpen?.()
  }

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

  ws.onclose = (event) => {
    onClose?.(event)
  }

  return ws
}
