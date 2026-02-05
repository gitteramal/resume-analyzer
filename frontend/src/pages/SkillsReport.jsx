import { useEffect, useState } from "react";
import API_BASE from "../api/config";

function SkillsReport() {
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    try {
      const res = await fetch(`${API_BASE}/reports/skills`);

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setSkills(await res.json());
    } catch (err) {
      console.error(err);
      setError("Failed to load skills report");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Common Missing Skills</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {skills.map((s, i) => (
          <li key={i}>
            {s.skill} — missing in {s.count} analyses
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SkillsReport;
