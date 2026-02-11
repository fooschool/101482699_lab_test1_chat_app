import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query"
import Button from "../components/Button.jsx"
import Card from "../components/Card.jsx"

const API = "http://localhost:3000/api"

async function loginFn(form) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: "", password: "" })

  const { mutate, isPending, error } = useMutation({
    mutationFn: loginFn,
    onSuccess: (data) => {
      localStorage.setItem("chat_user", JSON.stringify(data))
      navigate("/chat")
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutate(form)
  }

  return (
    <div className="min-h-screen flex bg-black">
      <Card className="bg-black">
        <h1 className="text-xl font-bold mb-5 text-white">Login</h1>
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-400 text-sm p-2 mb-3">
            {error.message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label htmlFor="username" className="block text-sm font-bold mb-1 text-zinc-300">Username</label>
          <input
            id="username"
            type="text"
            required
            className="w-full bg-black text-white p-2 mb-3 text-sm outline-none border-b border-white"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <label htmlFor="password" className="block text-sm font-bold mb-1 text-zinc-300">Password</label>
          <input
            id="password"
            type="password"
            required
            className="w-full bg-black text-white p-2 mb-4 text-sm outline-none border-b border-white"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="mt-3 text-center text-xs text-zinc-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-400">Sign Up</Link>
        </p>
      </Card>
    </div>
  )
}
