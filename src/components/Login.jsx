import { useState } from "react";
import { api } from "../services/api";

export default function Login({ setUser }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res;
      if (isSignup) {
        res = await api.post("/api/auth/signup", { name, email, password });
      } else {
        res = await api.post("/api/auth/login", { email, password });
      }

      const { token, email: userEmail, name: userName } = res.data;

      // Store in localStorage (simplest for demo; could move to cookies for prod)
      localStorage.setItem("token", token);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("name", userName || "");

      setUser({ token, email: userEmail, name: userName });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>{isSignup ? "Signup" : "Login"}</h2>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        {isSignup && (
          <div style={{ marginBottom: "10px" }}>
            <label>Name:</label><br />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
        )}
        <div style={{ marginBottom: "10px" }}>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <button type="submit" style={{ padding: "10px 20px" }} disabled={loading}>
          {loading ? "Please wait..." : isSignup ? "Signup" : "Login"}
        </button>
      </form>
      <p style={{ marginTop: "10px", textAlign: "center" }}>
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <span onClick={toggleMode} style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}>
          {isSignup ? "Login" : "Signup"}
        </span>
      </p>
    </div>
  );
}
