import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
  },
  firstname: { type: String, required: [true, "First name is required"], trim: true },
  lastname: { type: String, required: [true, "Last name is required"], trim: true },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [4, "Password must be at least 4 characters"],
  },
  createon: {
    type: String,
    default: () =>
      new Date().toLocaleString("en-US", {
        month: "2-digit", day: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      }),
  },
});

export default mongoose.model("User", userSchema);
