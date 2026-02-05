import { useEffect, useState } from "react";
import { createJob, getJobs } from "../api/jobs";

export default function Jobs() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");

  async function loadJobs() {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch {
      setError("Failed to load jobs");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await createJob({ title, content });
      setTitle("");
      setContent("");
      loadJobs();
    } catch {
      setError("Failed to save job");
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div>
      <h2>💼 Jobs</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <br />

        <textarea
          placeholder="Job description"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
        <br />

        <button>Add Job</button>
      </form>

      <hr />

      <ul>
        {jobs.map(j => (
          <li key={j.id}>
            <strong>{j.title}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
