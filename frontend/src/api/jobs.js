const API_BASE_URL =
  "https://newresumeai-axbvfqhmh3cygebd.southindia-01.azurewebsites.net/api";

export async function getJobs() {
  const res = await fetch(`${API_BASE_URL}/getjobs`);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function createJob(data) {
  const res = await fetch(`${API_BASE_URL}/createjobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
