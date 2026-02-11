import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query"
import Button from "../components/Button.jsx"
import Card from "../components/Card.jsx"

const API = "http://localhost:3000/api"

async function signupFn(form) {
  const res = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: "",
    firstname: "",
    lastname: "",
    password: "",
  })

  const { mutate, isPending, error } = useMutation({
    mutationFn: signupFn,
    onSuccess: () => navigate("/login"),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutate(form)
  }

  return (
    <div className="min-h-screen flex bg-black">
      <Card className="bg-black">
        <h1 className="text-xl font-bold mb-5 text-white">Sign Up</h1>
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
          <label htmlFor="firstname" className="block text-sm font-bold mb-1 text-zinc-300">First Name</label>
          <input
            id="firstname"
            type="text"
            required
            className="w-full bg-black text-white p-2 mb-3 text-sm outline-none border-b border-white"
            value={form.firstname}
            onChange={(e) => setForm({ ...form, firstname: e.target.value })}
          />
          <label htmlFor="lastname" className="block text-sm font-bold mb-1 text-zinc-300">Last Name</label>
          <input
            id="lastname"
            type="text"
            required
            className="w-full bg-black text-white p-2 mb-3 text-sm outline-none border-b border-white"
            value={form.lastname}
            onChange={(e) => setForm({ ...form, lastname: e.target.value })}
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
            {isPending ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
        <p className="mt-3 text-center text-xs text-zinc-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400">Login</Link>
        </p>
      </Card>
    </div>
  )
}
