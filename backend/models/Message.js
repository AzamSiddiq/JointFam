// backend/models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: { type: String },
  from: { type: String, required: true }, // email
  to: { type: String }, // optional for private message
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);
