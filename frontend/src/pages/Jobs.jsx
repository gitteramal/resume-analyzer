import { useEffect, useState } from "react";
import { createJob, getJobs } from "../api/jobs";

export default function Jobs() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [jobs, setJobs] = useState([]);

  async function loadJobs() {
    const data = await getJobs();
    setJobs(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await createJob({ title, content });
    setTitle("");
    setContent("");
    loadJobs();
  }

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div>
      <h2>Jobs</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />

        <textarea
          placeholder="Job description"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <br />

        <button>Add Job</button>
      </form>

      <hr />

      <ul>
        {jobs.map((j) => (
          <li key={j.id}>
            <strong>{j.title}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
