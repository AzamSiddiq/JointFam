// src/components/PrivateChatTable.jsx
import React from "react";

export default function PrivateChatTable({ members, socket, user, inputs, setInputs }) {
  // members: array of {email, name} (or string fallback)
  const displayName = (m) => (typeof m === "string" ? m : (m.name || m.email || m));

  const handleRing = (member) => {
    const to = typeof member === "string" ? member : member.email;
    socket.emit("ring-user", { to, from: user.email });
  };

  const handleSend = (member) => {
    const to = typeof member === "string" ? member : member.email;
    const text = (inputs[to] || "").trim();
    if (!text) return;
    socket.emit("send-message", { to, from: user.email, message: text });
    // sender UI cleared in Room via setInputs
    setInputs(prev => ({ ...prev, [to]: "" }));
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Members Table</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ddd" }}>
            <th style={{ textAlign: "left", padding: "8px" }}>Member</th>
            <th style={{ textAlign: "center", padding: "8px" }}>Ring</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Private Message</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, idx) => {
            const email = (typeof m === "string" ? m : m.email);
            return (
              <tr key={idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "8px" }}>{displayName(m)}</td>
                <td style={{ textAlign: "center", padding: "8px" }}>
                  {email !== user.email && (
                    <button onClick={() => handleRing(m)}>Ring</button>
                  )}
                </td>
                <td style={{ padding: "8px" }}>
                  {email !== user.email && (
                    <>
                      <input
                        value={inputs[email] || ""}
                        onChange={(e) => setInputs(prev => ({ ...prev, [email]: e.target.value }))}
                        placeholder="Type private message..."
                        style={{ padding: "6px", width: "60%" }}
                      />
                      <button onClick={() => handleSend(m)} style={{ marginLeft: 8 }}>
                        Send
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
