import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { api } from "./lib/api";
import Login from "./pages/Login";
import Trips from "./pages/Trips";
import Trip from "./pages/Trip";
import Settlement from "./pages/Settlement";

export default function App() {
  const nav = useNavigate();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <Link to="/trips" style={{ fontWeight: 700, textDecoration: "none" }}>Splitwise-lite</Link>
        <div style={{ flex: 1 }} />
        <button onClick={async () => { await api.logout(); nav("/login"); }}>Logout</button>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/trips" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:tripId" element={<Trip />} />
        <Route path="/trips/:tripId/settlement" element={<Settlement />} />
      </Routes>
    </div>
  );
}