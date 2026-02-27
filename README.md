# Capstone_BugFixer
Capstone repository

1.MOM Demo Backend

FastAPI-based demo backend for:

 UI JSON validation (UIConfigV2)

Query JSON validation (QueryV2)

Mock metric query execution

Rule-based UI generation (demo phase, no real LLM)

2.Project Structure


backend/

│

├── app.py

├── app2.py                # Main FastAPI app

├── schemas/

│   ├── ui-config-v2.json  # UI schema

│   └── query-v2.json      # Query schema

├── venv/                  # Python virtual environment

└── README.md

3.Environment Setup (Using Existing venv)

(1)Activate Virtual Environment

Windows (PowerShell)

.\venv\Scripts\activate

Windows (cmd)

venv\Scripts\activate

Mac / Linux

source venv/bin/activate

If succeed,you will see:(venv) C:\...

(2)Install Dependencies (if not installed)

pip install fastapi uvicorn jsonschema

Running app2.py (Recommended)

Since your app2.py defines:

app = FastAPI(...)

The correct startup command is:

uvicorn app2:app --reload

Explanation:

app2      -> Python file name (app2.py)

app       -> FastAPI instance name inside the file

--reload  -> Enables auto-reload in development mode

If successful, you should see:

Uvicorn running on http://127.0.0.1:8000
API Endpoints

(1)Health Check
GET /health

Test in browser:

http://127.0.0.1:8000/health

Response:

{
  "ok": true
}


(2)Validate UI JSON
POST /validate/ui

This endpoint validates the payload using the ui-config-v2.json schema.

(3)Run Query
POST /query

This endpoint:

Validates the request using the QueryV2 schema

Returns mock data for demo purposes

Example Request
{
  "metric": "OEE",
  "timeRange": "24h"
}

(4)Generate UI (Demo Mode)
POST /generate-ui
Example Request
{
  "prompt": "show oee and downtime table"
}

The backend will:

Generate queries based on the prompt

Construct a MesPage JSON object

Validate it against the UI schema

Return a valid UIConfig

4.Backend Logic Overview
Validation

The backend uses:

jsonschema Draft202012Validator

Schemas used:

UI schema: schemas/ui-config-v2.json

Query schema: schemas/query-v2.json

5.Query Response Convention

The backend follows this response structure:

Type	Default Path
KPI	data.value
Grid	data.rows
Series	data.series
Example Response
{
  "data": {
    "value": 0.74,
    "rows": [...],
    "series": [...]
  }
}

The frontend extracts values using:

{
  "queryKey": "q_oee",
  "path": "data.value"
}

6.Swagger Documentation

After starting the server, visit:

http://127.0.0.1:8000/docs

You can test all API endpoints directly from the Swagger UI.

可以直接测试 API。



MOM Demo – Data Model & Synthetic Data Design(v1):
https://docs.google.com/document/d/1TN7B7tRFx38kBkohVxwWzqCP3ayrDrKwK2MHfzfZ2L4/edit?tab=t.0
