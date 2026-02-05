import Resumes from "./pages/Resumes";
import Jobs from "./pages/Jobs";
import Analyses from "./pages/Analyses";
import Dashboard from "./pages/Dashboard";
import SkillsReport from "./pages/SkillsReport";

function App() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: 40 }}>
        <h1>🧠 AI Resume Analyzer</h1>
        <p style={{ color: "#666" }}>
          Compare resumes against job descriptions using AI
        </p>
      </header>

      {/* Dashboard */}
      <section style={{ marginBottom: 50 }}>
        <Dashboard />
      </section>

      <hr />

      {/* Resume + Job Input */}
      <section style={{ marginTop: 40 }}>
        <h2>📄 Input Data</h2>

        <div
          style={{
            display: "flex",
            gap: 40,
            alignItems: "flex-start",
            marginTop: 20
          }}
        >
          <div style={{ flex: 1 }}>
            <Resumes />
          </div>

          <div style={{ flex: 1 }}>
            <Jobs />
          </div>
        </div>
      </section>

      <hr style={{ margin: "50px 0" }} />

      {/* Analysis */}
      <section>
        <Analyses />
      </section>

      <hr style={{ margin: "50px 0" }} />

      {/* Reports */}
      <section>
        <SkillsReport />
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 60, textAlign: "center", color: "#999" }}>
        AI Resume Analyzer • Demo Project
      </footer>
    </div>
  );
}

export default App;
