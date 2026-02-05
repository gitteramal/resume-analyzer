const API_BASE_URL =
  "https://newresumeai-axbvfqhmh3cygebd.southindia-01.azurewebsites.net/api";

export async function getResumes() {
  const res = await fetch(`${API_BASE_URL}/getresumes`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

export async function createResume(data) {
  const res = await fetch(`${API_BASE_URL}/createresumes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}
