import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    let { username, firstname, lastname, password } = req.body;

    // check if taken
    let found = await User.findOne({ username });
    if (found) return res.status(400).json({ error: "Username already exists" });

    let hashedPw = await bcrypt.hash(password, 10);
    let newUser = await User.create({ username, firstname, lastname, password: hashedPw });

    res.status(201).json({ message: "User created", username: newUser.username });
  } catch (err) {
    if (err.name === "ValidationError") {
      let msgs = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: msgs.join(", ") });
    }
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body;
    let user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid username or password" });

    let match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid username or password" });

    res.json({
      message: "Login successful",
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
    });
  } catch (err) {
    console.log("login err:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
