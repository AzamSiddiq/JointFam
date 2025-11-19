import { useState, useEffect } from "react";
import { api, socket } from "./services/api";
import JoinRoom from "./components/JoinRoom";
import Room from "./components/Room";
import Login from "./components/Login";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    return token && email ? { token, email, token } : null;
  });

  const [joinedRoom, setJoinedRoom] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Setup socket auth & connect
    socket.auth = { token: user.token };
    socket.connect();

    socket.on("connect_error", (err) => console.error(err));

    // Push notifications
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js").then(async (reg) => {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const { data } = await api.get("/api/push/vapidPublicKey");
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(data.key)
          });
          await api.post("/api/push/subscribe", sub, { headers: { token: user.token } });
        }
      });
    }

    return () => {
      socket.disconnect();
      socket.off("connect_error");
    };
  }, [user]);

  if (!user) return <Login setUser={setUser} />;
  if (!joinedRoom) return <JoinRoom onJoin={setJoinedRoom} />;

  return <Room user={{ ...user, roomId: joinedRoom.roomId }} socket={socket} />;
}
