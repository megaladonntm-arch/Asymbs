const API_BASE = import.meta.env.VITE_API_BASE || "https://anon-messenger-backend-production-7c1a.up.railway.app"

export async function register(username, password) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchUsers(token) {
  const res = await fetch(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function uploadFile(token, file) {
  const form = new FormData()
  form.append("file", file)

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
