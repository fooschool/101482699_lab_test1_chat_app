import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { io } from "socket.io-client";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import useTyping from "../hooks/useTyping.js";

export default function Room() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const user = JSON.parse(localStorage.getItem("chat_user") || "{}");
  const socketRef = useRef(null);

  const [roomUsers, setRoomUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");

  // private message state
  const [dmUser, setDmUser] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);
  const [dmInput, setDmInput] = useState("");
  const [roomTyping, addRoomTyping] = useTyping();
  const [dmTyping, addDmTyping] = useTyping();

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

    socket.on("privateMessage", (msg) => {
      setDmMessages((prev) => [...prev, msg]);
    });

    socket.on("privateHistory", (msgs) => {
      setDmMessages(msgs);
    });

    socket.on("typing", ({ username, type }) => {
      if (type === "dm") addDmTyping(username);
      else addRoomTyping(username);
    });

    socket.emit("joinRoom", { room: roomId, username: user.firstname });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const handleTyping = (to_user) => {
    socketRef.current.emit("typing", { to_user: to_user || null });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    socketRef.current.emit("chatMessage", { message: msgInput });
    setMsgInput("");
  };

  const openDm = (username) => {
    if (username === user.firstname) return;
    setDmUser(username);
    setDmMessages([]);
    socketRef.current.emit("getPrivateHistory", { with_user: username });
  };

  const sendDm = (e) => {
    e.preventDefault();
    if (!dmInput.trim()) return;
    socketRef.current.emit("privateMessage", { to_user: dmUser, message: dmInput });
    setDmInput("");
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
        <Card>
          <p className="text-sm text-zinc-300 mb-2">
            Online: {roomUsers.map((name, i) => (
              <span key={i}>
                {i > 0 && ", "}
                <span
                  onClick={() => openDm(name)}
                  className={name !== user.firstname ? "cursor-pointer underline" : ""}
                >
                  {name}
                </span>
              </span>
            ))}
            {roomUsers.length === 0 && "none"}
          </p>

          {messages.map((msg, i) => (
            <p key={i} className="text-sm text-white">
              <span className="text-zinc-400">{msg.from_user}: </span>
              {msg.message}
            </p>
          ))}

          {roomTyping.length > 0 && <p className="text-zinc-500 text-xs mt-2">{roomTyping.join(", ")} typing...</p>}
          <form onSubmit={sendMessage} className="mt-4">
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onInput={() => handleTyping()}
              placeholder="Type a message..."
              className="w-full bg-black text-white p-2 text-sm outline-none border-b border-white"
            />
            <Button type="submit" className="mt-2">Send</Button>
          </form>
        </Card>

        {dmUser && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white font-bold">DM with {dmUser}</p>
              <Button onClick={() => setDmUser(null)} className="ml-4">Close</Button>
            </div>

            {dmMessages.map((msg, i) => (
              <p key={i} className="text-sm text-white">
                <span className="text-zinc-400">{msg.from_user}: </span>
                {msg.message}
              </p>
            ))}

            {dmTyping.length > 0 && <p className="text-zinc-500 text-xs mt-2">{dmTyping.join(", ")} typing...</p>}
            <form onSubmit={sendDm} className="mt-4">
              <input
                type="text"
                value={dmInput}
                onChange={(e) => setDmInput(e.target.value)}
                onInput={() => handleTyping(dmUser)}
                placeholder={`Message ${dmUser}...`}
                className="w-full bg-black text-white p-2 text-sm outline-none border-b border-white"
              />
              <Button type="submit" className="mt-2">Send</Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
