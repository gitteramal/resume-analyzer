import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

function Analyses() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResumes();
    loadJobs();
  }, []);

  async function loadResumes() {
    const res = await fetch(`${API_BASE}/getresumes`);
    setResumes(await res.json());
  }

  async function loadJobs() {
    const res = await fetch(`${API_BASE}/getjobs`);
    setJobs(await res.json());
  }

  useEffect(() => {
    if (resumeId && jobId) {
      loadExistingAnalysis();
    } else {
      setAnalysis(null);
    }
  }, [resumeId, jobId]);

  async function loadExistingAnalysis() {
    const res = await fetch(
      `${API_BASE}/getanalysis?resumeId=${resumeId}&jobId=${jobId}`
    );

    if (res.status === 404) {
      setAnalysis(null);
      return;
    }

    setAnalysis(await res.json());
  }

  async function runAnalysis() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/createanalysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobId })
      });

      if (!res.ok) throw new Error();

      setAnalysis(await res.json());
    } catch {
      setError("Failed to run analysis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>AI Resume Analysis</h2>

      <select value={resumeId} onChange={e => setResumeId(e.target.value)}>
        <option value="">Select Resume</option>
        {resumes.map(r => (
          <option key={r.id} value={r.id}>{r.title}</option>
        ))}
      </select>

      <select value={jobId} onChange={e => setJobId(e.target.value)}>
        <option value="">Select Job</option>
        {jobs.map(j => (
          <option key={j.id} value={j.id}>{j.title}</option>
        ))}
      </select>

      <br /><br />

      <button
        onClick={runAnalysis}
        disabled={!resumeId || !jobId || loading}
      >
        {loading ? "Analyzing..." : analysis ? "Re-run Analysis" : "Run Analysis"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {analysis && (
        <div style={{ marginTop: 20 }}>
          <h3>Overall Score: {analysis.overallScore}%</h3>
          <p>Skill Match: {analysis.skillMatchScore}%</p>

          <h4>Strengths</h4>
          <ul>{analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>

          <h4>Missing Skills</h4>
          <ul>{analysis.missingSkills.map((s, i) => <li key={i}>{s}</li>)}</ul>

          <h4>Improvements</h4>
          <ul>{analysis.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

export default Analyses;
