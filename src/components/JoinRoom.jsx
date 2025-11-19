import { useState } from "react";
import { socket } from "../services/api";

export default function JoinRoom({ onJoin }) {
  const [roomId, setRoomId] = useState("");
  const [passcode, setPasscode] = useState("");

  const handleJoin = () => {
    if (!roomId || !passcode) return alert("Fill all fields");

    // Emit join-room event to backend
    socket.emit("join-room", { roomId, passcode, email: user.email, name: user.name || user.email });

    // Save room locally
    onJoin({ roomId, passcode });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Join Room</h2>
      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <br /><br />
      <input
        type="text"
        placeholder="Passcode"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
      />
      <br /><br />
      <button onClick={handleJoin}>Join Room</button>
    </div>
  );
}
