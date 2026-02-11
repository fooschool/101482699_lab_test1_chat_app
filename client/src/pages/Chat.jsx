import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { io } from "socket.io-client"

export default function Chat() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("chat_user") || "{}")
  const socketRef = useRef(null)

  const [currentRoom, setCurrentRoom] = useState(null)
  const [roomUsers, setRoomUsers] = useState([])
  const [systemMessages, setSystemMessages] = useState([])

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => fetch("http://localhost:3000/api/rooms").then((r) => r.json()),
  })

  useEffect(() => {
    const socket = io("http://localhost:3000")
    socketRef.current = socket

    socket.on("systemMessage", (msg) => {
      setSystemMessages((prev) => [...prev, msg.text])
    })

    socket.on("roomUsers", (users) => {
      setRoomUsers(users)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const joinRoom = (roomId) => {
    socketRef.current.emit("joinRoom", { room: roomId, username: user.firstname })
    setCurrentRoom(roomId)
    setSystemMessages([])
    setRoomUsers([])
  }

  const leaveRoom = () => {
    socketRef.current.emit("leaveRoom")
    setCurrentRoom(null)
    setSystemMessages([])
    setRoomUsers([])
  }

  const logout = () => {
    if (socketRef.current) socketRef.current.disconnect()
    localStorage.removeItem("chat_user")
    navigate("/login")
  }

  // room picker
  if (!currentRoom) {
    return (
      <div className="min-h-screen flex bg-black">
        <div className="m-auto p-4 sm:p-6 rounded-sm ring ring-white/20">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-white">Welcome, {user.firstname}</h1>
            <button
              onClick={logout}
              className="bg-white text-black py-1.5 px-4 text-sm cursor-pointer hover:bg-zinc-300 ml-4"
            >
              Logout
            </button>
          </div>
          <h2 className="text-sm font-bold mb-3 text-zinc-300">Select a Room</h2>
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => joinRoom(room.id)}
              className="block w-full text-left text-sm text-white p-2 mb-1 cursor-pointer hover:bg-zinc-900"
            >
              #{room.name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // inside a room
  return (
    <div className="min-h-screen bg-black">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <span className="text-white text-sm">{user.firstname}</span>
        <button
          onClick={logout}
          className="bg-white text-black py-1.5 px-4 text-sm cursor-pointer hover:bg-zinc-300"
        >
          Logout
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-57px)]">
        <div className="m-auto p-4 sm:p-6 rounded-sm ring ring-white/20">
          <h1 className="text-xl font-bold text-white mb-4">#{currentRoom}</h1>

          <button
            onClick={leaveRoom}
            className="bg-white text-black py-2 px-4 text-sm cursor-pointer hover:bg-zinc-300 mb-4"
          >
            Leave Room
          </button>

          <p className="text-sm text-zinc-300 mb-2">Online: {roomUsers.join(", ") || "none"}</p>

          {systemMessages.map((msg, i) => (
            <p key={i} className="text-zinc-500 text-sm">{msg}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
