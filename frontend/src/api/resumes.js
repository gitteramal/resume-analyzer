const API_BASE = import.meta.env.VITE_API_BASE;

export async function getResumes() {
  const res = await fetch(`${API_BASE}/getresumes`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createResume(data) {
  const res = await fetch(`${API_BASE}/createresumes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
