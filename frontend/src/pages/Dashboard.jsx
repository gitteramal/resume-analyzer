import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

function Dashboard() {
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/Analyses`)
      .then(res => res.json())
      .then(setAnalyses)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📋 Recent Analyses</h2>

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
