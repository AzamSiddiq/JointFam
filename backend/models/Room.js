// backend/models/Room.js
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  passcode: { type: String, required: true },
  members: [
    {
      email: String,
      socketId: String
    }
  ]
}, { timestamps: true });

export default mongoose.model("Room", roomSchema);
