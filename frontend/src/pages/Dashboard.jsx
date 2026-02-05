import { useEffect, useState } from "react";
import API_BASE from "../api/config";

function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalyses() {
      try {
        const res = await fetch(`${API_BASE}/analyses`);

        if (!res.ok) {
          throw new Error(await res.text());
        }

        setAnalyses(await res.json());
      } catch (err) {
        console.error(err);
        setError("Could not load recent analyses");
      }
    }

    loadAnalyses();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📋 Recent Analyses</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Resume</th>
            <th>Job</th>
            <th>Overall Score</th>
            <th>Skill Match</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {analyses.map(a => (
            <tr key={a.id}>
              <td>{a.resumeTitle}</td>
              <td>{a.jobTitle}</td>
              <td>{a.overallScore}%</td>
              <td>{a.skillMatchScore}%</td>
              <td>{new Date(a.createdUtc).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
