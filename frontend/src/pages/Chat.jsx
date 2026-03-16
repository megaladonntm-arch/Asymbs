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

  useEffect(() => {
    let mounted = true
    fetchUsers(token).then((data) => mounted && setUsers(data)).catch(() => {})
    return () => { mounted = false }
  }, [token])

  useEffect(() => {
    const ws = createSocket(
      username,
      token,
      (msg) => {
        setMessages((prev) => [...prev, msg])
        setNotification(`New message from ${msg.sender_username}`)
        setTimeout(() => setNotification(""), 2000)
      },
      (status) => {
        setOnlineUsers(status.online || [])
      },
      (typing) => {
        if (typing.username && typing.username !== username) {
          setTypingUser(typing.username)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 1200)
        }
      }
    )
    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [token, username])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setMessages((prev) => prev.filter((m) => new Date(m.expires_at).getTime() > now))
    }, 20000)
    return () => clearInterval(interval)
  }, [])

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
