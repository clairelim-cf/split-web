export const API_BASE = import.meta.env.VITE_API_BASE as string;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init.headers || {}) },
    credentials: "include" // cookie-based sessions
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  register: (email: string, displayName: string, password: string) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify({ email, displayName, password }) }),

  login: (email: string, password: string) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  logout: () => request("/api/auth/logout", { method: "POST", body: "{}" }),

  listTrips: () => request<{ trips: any[] }>("/api/trips"),

  createTrip: (name: string, baseCurrency: string) =>
    request<{ tripId: string }>("/api/trips", { method: "POST", body: JSON.stringify({ name, baseCurrency }) }),

  addMember: (tripId: string, email: string) =>
    request(`/api/trips/${tripId}/members`, { method: "POST", body: JSON.stringify({ email }) }),

  createExpense: (tripId: string, payload: any) =>
    request(`/api/trips/${tripId}/expenses`, { method: "POST", body: JSON.stringify(payload) }),

  endTrip: (tripId: string) =>
    request(`/api/trips/${tripId}/end`, { method: "POST", body: "{}" }),

  settlement: (tripId: string) =>
    request<{ settlement: any[] }>(`/api/trips/${tripId}/settlement`),

  markPaid: (tripId: string, planId: string, note = "") =>
    request(`/api/trips/${tripId}/settlement/${planId}/pay`, { method: "POST", body: JSON.stringify({ note }) }),

  confirm: (tripId: string, planId: string) =>
    request(`/api/trips/${tripId}/settlement/${planId}/confirm`, { method: "POST", body: "{}" })
};