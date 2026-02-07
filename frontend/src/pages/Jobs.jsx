import { useEffect, useState } from "react";
import { createJob, getJobs } from "../api/jobs";

export default function Jobs() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadJobs() {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch {
      setError("Failed to load job descriptions");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createJob({ title, content });
      setTitle("");
      setContent("");
      await loadJobs();
    } catch {
      setError("Failed to save job description");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div className="resume-card">
      <h3 className="card-title">💼 Add Job Description</h3>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <input
          className="input"
          placeholder="Job title (eg: Frontend Developer)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          className="textarea"
          placeholder="Paste full job description here…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
        />

        <button className="primary-btn" disabled={loading}>
          {loading ? "Saving..." : "➕ Add Job"}
        </button>
      </form>

      <div className="divider" />

      <h4 className="list-title">📋 Saved Jobs</h4>

      {jobs.length === 0 ? (
        <p className="muted">No job descriptions added yet</p>
      ) : (
        <ul className="resume-list">
          {jobs.map((j) => (
            <li key={j.id} className="resume-item">
              <span>{j.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
