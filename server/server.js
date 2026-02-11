import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import GroupMessage from "./models/GroupMessage.js";
import PrivateMessage from "./models/PrivateMessage.js";

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

  socket.on("privateMessage", async ({ to_user, message }) => {
    const from = connectedUsers.get(socket.id);
    if (!from) return;

    const msg = await PrivateMessage.create({
      from_user: from.username,
      to_user,
      message,
    });

    // find recipient socket
    for (const [id, u] of connectedUsers) {
      if (u.username === to_user) {
        io.to(id).emit("privateMessage", msg);
        break;
      }
    }
    // also send back to sender
    socket.emit("privateMessage", msg);
  });

  socket.on("getPrivateHistory", async ({ with_user }) => {
    const me = connectedUsers.get(socket.id);
    if (!me) return;

    const history = await PrivateMessage.find({
      $or: [
        { from_user: me.username, to_user: with_user },
        { from_user: with_user, to_user: me.username },
      ],
    }).sort({ _id: -1 }).limit(50).lean();

    socket.emit("privateHistory", history.reverse());
  });

  socket.on("typing", ({ to_user }) => {
    const from = connectedUsers.get(socket.id);
    if (!from) return;

    if (to_user) {
      // DM typing
      for (const [id, u] of connectedUsers) {
        if (u.username === to_user) {
          io.to(id).emit("typing", { username: from.username });
          break;
        }
      }
    } else {
      // room typing
      socket.to(from.room).emit("typing", { username: from.username });
    }
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
