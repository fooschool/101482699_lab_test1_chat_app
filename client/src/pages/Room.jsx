import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { io } from "socket.io-client";
import Button from "../components/Button.jsx";

export default function Room() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const user = JSON.parse(localStorage.getItem("chat_user") || "{}");
  const socketRef = useRef(null);

  const [roomUsers, setRoomUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("roomUsers", (users) => {
      setRoomUsers(users);
    });

    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messageHistory", (msgs) => {
      setMessages(msgs);
    });

    socket.emit("joinRoom", { room: roomId, username: user.firstname });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    socketRef.current.emit("chatMessage", { message: msgInput });
    setMsgInput("");
  };

  const leaveRoom = () => {
    socketRef.current.emit("leaveRoom");
    navigate("/chat");
  };

  const logout = () => {
    if (socketRef.current) socketRef.current.disconnect();
    localStorage.removeItem("chat_user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <span className="text-white text-sm">
          {user.firstname} | #{roomId}
        </span>
        <div>
          <Button onClick={leaveRoom} className="mr-2">Leave Room</Button>
          <Button onClick={logout}>Logout</Button>
        </div>
      </div>

      <div className="flex flex-1">
        <div className="m-auto p-4 sm:p-6 rounded-sm ring ring-white/20">
          <p className="text-sm text-zinc-300 mb-2">
            Online: {roomUsers.join(", ") || "none"}
          </p>

          {messages.map((msg, i) => (
            <p key={i} className="text-sm text-white">
              <span className="text-zinc-400">{msg.from_user}: </span>
              {msg.message}
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
            <Button type="submit" className="mt-2">Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
