import { useEffect, useState } from "react"
import Login from "./pages/Login.jsx"
import Chat from "./pages/Chat.jsx"

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "")
  const [username, setUsername] = useState(localStorage.getItem("username") || "")

  const onAuth = (newToken, newUsername) => {
    localStorage.setItem("token", newToken)
    localStorage.setItem("username", newUsername)
    setToken(newToken)
    setUsername(newUsername)
  }

  const onLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    setToken("")
    setUsername("")
  }

  useEffect(() => {
    if (!token) return
    localStorage.setItem("token", token)
  }, [token])

  if (!token) return <Login onAuth={onAuth} />

  return <Chat token={token} username={username} onLogout={onLogout} />
}
