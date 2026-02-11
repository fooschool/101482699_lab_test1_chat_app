import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema({
  from_user: { type: String, required: true },
  room: { type: String, required: true },
  message: { type: String, required: true },
  date_sent: {
    type: String,
    default: () =>
      new Date().toLocaleString("en-US", {
        month: "2-digit", day: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      }),
  },
});

export default mongoose.model("GroupMessage", groupMessageSchema);
