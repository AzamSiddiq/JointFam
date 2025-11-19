// backend/routes/push.js
import express from "express";
import User from "../models/User.js"; // ✅ exact casing
import webpush from "web-push";

const router = express.Router();

// Example endpoint for subscribing
router.post("/subscribe", async (req, res) => {
  try {
    const { token } = req.headers; // assume token is sent
    const subscription = req.body;

    // Validate user via token (pseudo code, adapt to your JWT logic)
    const user = await User.findOne({ /* decode token to find user */ });
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    user.pushSubscription = subscription;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
