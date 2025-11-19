import { useState, useEffect, useRef } from "react";
import ringSound from "../assets/ring.mp3";
import PrivateChatTable from "./PrivateChatTable";

export default function Room({ user, socket }) {
  const [members, setMembers] = useState([]); // array of {email, name}
  const [messages, setMessages] = useState([]);
  const [roomMessage, setRoomMessage] = useState("");
  const [privateInputs, setPrivateInputs] = useState({}); // per-email input
  const [toasts, setToasts] = useState([]); // simple popup notifications
  const audioRef = useRef(new Audio(ringSound));

  useEffect(() => {
    if (!socket) return;

    socket.on("room-members", (list) => {
      // list should be array of {email, name} — keep robust
      setMembers(list || []);
    });

    socket.on("room-history", (history) => {
      setMessages(history.map(h => ({ type: h.to ? "private" : "room", ...h })));
    });

    socket.on("room-new-message", (msg) => {
      setMessages(prev => [...prev, { type: "room", ...msg }]);
    });

    socket.on("ring", (from) => {
      // from is email
      try { audioRef.current.play(); } catch (e) {}
      setMessages(prev => [...prev, { type: "ring", from }]);
      // toast
      addToast(`🔔 Ring from ${from}`);
    });

    // receive-message fires for both sender (echo) and receiver (target)
    socket.on("receive-message", ({ from, to, message }) => {
      // Only add to message list if I'm sender or receiver
      if (from === user.email || to === user.email) {
        setMessages(prev => [...prev, { type: "private", from, to, message }]);
      }
      // If I'm the receiver, show a toast
      if (to === user.email) {
        addToast(`📩 Private from ${from}: ${message}`);
      }
    });

    return () => {
      socket.off("room-members");
      socket.off("room-history");
      socket.off("room-new-message");
      socket.off("ring");
      socket.off("receive-message");
    };
  }, [socket, user.email]);

  const addToast = (text, ms = 6000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, text }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), ms);
  };

  // Room message
  const sendRoomMessage = () => {
    if (!roomMessage) return;
    socket.emit("room-message", { roomId: user.roomId, from: user.email, text: roomMessage });
    setMessages(prev => [...prev, { type: "room", from: "You", text: roomMessage }]);
    setRoomMessage("");
  };

  const ringAll = () => {
    socket.emit("ring-all", { roomId: user.roomId, from: user.email });
  };

  // Private message send triggered from PrivateChatTable via setPrivateInputs
  const sendPrivateMessage = (toEmail) => {
    const message = (privateInputs[toEmail] || "").trim();
    if (!message) return;
    socket.emit("send-message", { to: toEmail, from: user.email, message });
    // UI echo will come back via receive-message (server echoes to sender)
    setPrivateInputs(prev => ({ ...prev, [toEmail]: "" }));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Room: {user.roomId}</h2>
      <h3>Welcome, {user.name || user.email}</h3>
      <button onClick={ringAll}>Ring All 🔔</button>

      {/* Member Table component */}
      <PrivateChatTable
        members={members}
        socket={socket}
        user={user}
        inputs={privateInputs}
        setInputs={setPrivateInputs}
      />

      {/* Chat / Notifications */}
      <h3 style={{ marginTop: 20 }}>Chat / Notifications:</h3>
      <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
        {messages.map((m, idx) => {
          if (m.type === "ring") return <div key={idx} style={{ color: "red" }}>🔔 Ring from {m.from}</div>;
          if (m.type === "room") return <div key={idx}>💬 <b>{m.from}:</b> {m.text}</div>;
          if (m.type === "private") return <div key={idx} style={{ color: "purple" }}>📩 <b>{m.from} ➡ {m.to}:</b> {m.message}</div>;
          return null;
        })}
      </div>

      {/* Send Room Message */}
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          placeholder="Type a room message..."
          value={roomMessage}
          onChange={(e) => setRoomMessage(e.target.value)}
          style={{ width: "80%", padding: "8px" }}
        />
        <button onClick={sendRoomMessage} style={{ padding: "8px 16px" }}>Send</button>
      </div>

      {/* Simple toast area */}
      <div style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 9999
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: "#333",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
          }}>{t.text}</div>
        ))}
      </div>
    </div>
  );
}
