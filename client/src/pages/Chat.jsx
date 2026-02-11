import { useNavigate } from "react-router"
import { useQuery } from "@tanstack/react-query"
import Button from "../components/Button.jsx"

export default function Chat() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("chat_user") || "{}")

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => fetch("http://localhost:3000/api/rooms").then((r) => r.json()),
  })

  const logout = () => {
    localStorage.removeItem("chat_user")
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex bg-black">
      <div className="m-auto p-4 sm:p-6 rounded-sm ring ring-white/20">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-white">Welcome, {user.firstname}</h1>
          <Button onClick={logout} className="ml-4">Logout</Button>
        </div>
        <h2 className="text-sm font-bold mb-3 text-zinc-300">Select a Room</h2>
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => navigate(`/chat/${room.id}`)}
            className="block w-full text-left text-sm text-white p-2 mb-1 cursor-pointer hover:bg-zinc-900"
          >
            #{room.name}
          </button>
        ))}
      </div>
    </div>
  )
}
