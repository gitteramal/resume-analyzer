import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

function SkillsReport() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/reports/skills`)
      .then(res => res.json())
      .then(setSkills)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Common Missing Skills</h2>

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
