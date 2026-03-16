import { useState } from "react"
import LoginForm from "../components/LoginForm.jsx"
import { login, register } from "../services/api.js"

export default function Login({ onAuth }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async ({ username, password, mode }) => {
    setError("")
    setLoading(true)
    try {
      const data = mode === "register" ? await register(username, password) : await login(username, password)
      onAuth?.(data.access_token, username)
    } catch (err) {
      setError("Auth failed")
    } finally {
      setLoading(false)
    }
  }

  return <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />
}
