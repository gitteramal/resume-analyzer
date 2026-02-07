import Resumes from "./pages/Resumes";
import Jobs from "./pages/Jobs";
import Analyses from "./pages/Analyses";
import Dashboard from "./pages/Dashboard";
import SkillsReport from "./pages/SkillsReport";

function App() {
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1>🧠 AI Resume Analyzer</h1>
        <p>Compare resumes against job descriptions using AI</p>
      </header>

      {/* Dashboard */}
      <section className="section">
        <Dashboard />
      </section>

      <hr />

      {/* Resume + Job Input */}
      <section className="section">
        <h2>📄 Input Data</h2>

        <div className="input-grid">
          <div className="card">
            <Resumes />
          </div>

          <div className="card">
            <Jobs />
          </div>
        </div>
      </section>

      <hr />

      {/* Analysis */}
      <section className="section">
        <Analyses />
      </section>

      <hr />

      {/* Reports */}
      <section className="section">
        <SkillsReport />
      </section>

      {/* Footer */}
      <footer className="footer">
        AI Resume Analyzer • Demo Project
      </footer>
    </div>
  );
}

export default App;
