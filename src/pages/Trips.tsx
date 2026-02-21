import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, API_BASE } from "../lib/api";

async function get(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export default function Trip() {
  const { tripId } = useParams();
  const nav = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [err, setErr] = useState("");

  // add expense
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("0");
  const [currency, setCurrency] = useState("SGD");
  const [paidBy, setPaidBy] = useState("");
  const [fx, setFx] = useState("1");

  async function load() {
    if (!tripId) return;
    setErr("");
    try {
      const t = await get(`/api/trips/${tripId}`);
      const m = await get(`/api/trips/${tripId}/members`);
      const e = await get(`/api/trips/${tripId}/expenses`);
      setTrip(t.trip);
      setMembers(m.members);
      setExpenses(e.expenses);
      if (!paidBy && m.members?.length) setPaidBy(m.members[0].user_id);
    } catch (e: any) {
      if (e.message === "unauthenticated") nav("/login");
      else if (e.message === "not_a_member") nav("/trips");
      else setErr(e.message);
    }
  }

  useEffect(() => { load(); }, [tripId]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link to="/trips">← Back</Link>
        <h2 style={{ margin: 0 }}>{trip?.name || "Trip"}</h2>
        <span style={{ opacity: 0.7 }}>{trip?.base_currency} {trip?.status}</span>
        <div style={{ flex: 1 }} />
        {trip?.status === "ENDED" && <Link to={`/trips/${tripId}/settlement`}>Settlement</Link>}
      </div>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <h3>Members</h3>
        <ul>
          {members.map(m => <li key={m.user_id}>{m.display_name} ({m.email})</li>)}
        </ul>

        {trip?.status === "ACTIVE" && (
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="friend@email.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            <button onClick={async () => {
              setErr("");
              try { await api.addMember(tripId!, inviteEmail); setInviteEmail(""); await load(); }
              catch (e: any) { setErr(e.message); }
            }}>Add member</button>
          </div>
        )}
      </div>

      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <h3>Add expense (equal split)</h3>
        {trip?.status !== "ACTIVE" ? (
          <div style={{ opacity: 0.7 }}>Trip ended. Expenses are read-only.</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
              <input style={{ width: 120 }} value={amount} onChange={e => setAmount(e.target.value)} />
              <input style={{ width: 100 }} value={currency} onChange={e => setCurrency(e.target.value.toUpperCase())} />
              <select value={paidBy} onChange={e => setPaidBy(e.target.value)}>
                {members.map(m => <option key={m.user_id} value={m.user_id}>{m.display_name}</option>)}
              </select>
              <input style={{ width: 140 }} value={fx} onChange={e => setFx(e.target.value)} placeholder="FX to base" />
              <button onClick={async () => {
                setErr("");
                try {
                  const participants = members.map(m => m.user_id); // all members
                  await api.createExpense(tripId!, {
                    title,
                    amount: Number(amount),
                    currency,
                    fxRateToBase: Number(fx),
                    paidBy,
                    participants,
                    splitMode: "equal",
                    expenseDate: new Date().toISOString().slice(0, 10),
                    notes: ""
                  });
                  setTitle(""); setAmount("0");
                  await load();
                } catch (e: any) { setErr(e.message); }
              }}>Add</button>
            </div>
          </>
        )}
      </div>

      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <h3>Expenses</h3>
        <ul style={{ display: "grid", gap: 6 }}>
          {expenses.map(ex => (
            <li key={ex.id}>
              {ex.title} — {ex.amount} {ex.currency} (base {ex.amount_base})
            </li>
          ))}
        </ul>
      </div>

      {trip?.status === "ACTIVE" && (
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <h3>End trip</h3>
          <button onClick={async () => {
            setErr("");
            try { await api.endTrip(tripId!); nav(`/trips/${tripId}/settlement`); }
            catch (e: any) { setErr(e.message); }
          }}>End trip + generate settlement</button>
        </div>
      )}
    </div>
  );
}