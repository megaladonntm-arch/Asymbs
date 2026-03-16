import { useCallback, useRef, useState } from "react"

export default function FileUpload({ onUpload }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDrag(false)
      const file = e.dataTransfer.files?.[0]
      if (file) onUpload?.(file)
    },
    [onUpload]
  )

  return (
    <div
      className={`border border-dashed rounded-xl px-4 py-3 text-xs text-gray-400 ${drag ? "border-accent bg-accent/10" : "border-[#1f1f1f]"}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between gap-3">
        <span>Drag & drop files here</span>
        <button
          className="text-accent border border-accent px-3 py-1 rounded-lg hover:bg-accent hover:text-black transition"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          Select
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onUpload?.(e.target.files[0])}
      />
    </div>
  )
}
