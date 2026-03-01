Capstone_BugFixer – MOM Demo Backend
Capstone repository – MOM Demo Backend (Schema-Constrained Architecture)

## 1. MOM Demo Backend

FastAPI-based demo backend for:

• UI JSON validation (UIConfigV3)

• Query JSON validation (QueryMOMV1)

• Mock MOM metric execution

• Rule-based UI generation (Demo phase, no real LLM yet)

## 2. Project Structure

backend/

│

├── app3.py                 # Main FastAPI app (MOM-only)

├── schemas/

│   ├── ui-config-v3.json

│   └── query-mom-v1.json

├── venv/

└── README.md

## 3. Environment Setup

### Create a virtual environment

python -m venv venv

### Activate Virtual Environment:


Windows (PowerShell): 
.\venv\Scripts\activate

Windows (cmd): 
venv\Scripts\activate

Mac/Linux: 
source venv/bin/activate

### Install Dependencies:
pip install -r requirements.txt

## 4. Create .env file

### Inside the backend directory, create a file named:

.env

### Add your DeepSeek API key:

DEEPSEEK_API_KEY=your_api_key_here

## 5. Run Backend

### Start server using:
uvicorn app3:app --reload

If successful, you will see:
Uvicorn running on http://127.0.0.1:8000

## 6. API Endpoints

### Health Check:

GET /health

Response: {"ok": true}

### Validate UI JSON:

POST /validate/ui

Validates against schemas/ui-config-v3.json

### Run MOM Query

POST /query

Validates against schemas/query-mom-v1.json

Example Query – Scrap Rate

{

    "metric": "ScrapRate",

    "timeRange": "30d"

}

Example Query – Defect Distribution

{

    "metric": "DefectDistribution",

    "timeRange": "30d",

    "dimension": "defect_type"

}

## 7. Query Response Convention

KPI → data.value

Grid / Distribution → data.rows

Example KPI Response

{

    "ok": true,

    "data": {

      "value": 2.8

    },

    "meta": {

      "timeRange": "30d"

    }

}

Example Distribution Response

{

    "ok": true,

    "data": {

      "rows": [

        {

          "defectCode": "Scratch",

          "defectCount": 250,

          "totalDefectPercentage": 25.0

        }

      ]

    }

}

## 8. Generate UI (Demo Mode)

POST /generate-ui

Example:

{
  "prompt": "Show top 10 defect distribution sorted by defectCount desc for 30 days"
}

Backend will generate QueryMOMV1 objects and return a validated UIConfigV3 JSON.

## 9. Swagger Documentation

Visit: http://127.0.0.1:8000/docs

Test all endpoints directly from Swagger UI.

## 10. MOM Data Model Reference

MOM Demo – Data Model & Synthetic Data Design (v1) – https://docs.google.com/document/d/1TN7B7tRFx38kBkohVxwWzqCP3ayrDrKwK2MHfzfZ2L4/edit?tab=t.0

## 11. Architecture Overview

User Prompt--Generate UI--UIConfigV3--QueryMOMV1--Backend Execution (Mock)--Frontend Rendering

