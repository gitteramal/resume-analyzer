import json
import re
from google import genai

def run_gemini_analysis(resume_text, job_text):
    client = genai.Client()

    prompt = f"""
Return STRICT JSON only:

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

    match = re.search(r"\{.*\}", response.text, re.S)
    if not match:
        raise Exception("Invalid Gemini JSON")

    return json.loads(match.group())
