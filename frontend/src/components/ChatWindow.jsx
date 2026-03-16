import { useEffect, useRef } from "react"
import MessageBubble from "./MessageBubble.jsx"

export default function ChatWindow({ messages, username, typingUser }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.map((m) => (
          <MessageBubble key={m.id || `${m.sender_username}-${m.created_at}`} message={m} isOwn={m.sender_username === username} />
        ))}
        <div ref={endRef} />
      </div>
      {typingUser && (
        <div className="px-4 pb-3 text-xs text-accent">
          {typingUser} typing<span className="animate-blink">...</span>
        </div>
      )}
    </div>
  )
}
