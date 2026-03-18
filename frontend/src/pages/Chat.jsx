import { useEffect, useMemo, useRef, useState } from "react"
import ChatWindow from "../components/ChatWindow.jsx"
import FileUpload from "../components/FileUpload.jsx"
import UserList from "../components/UserList.jsx"
import { fetchUsers, uploadFile } from "../services/api.js"
import { createSocket } from "../services/socket.js"

export default function Chat({ token, username, onLogout }) {
  const [users, setUsers] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [search, setSearch] = useState("")
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [typingUser, setTypingUser] = useState("")
  const [notification, setNotification] = useState("")

  const wsRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const initialLoadRef = useRef(true)
  const initialLoadTimerRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const shouldReconnectRef = useRef(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  useEffect(() => {
    let mounted = true
    fetchUsers(token).then((data) => mounted && setUsers(data)).catch(() => {})
    return () => { mounted = false }
  }, [token])

  useEffect(() => {
    shouldReconnectRef.current = true

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg])

      const fromOther = msg.sender_username && msg.sender_username !== username
      if (!fromOther || initialLoadRef.current) return

      setNotification(`New message from ${msg.sender_username}`)
      setTimeout(() => setNotification(""), 2000)

      if (typeof window !== "undefined" && document.hidden && "Notification" in window && Notification.permission === "granted") {
        const body = msg.content?.length > 140 ? `${msg.content.slice(0, 140)}…` : msg.content
        const n = new Notification("New message", {
          body: `${msg.sender_username}: ${body || ""}`
        })
        setTimeout(() => n.close(), 4000)
      }
    }

    const handleStatus = (status) => {
      setOnlineUsers(status.online || [])
    }

    const handleTyping = (typing) => {
      if (typing.username && typing.username !== username) {
        setTypingUser(typing.username)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 1200)
      }
    }

    const scheduleReconnect = () => {
      if (!shouldReconnectRef.current) return
      reconnectAttemptsRef.current += 1
      const delay = Math.min(10000, 500 * Math.pow(2, reconnectAttemptsRef.current - 1))
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = setTimeout(connect, delay)
    }

    const connect = () => {
      if (!shouldReconnectRef.current) return
      initialLoadRef.current = true
      if (initialLoadTimerRef.current) clearTimeout(initialLoadTimerRef.current)

      const ws = createSocket(
        username,
        token,
        handleMessage,
        handleStatus,
        handleTyping,
        (event) => {
          if (!shouldReconnectRef.current) return
          if (event?.code === 1008) {
            setNotification("Session expired. Please log in again.")
            setTimeout(() => setNotification(""), 2500)
            shouldReconnectRef.current = false
            onLogout?.()
            return
          }
          scheduleReconnect()
        },
        () => {
          reconnectAttemptsRef.current = 0
          if (initialLoadTimerRef.current) clearTimeout(initialLoadTimerRef.current)
          initialLoadTimerRef.current = setTimeout(() => { initialLoadRef.current = false }, 1500)
        }
      )

      wsRef.current = ws
    }

    connect()

    return () => {
      shouldReconnectRef.current = false
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (initialLoadTimerRef.current) clearTimeout(initialLoadTimerRef.current)
      wsRef.current?.close()
    }
  }, [token, username, onLogout])

  const filteredUsers = useMemo(() => {
    const s = search.toLowerCase()
    return users.filter((u) => u.username.toLowerCase().includes(s))
  }, [users, search])

  const sendMessage = () => {
    if (!input.trim()) return
    wsRef.current?.send(JSON.stringify({ type: "message", content: input }))
    setInput("")
  }

  const handleTyping = (value) => {
    setInput(value)
    wsRef.current?.send(JSON.stringify({ type: "typing", username }))
  }

  const handleUpload = async (file) => {
    try {
      const uploaded = await uploadFile(token, file)
      const content = `__file__:${uploaded.id}:${uploaded.original_name}`
      wsRef.current?.send(JSON.stringify({ type: "message", content }))
    } catch {
      setNotification("Upload failed")
      setTimeout(() => setNotification(""), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text flex relative">
      <div className="absolute inset-0 noise opacity-40" />
      <div className="absolute inset-0 scanlines opacity-20" />

      <aside className="relative w-80 border-r border-[#1f1f1f] bg-card/60 backdrop-blur p-0">
        <div className="p-4 border-b border-[#1f1f1f]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Connected as</div>
              <div className="text-accent">{username}</div>
            </div>
            <button className="text-xs text-gray-400 hover:text-accent" onClick={onLogout}>Logout</button>
          </div>
        </div>
        <UserList users={filteredUsers} onlineUsers={onlineUsers} search={search} setSearch={setSearch} />
      </aside>

      <main className="relative flex-1 flex flex-col">
        <div className="border-b border-[#1f1f1f] p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">Global Chat</div>
            <div className="text-sm text-accent">/broadcast</div>
          </div>
          {notification && <div className="text-xs text-accent animate-floaty">{notification}</div>}
        </div>

        <div className="flex-1">
          <ChatWindow messages={messages} username={username} typingUser={typingUser} />
        </div>

        <div className="p-4 border-t border-[#1f1f1f] space-y-3">
          <FileUpload onUpload={handleUpload} />
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-black/40 border border-[#1f1f1f] rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            <button
              className="px-5 py-3 rounded-lg bg-accent text-black font-semibold hover:brightness-110 transition"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
