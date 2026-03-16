import { useState } from "react"

export default function LoginForm({ onSubmit, loading, error }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState("login")

  const submit = (e) => {
    e.preventDefault()
    onSubmit?.({ username, password, mode })
  }

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 noise opacity-50" />
      <div className="absolute inset-0 scanlines opacity-20" />
      <div className="relative w-full max-w-md p-8 bg-card rounded-2xl shadow-soft glow-border animate-floaty">
        <div className="text-accent text-xs uppercase tracking-[0.4em] mb-3">Anonymous</div>
        <h1 className="text-2xl font-semibold mb-6">Access Node</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400">Username</label>
            <input
              className="mt-2 w-full bg-black/40 border border-[#1f1f1f] rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Password</label>
            <input
              type="password"
              className="mt-2 w-full bg-black/40 border border-[#1f1f1f] rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg bg-accent text-black font-semibold hover:brightness-110 transition"
              onClick={() => setMode("login")}
              disabled={loading}
            >
              Login
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg border border-accent text-accent hover:bg-accent hover:text-black transition"
              onClick={() => setMode("register")}
              disabled={loading}
            >
              Register
            </button>
          </div>
          <div className="text-xs text-gray-500">No email. No phone. Zero trace.</div>
        </form>
      </div>
    </div>
  )
}
