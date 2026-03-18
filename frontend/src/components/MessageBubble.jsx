function parseFile(message) {
  if (!message?.content) return null
  if (!message.content.startsWith("__file__:")) return null
  const [, id, ...nameParts] = message.content.split(":")
  const original_name = nameParts.join(":")
  return { id, original_name }
}

function isImage(name) {
  return /\.(png|jpe?g|gif|webp|bmp)$/i.test(name)
}

function isVideo(name) {
  return /\.(mp4|webm|ogg|mov|mkv)$/i.test(name)
}

export default function MessageBubble({ message, isOwn }) {
  const file = parseFile(message)
  const token = localStorage.getItem("token")
  const apiBase = import.meta.env.VITE_API_BASE || "https://asymbs-production.up.railway.app"
  const downloadUrl = file ? `${apiBase}/files/${file.id}?token=${encodeURIComponent(token || "")}` : null
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-floaty`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-3 border ${isOwn ? "bg-accent/10 border-accent/40" : "bg-card border-[#1f1f1f]"}`}>
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <span className="text-accent">{message.sender_username}</span>
          <span>{new Date(message.created_at).toLocaleTimeString()}</span>
        </div>
        {!file && <div className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>}
        {file && (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-accent">File: {file.original_name}</div>
            {isImage(file.original_name) && (
              <img src={downloadUrl} alt={file.original_name} className="max-h-64 rounded-lg border border-[#1f1f1f]" />
            )}
            {isVideo(file.original_name) && (
              <video controls className="max-h-64 rounded-lg border border-[#1f1f1f]">
                <source src={downloadUrl} />
              </video>
            )}
            <a
              href={downloadUrl}
              className="text-xs text-accent underline hover:brightness-110"
              target="_blank"
              rel="noreferrer"
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

