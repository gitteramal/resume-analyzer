import { useEffect, useState } from "react";
import { createResume, getResumes } from "../api/resumes";

export default function Resumes() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadResumes() {
    const data = await getResumes();
    setResumes(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await createResume({ title, content });
    setTitle("");
    setContent("");
    await loadResumes();
    setLoading(false);
  }

  useEffect(() => {
    loadResumes();
  }, []);

  return (
    <div className="resume-card">
      <h3 className="card-title">📄 Add Resume</h3>

      <form onSubmit={handleSubmit} className="form">
        <input
          className="input"
          placeholder="Resume title (eg: Java Developer – 3 yrs)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          className="textarea"
          placeholder="Paste resume content here…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
        />

        <button className="primary-btn" disabled={loading}>
          {loading ? "Saving..." : "➕ Add Resume"}
        </button>
      </form>

      <div className="divider" />

      <h4 className="list-title">📚 Saved Resumes</h4>

      {resumes.length === 0 ? (
        <p className="muted">No resumes added yet</p>
      ) : (
        <ul className="resume-list">
          {resumes.map((r) => (
            <li key={r.id} className="resume-item">
              <span>{r.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
