import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", display: "grid", gap: 10 }}>
      <h2>{mode === "login" ? "Login" : "Register"}</h2>

      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      {mode === "register" && (
        <input placeholder="Display name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
      )}
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

      <button
        onClick={async () => {
          setErr("");
          try {
            if (mode === "register") await api.register(email, displayName, password);
            await api.login(email, password);
            nav("/trips");
          } catch (e: any) {
            setErr(e.message || "error");
          }
        }}
      >
        {mode === "login" ? "Login" : "Register + Login"}
      </button>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <button onClick={() => setMode(mode === "login" ? "register" : "login")}>
        Switch to {mode === "login" ? "Register" : "Login"}
      </button>
    </div>
  );
}