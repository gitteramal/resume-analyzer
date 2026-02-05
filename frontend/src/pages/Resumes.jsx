import { useEffect, useState } from "react";
import { createResume, getResumes } from "../api/resumes";

export default function Resumes() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [resumes, setResumes] = useState([]);

  async function loadResumes() {
    const data = await getResumes();
    setResumes(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await createResume({ title, content });
    setTitle("");
    setContent("");
    loadResumes();
  }

  useEffect(() => {
    loadResumes();
  }, []);

  return (
    <div>
      <h2>Resumes</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />

        <textarea
          placeholder="Resume content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <br />

        <button>Add Resume</button>
      </form>

      <hr />

      <ul>
        {resumes.map((r) => (
          <li key={r.id}>
            <strong>{r.title}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
