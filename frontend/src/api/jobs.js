const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export async function getJobs() {
  const res = await fetch(`${API_BASE}/getjobs`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createJob(data) {
  const res = await fetch(`${API_BASE}/createjobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
