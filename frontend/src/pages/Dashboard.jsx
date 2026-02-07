import { useEffect, useState } from "react";
import API_BASE from "../api/config";

function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalyses() {
      try {
        const res = await fetch(`${API_BASE}/analyses`);
        if (!res.ok) throw new Error(await res.text());
        setAnalyses(await res.json());
      } catch {
        setError("Could not load recent analyses");
      }
    }

    loadAnalyses();
  }, []);

  return (
    <div className="dashboard-card">
      <h3 className="card-title">📋 Recent Analyses</h3>

      {error && <p className="error-text">{error}</p>}

      {analyses.length === 0 ? (
        <p className="muted">No analyses available yet</p>
      ) : (
        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Resume</th>
                <th>Job</th>
                <th>Overall</th>
                <th>Skill Match</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((a) => (
                <tr key={a.id}>
                  <td>{a.resumeTitle}</td>
                  <td>{a.jobTitle}</td>
                  <td>
                    <ScoreBadge value={a.overallScore} />
                  </td>
                  <td>
                    <ScoreBadge value={a.skillMatchScore} />
                  </td>
                  <td className="muted">
                    {new Date(a.createdUtc).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* Score badge component */
function ScoreBadge({ value }) {
  let color = "badge-low";
  if (value >= 75) color = "badge-high";
  else if (value >= 50) color = "badge-mid";

  return <span className={`score-badge ${color}`}>{value}%</span>;
}

export default Dashboard;
