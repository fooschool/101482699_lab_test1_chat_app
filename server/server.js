import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

// auth routes
app.use("/api/auth", authRoutes);

// db
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/chat_app";
mongoose.connect(mongoURI).then(() => {
  console.log("connected to mongo");
}).catch(err => console.log("mongo err:", err));

app.listen(3000, () => console.log("listening on 3000"));
