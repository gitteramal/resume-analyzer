import azure.functions as func
import json
import logging
import os
import uuid
import pyodbc
from google import genai
import re
from datetime import datetime, timezone



app = func.FunctionApp()

# ---------- Environment ----------
SQL_CONNECTION_STRING = os.getenv("SQL_CONNECTION_STRING")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not SQL_CONNECTION_STRING:
    raise Exception("SQL_CONNECTION_STRING is not set")

if not GEMINI_API_KEY:
    raise Exception("GEMINI_API_KEY is not set")

# ---------- Database Helper ----------
def get_db_connection():
    return pyodbc.connect(SQL_CONNECTION_STRING)

# ---------- Gemini AI Helper ----------
def run_gemini_analysis(resume_text, job_text):
    # Client automatically reads GEMINI_API_KEY from environment
    client = genai.Client()

    prompt = f"""
You are an ATS resume analyzer.

Compare the RESUME against the JOB DESCRIPTION and return STRICT JSON
in the following format ONLY (no markdown, no explanations):

{{
  "overallScore": number,
  "skillMatchScore": number,
  "missingSkills": [string],
  "strengths": [string],
  "improvements": [string]
}}

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_text}
"""

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt
    )

    # Defensive checks (important for Azure)
    if response is None or not hasattr(response, "text") or not response.text:
        raise Exception("Gemini returned an empty response")

    raw_text = response.text.strip()

    # 🔒 Extract JSON safely (Gemini sometimes adds text)
    match = re.search(r"\{.*\}", raw_text, re.S)
    if not match:
        logging.error("Gemini response did not contain JSON")
        logging.error(raw_text)
        raise Exception("Gemini response does not contain valid JSON")

    json_text = match.group()

    try:
        return json.loads(json_text)
    except json.JSONDecodeError as e:
        logging.error("Failed to parse Gemini JSON")
        logging.error(json_text)
        raise Exception(f"Invalid JSON from Gemini: {str(e)}")
# ---------- POST /resumes ----------
@app.route(route="createresumes", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST"])
def CreateResume(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        title = data["title"]
        content = data["content"]

        resume_id = str(uuid.uuid4())
        created_utc = datetime.now(timezone.utc)



        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO Resumes (Id, Title, Content, CreatedUtc) VALUES (?, ?, ?, ?)",
            resume_id, title, content, created_utc
        )

        conn.commit()
        conn.close()

        return func.HttpResponse(
            json.dumps({"id": resume_id}),
            status_code=201,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse(
    json.dumps({"error": str(e)}),
    status_code=500,
    mimetype="application/json",
    headers={"Access-Control-Allow-Origin": "*"}
)


# ---------- GET /resumes ----------
@app.route(route="getresumes", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def GetResumes(req: func.HttpRequest) -> func.HttpResponse:
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT Id, Title, Content, CreatedUtc FROM Resumes")
        rows = cursor.fetchall()

        results = [
            {
                "id": str(r[0]),
                "title": r[1],
                "content": r[2],
                "createdUtc": r[3].isoformat()
            }
            for r in rows
        ]

        conn.close()

        return func.HttpResponse(
            json.dumps(results),
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse(
    json.dumps({"error": str(e)}),
    status_code=500,
    mimetype="application/json",
    headers={"Access-Control-Allow-Origin": "*"}
)


# ---------- POST /jobs ----------
@app.route(route="createjobs", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST"])
def CreateJob(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        title = data["title"]
        content = data["content"]

        job_id = str(uuid.uuid4())
        created_utc = datetime.now(timezone.utc)



        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO Jobs (Id, Title, Content, CreatedUtc) VALUES (?, ?, ?, ?)",
            job_id, title, content, created_utc
        )

        conn.commit()
        conn.close()

        return func.HttpResponse(
            json.dumps({"id": job_id}),
            status_code=201,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse(
    json.dumps({"error": str(e)}),
    status_code=500,
    mimetype="application/json",
    headers={"Access-Control-Allow-Origin": "*"}
)


# ---------- GET /jobs ----------
@app.route(route="getjobs", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def GetJobs(req: func.HttpRequest) -> func.HttpResponse:
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT Id, Title, Content, CreatedUtc FROM Jobs")
        rows = cursor.fetchall()

        results = [
            {
                "id": str(r[0]),
                "title": r[1],
                "content": r[2],
                "createdUtc": r[3].isoformat()
            }
            for r in rows
        ]

        conn.close()

        return func.HttpResponse(
            json.dumps(results),
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse(
    json.dumps({"error": str(e)}),
    status_code=500,
    mimetype="application/json",
    headers={"Access-Control-Allow-Origin": "*"}
)
# ---------- POST /analyses ----------
@app.route(route="createanalysis", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST"])
def CreateAnalysis(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        resume_id = data["resumeId"]
        job_id = data["jobId"]

        conn = get_db_connection()
        cursor = conn.cursor()

        # 1️⃣ Check existing analysis
        cursor.execute("""
            SELECT OverallScore, SkillMatchScore, MissingSkills, Strengths, Improvements
            FROM Analyses
            WHERE ResumeId = ? AND JobId = ?
        """, resume_id, job_id)

        row = cursor.fetchone()
        if row:
            return func.HttpResponse(
                json.dumps({
                    "overallScore": row[0],
                    "skillMatchScore": row[1],
                    "missingSkills": json.loads(row[2]),
                    "strengths": json.loads(row[3]),
                    "improvements": json.loads(row[4]),
                    "cached": True
                }),
                mimetype="application/json",
                headers={"Access-Control-Allow-Origin": "*"}
            )

        # 2️⃣ Fetch resume content
        cursor.execute("SELECT Content FROM Resumes WHERE Id = ?", resume_id)
        resume_row = cursor.fetchone()
        if not resume_row:
            return func.HttpResponse("Resume not found", status_code=404)

        # 3️⃣ Fetch job content
        cursor.execute("SELECT Content FROM Jobs WHERE Id = ?", job_id)
        job_row = cursor.fetchone()
        if not job_row:
            return func.HttpResponse("Job not found", status_code=404)

        # 4️⃣ Run Gemini AI
        ai_result = run_gemini_analysis(resume_row[0], job_row[0])

        # 5️⃣ Save analysis
        analysis_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO Analyses
            (Id, ResumeId, JobId, OverallScore, SkillMatchScore,
             MissingSkills, Strengths, Improvements, RawAiResponse, CreatedUtc)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            analysis_id,
            resume_id,
            job_id,
            ai_result["overallScore"],
            ai_result["skillMatchScore"],
            json.dumps(ai_result["missingSkills"]),
            json.dumps(ai_result["strengths"]),
            json.dumps(ai_result["improvements"]),
            json.dumps(ai_result),
            datetime.utcnow()

        )

        conn.commit()
        conn.close()

        return func.HttpResponse(
            json.dumps({**ai_result, "cached": False}),
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

    except Exception as e:
        logging.exception("CreateAnalysis failed")
        return func.HttpResponse(
    json.dumps({"error": str(e)}),
    status_code=500,
    mimetype="application/json",
    headers={"Access-Control-Allow-Origin": "*"}
)


# ---------- GET /analyses ----------
@app.route(route="getanalysis", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def GetAnalysis(req: func.HttpRequest) -> func.HttpResponse:
    try:
        resume_id = req.params.get("resumeId")
        job_id = req.params.get("jobId")

        if not resume_id or not job_id:
            return func.HttpResponse("resumeId and jobId are required", status_code=400)

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT OverallScore, SkillMatchScore,
                   MissingSkills, Strengths, Improvements, CreatedUtc
            FROM Analyses
            WHERE ResumeId = ? AND JobId = ?
        """, resume_id, job_id)

        row = cursor.fetchone()
        conn.close()

        if not row:
            return func.HttpResponse(status_code=404)

        result = {
            "resumeId": resume_id,
            "jobId": job_id,
            "overallScore": row[0],
            "skillMatchScore": row[1],
            "missingSkills": json.loads(row[2]),
            "strengths": json.loads(row[3]),
            "improvements": json.loads(row[4]),
            "createdUtc": row[5].isoformat()
        }

        return func.HttpResponse(
            json.dumps(result),
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

    except Exception as e:
        logging.exception("GetAnalysis failed")
        return func.HttpResponse(
    json.dumps({"error": str(e)}),
    status_code=500,
    mimetype="application/json",
    headers={"Access-Control-Allow-Origin": "*"}
)

# ---------- GET /DashboardAnalyses ----------
@app.route(route="Analyses", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def GetAllAnalyses(req: func.HttpRequest) -> func.HttpResponse:
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                a.Id,
                r.Title AS ResumeTitle,
                j.Title AS JobTitle,
                a.OverallScore,
                a.SkillMatchScore,
                a.CreatedUtc
            FROM Analyses a
            JOIN Resumes r ON a.ResumeId = r.Id
            JOIN Jobs j ON a.JobId = j.Id
            ORDER BY a.CreatedUtc DESC
        """)

        rows = cursor.fetchall()
        conn.close()

        results = [
            {
                "id": str(r[0]),
                "resumeTitle": r[1],
                "jobTitle": r[2],
                "overallScore": r[3],
                "skillMatchScore": r[4],
                "createdUtc": r[5].isoformat()
            }
            for r in rows
        ]

        return func.HttpResponse(
            json.dumps(results),
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

    except Exception as e:
        logging.exception("GetAllAnalyses failed")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

# ---------- GET /reports/skills ----------
@app.route(route="reports/skills", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def SkillsReport(req: func.HttpRequest) -> func.HttpResponse:
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT MissingSkills FROM Analyses")
        rows = cursor.fetchall()
        conn.close()

        skill_counts = {}

        for row in rows:
            skills = json.loads(row[0])
            for skill in skills:
                skill_counts[skill] = skill_counts.get(skill, 0) + 1

        report = [
            {"skill": skill, "count": count}
            for skill, count in sorted(
                skill_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )
        ]

        return func.HttpResponse(
            json.dumps(report),
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

    except Exception as e:
        logging.exception("SkillsReport failed")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )
