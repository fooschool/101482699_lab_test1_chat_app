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
  const [messages, setMessages] = useState([])
  const [msgInput, setMsgInput] = useState("")

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => fetch("http://localhost:3000/api/rooms").then((r) => r.json()),
  })

  useEffect(() => {
    const socket = io("http://localhost:3000")
    socketRef.current = socket

    socket.on("roomUsers", (users) => {
      setRoomUsers(users)
    })

    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    socket.on("messageHistory", (msgs) => {
      setMessages(msgs)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const joinRoom = (roomId) => {
    socketRef.current.emit("joinRoom", { room: roomId, username: user.firstname })
    setCurrentRoom(roomId)
    setRoomUsers([])
    setMessages([])
  }

  const leaveRoom = () => {
    socketRef.current.emit("leaveRoom")
    setCurrentRoom(null)
    setRoomUsers([])
    setMessages([])
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!msgInput.trim()) return
    socketRef.current.emit("chatMessage", { message: msgInput })
    setMsgInput("")
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
        <span className="text-white text-sm">{user.firstname} | #{currentRoom}</span>
        <div>
          <button
            onClick={leaveRoom}
            className="bg-white text-black py-1.5 px-4 text-sm cursor-pointer hover:bg-zinc-300 mr-2"
          >
            Leave Room
          </button>
          <button
            onClick={logout}
            className="bg-white text-black py-1.5 px-4 text-sm cursor-pointer hover:bg-zinc-300"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-57px)]">
        <div className="m-auto p-4 sm:p-6 rounded-sm ring ring-white/20">

          <p className="text-sm text-zinc-300 mb-2">Online: {roomUsers.join(", ") || "none"}</p>

          {messages.map((msg, i) => (
            <p key={i} className="text-sm text-white">
              <span className="text-zinc-400">{msg.from_user}: </span>{msg.message}
            </p>
          ))}

          <form onSubmit={sendMessage} className="mt-4">
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-black text-white p-2 text-sm outline-none border-b border-white"
            />
            <button type="submit" className="bg-white text-black py-2 px-4 text-sm cursor-pointer hover:bg-zinc-300 mt-2">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
