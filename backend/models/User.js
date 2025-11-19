// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  pushSubscription: { type: Object } // store push subscription
}, { timestamps: true });

export default mongoose.model("User", userSchema);
