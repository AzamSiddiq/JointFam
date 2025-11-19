import { useState } from "react";

export default function MemberList({ members, onRing, onMessage }) {
  const [privateMessage, setPrivateMessage] = useState({});
  
  const handleSendMessage = (email) => {
    if (!privateMessage[email]) return;
    onMessage(email, privateMessage[email]);
    setPrivateMessage(prev => ({ ...prev, [email]: "" }));
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "20px" }}>
      {members.length === 0 && <div>No members yet</div>}
      {members.map((m, idx) => (
        <div key={idx} style={{ marginBottom: "10px" }}>
          <b>{m.email}</b>
          <button onClick={() => onRing(m.email)} style={{ marginLeft: "10px" }}>Ring</button>
          <br />
          <input
            type="text"
            placeholder="Private message..."
            value={privateMessage[m.email] || ""}
            onChange={(e) =>
              setPrivateMessage(prev => ({ ...prev, [m.email]: e.target.value }))
            }
            style={{ width: "60%", padding: "4px", marginRight: "4px" }}
          />
          <button onClick={() => handleSendMessage(m.email)}>Send</button>
        </div>
      ))}
    </div>
  );
}
