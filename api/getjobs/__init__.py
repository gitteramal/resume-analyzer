import azure.functions as func
import json
from shared.db import get_db_connection

def main(req: func.HttpRequest) -> func.HttpResponse:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT Id, Title, Content, CreatedUtc FROM Jobs")
    rows = cursor.fetchall()
    conn.close()

    return func.HttpResponse(
        json.dumps([
            {
                "id": str(r[0]),
                "title": r[1],
                "content": r[2],
                "createdUtc": r[3].isoformat()
            } for r in rows
        ]),
        mimetype="application/json"
    )
