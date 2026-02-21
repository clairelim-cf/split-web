import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, API_BASE } from "../lib/api";

async function getMe(): Promise<{ userId: string }> {
  const res = await fetch(`${API_BASE}/api/me`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export default function Settlement() {
  const { tripId } = useParams();
  const nav = useNavigate();
  const [me, setMe] = useState("");
  const [lines, setLines] = useState<any[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    if (!tripId) return;
    setErr("");
    try {
      const meRes = await getMe();
      setMe(meRes.userId);
      const res = await api.settlement(tripId);
      setLines(res.settlement);
    } catch (e: any) {
      if (e.message === "unauthenticated") nav("/login");
      else setErr(e.message);
    }
  }

  useEffect(() => { load(); }, [tripId]);

  const toPay = useMemo(() => lines.filter(l => l.from_user === me), [lines, me]);
  const toReceive = useMemo(() => lines.filter(l => l.to_user === me), [lines, me]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link to={`/trips/${tripId}`}>← Back</Link>
        <h2 style={{ margin: 0 }}>Settlement</h2>
      </div>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <h3>You pay</h3>
        {toPay.length === 0 ? <div style={{ opacity: 0.7 }}>Nothing.</div> : (
          <ul style={{ display: "grid", gap: 8 }}>
            {toPay.map(l => (
              <li key={l.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span>Pay <b>{l.to_user}</b> {l.amount_base} {l.currency} — {l.status}</span>
                <div style={{ flex: 1 }} />
                {l.status === "PENDING" && (
                  <button onClick={async () => { await api.markPaid(tripId!, l.id); await load(); }}>
                    Mark paid
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <h3>You receive</h3>
        {toReceive.length === 0 ? <div style={{ opacity: 0.7 }}>Nothing.</div> : (
          <ul style={{ display: "grid", gap: 8 }}>
            {toReceive.map(l => (
              <li key={l.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span>Receive from <b>{l.from_user}</b> {l.amount_base} {l.currency} — {l.status}</span>
                <div style={{ flex: 1 }} />
                {l.status === "PAID" && (
                  <button onClick={async () => { await api.confirm(tripId!, l.id); await load(); }}>
                    Confirm received
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}