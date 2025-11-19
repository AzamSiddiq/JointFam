// backend/utils/push.js
import User from "../models/User.js"; // ✅ exact casing
import webpush from "web-push";

export async function sendPush(email, payload) {
  const user = await User.findOne({ email });
  if (!user || !user.pushSubscription) return;

  await webpush.sendNotification(user.pushSubscription, JSON.stringify(payload));
}
