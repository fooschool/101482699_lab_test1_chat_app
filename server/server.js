import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import GroupMessage from "./models/GroupMessage.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// auth routes
app.use("/api/auth", authRoutes);

// predefined rooms
const ROOMS = [
  { id: "devops", name: "devops" },
  { id: "cloud computing", name: "cloud computing" },
  { id: "covid19", name: "covid19" },
  { id: "sports", name: "sports" },
  { id: "nodeJS", name: "nodeJS" },
];

app.get("/api/rooms", (_req, res) => {
  res.json(ROOMS);
});

// track connected users: socketId -> { username, room }
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("joinRoom", async ({ room, username }) => {
    socket.join(room);
    connectedUsers.set(socket.id, { username, room });

    // send last 50 messages to the user who joined
    const history = await GroupMessage.find({ room }).sort({ _id: -1 }).limit(50).lean();
    socket.emit("messageHistory", history.reverse());

    // send updated user list
    const users = [...connectedUsers.values()]
      .filter((u) => u.room === room)
      .map((u) => u.username);
    io.to(room).emit("roomUsers", users);
  });

  socket.on("chatMessage", async ({ message }) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    const msg = await GroupMessage.create({
      from_user: user.username,
      room: user.room,
      message,
    });

    io.to(user.room).emit("chatMessage", msg);
  });

  socket.on("leaveRoom", () => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    socket.leave(user.room);
    connectedUsers.delete(socket.id);

    const users = [...connectedUsers.values()]
      .filter((u) => u.room === user.room)
      .map((u) => u.username);
    io.to(user.room).emit("roomUsers", users);
  });

  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    connectedUsers.delete(socket.id);

    const users = [...connectedUsers.values()]
      .filter((u) => u.room === user.room)
      .map((u) => u.username);
    io.to(user.room).emit("roomUsers", users);
  });
});

// db
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/chat_app";
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("connected to mongo");
  })
  .catch((err) => console.log("mongo err:", err));

httpServer.listen(3000, () => console.log("listening on 3000"));
