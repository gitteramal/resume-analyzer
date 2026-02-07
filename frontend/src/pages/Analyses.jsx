import { useEffect, useState } from "react";
import API_BASE from "../api/config";

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
    try {
      const res = await fetch(`${API_BASE}/getresumes`);
      if (!res.ok) throw new Error(await res.text());
      setResumes(await res.json());
    } catch {
      setError("Failed to load resumes");
    }
  }

  async function loadJobs() {
    try {
      const res = await fetch(`${API_BASE}/getjobs`);
      if (!res.ok) throw new Error(await res.text());
      setJobs(await res.json());
    } catch {
      setError("Failed to load jobs");
    }
  }

  useEffect(() => {
    if (resumeId && jobId) {
      loadExistingAnalysis();
    } else {
      setAnalysis(null);
    }
  }, [resumeId, jobId]);

  async function loadExistingAnalysis() {
    try {
      const res = await fetch(
        `${API_BASE}/getanalysis?resumeId=${resumeId}&jobId=${jobId}`
      );

      if (res.status === 404) {
        setAnalysis(null);
        return;
      }

      if (!res.ok) throw new Error(await res.text());
      setAnalysis(await res.json());
    } catch {
      setError("Failed to load existing analysis");
    }
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

      if (!res.ok) throw new Error(await res.text());
      setAnalysis(await res.json());
    } catch {
      setError("Failed to run analysis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="analysis-card">
      <h3 className="card-title">🧠 AI Resume Analysis</h3>

      {error && <p className="error-text">{error}</p>}

      {/* Selectors */}
      <div className="select-row">
        <select
          className="select"
          value={resumeId}
          onChange={(e) => setResumeId(e.target.value)}
        >
          <option value="">Select Resume</option>
          {resumes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
        >
          <option value="">Select Job</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
      </div>

      {/* Action Button */}
      <button
        className="primary-btn full-width"
        onClick={runAnalysis}
        disabled={!resumeId || !jobId || loading}
      >
        {loading
          ? "Analyzing..."
          : analysis
          ? "🔁 Re-run Analysis"
          : "🚀 Run Analysis"}
      </button>

      {/* Analysis Result */}
      {analysis && (
        <div className="analysis-result">
          {/* Scores */}
          <div className="score-grid">
            <div className="score-box">
              <span className="score-label">Overall Match</span>
              <span className="score-value">{analysis.overallScore}%</span>
            </div>

            <div className="score-box">
              <span className="score-label">Skill Match</span>
              <span className="score-value">{analysis.skillMatchScore}%</span>
            </div>
          </div>

          {/* Details */}
          <AnalysisSection
            title="✅ Strengths"
            items={analysis.strengths}
          />

          <AnalysisSection
            title="❌ Missing Skills"
            items={analysis.missingSkills}
            danger
          />

          <AnalysisSection
            title="📈 Improvements"
            items={analysis.improvements}
          />
        </div>
      )}
    </div>
  );
}

/* Reusable sub-section */
function AnalysisSection({ title, items = [], danger }) {
  if (!items.length) return null;

  return (
    <div className="analysis-section">
      <h4 className={danger ? "danger-title" : ""}>{title}</h4>
      <ul className="analysis-list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default Analyses;
