# Capstone Project – MOM Demo System

Capstone repository for a comprehensive Manufacturing Operations Management (MOM) Demo System with schema-constrained architecture, supporting full-stack development with backend API, interactive frontend, and synthetic data generation.

## 1. Project Overview

This project consists of three main components:

### Backend (FastAPI)
- RESTful API for MOM metrics and queries
- Schema-based validation (UI Config v4, Query v2)
- Mock metric execution and data aggregation
- LLM-powered UI generation (DeepSeek API)
- Swagger/OpenAPI documentation

### Frontend (React + TypeScript)
- Interactive UI components for dashboard visualization
- Real-time data display with multiple chart types
- Configuration-driven UI rendering from backend schemas
- Responsive design with custom styling

### Data Generation Module
- Synthetic data generation for testing
- Historical data patterns and trends
- Configurable data profiles

### SQL Dashboard
- Database schema and seed scripts
- WIP (Work-in-Progress) dashboard data

## 2. Project Structure

```
project/
├── backend/
│   ├── app.py, app2.py, app3.py    # FastAPI applications
│   ├── requirements.txt             # Python dependencies
│   ├── schemas/
│   │   ├── ui-config-v4.json       # Latest UI schema
│   │   ├── query-api-v1.json       # Latest query schema
│   │   └── [other schema versions]
│   └── QUERY_API_SPEC.md
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx, bootstrap.tsx
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Page-level components
│   │   ├── services/               # API integration
│   │   └── assets/
│   ├── package.json
│   ├── webpack.*.js                # Build configuration
│   └── tsconfig.json
│
├── data_gen/
│   ├── main.py                     # Data generation entry
│   └── data/                       # Generated datasets
│
├── sqldashboard/
│   ├── seed_wip_dashboard.py
│   └── wip_dashboard.sql
│
└── README.md
```

## 3. Environment Setup

### Prerequisites
- Python 3.8+
- Node.js 14+ (for frontend development)
- pip or conda for package management

### Backend Setup

#### Create a Virtual Environment
```bash
python -m venv venv
```

#### Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (cmd):**
```cmd
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

## 4. Configuration

### Backend Configuration

Inside the backend directory, create a `.env` file with your API credentials:

```
DEEPSEEK_API_KEY=your_api_key_here
```

### Frontend Configuration

Update API endpoints in `src/services/axios.ts` if needed for your environment.

## 5. Running the Application

### Start Backend Server

```bash
cd backend
uvicorn app3:app --reload
```

If successful, you will see:
```
Uvicorn running on http://127.0.0.1:8000
```

### Start Frontend Development Server

```bash
cd frontend
npm start
```

Frontend will typically run on `http://localhost:3000` or as specified in your webpack config.

### Generate Synthetic Data

```bash
cd data_gen
python main.py
```

## 6. API Endpoints

Base URL: `http://127.0.0.1:8000`

### Health Check
```
GET /health
```
Response:
```json
{"ok": true}
```

### Validate UI Configuration

```
POST /validate/ui
```
Validates against `schemas/ui-config-v4.json`

Example payload:
```json
{
  "version": "v4",
  "layout": {
    "type": "dashboard",
    "widgets": []
  }
}
```

### Execute MOM Query

```
POST /query
```
Validates against `schemas/query-api-v1.json`

Example Query – Scrap Rate:
```json
{
  "metric": "ScrapRate",
  "timeRange": "30d"
}
```

Example Query – Defect Distribution:
```json
{
  "metric": "DefectDistribution",
  "timeRange": "30d",
  "dimension": "defect_type"
}
```

## 7. Response Format Convention

### KPI Responses
For single-value metrics (Key Performance Indicators), the response uses:
```json
{
  "ok": true,
  "data": {
    "value": 2.8
  },
  "meta": {
    "timeRange": "30d",
    "unit": "percent"
  }
}
```

### Grid/Distribution Responses
For multi-row data (distributions, trends), the response uses:
```json
{
  "ok": true,
  "data": {
    "rows": [
      {
        "defectCode": "Scratch",
        "defectCount": 250,
        "totalDefectPercentage": 25.0
      },
      {
        "defectCode": "Dent",
        "defectCount": 180,
        "totalDefectPercentage": 18.0
      }
    ]
  },
  "meta": {
    "timeRange": "30d",
    "rowCount": 2
  }
}
```

## 8. UI Generation (LLM-Powered)

Generate UI configurations dynamically from natural language prompts using DeepSeek API.

```
POST /generate-ui
```

Example request:
```json
{
  "prompt": "Show top 10 defect distribution sorted by defectCount desc for 30 days"
}
```

The backend uses DeepSeek LLM to interpret the natural language prompt and generate a validated `UIConfigV4` JSON structure that can be rendered by the frontend.

## 9. API Documentation

### Interactive Swagger UI
Visit: `http://127.0.0.1:8000/docs`

Test all endpoints directly from the Swagger UI with request/response examples.

### OpenAPI Schema
Visit: `http://127.0.0.1:8000/openapi.json`

## 10. Schema Reference

Current active schemas:
- **UI Configuration**: `schemas/ui-config-v4.json`
- **Query Definition**: `schemas/query-api-v1.json`

Legacy schemas available:
- ui-config-v1, v2, v3
- query-v1
- query-db-v1, query-db-v2

## 11. Data Model Reference

For detailed information about the MOM data model and synthetic data design:
- [MOM Data Model & Synthetic Data Design (v1)](https://docs.google.com/document/d/1TN7B7tRFx38kBkohVxwWzqCP3ayrDrKwK2MHfzfZ2L4/edit?tab=t.0)

## 12. Architecture Overview

```
User Input
    ↓
Natural Language Prompt
    ↓
Backend Generate UI
    ↓
UIConfigV4 (Validated)
    ↓
Frontend Render Components
    ↓
Execute QueryAPIV1
    ↓
Backend Mock Execution
    ↓
Response Data (KPI/Grid)
    ↓
Dashboard Visualization
```

## 13. Frontend Components

Key components in `src/components/`:

- **Chart Components**: Combinechart, CustomBarChart, CustomPieChart, LineChartComponent, Ratechart
- **UI Widgets**: Various Cantier-prefixed components (Button, Card, DataGrid, etc.)
- **Data Components**: DataTableCardComponent, DashboardCantierDataTableCardComponent
- **Layout Components**: CantierVerticalTab, CantierStepper, CantierTabList

Components are organized following the Cantier design system with reusable, configurable UI patterns.

## 14. Development Workflow

### Backend Development
1. Create or modify schemas in `backend/schemas/` (use v4 and v2 for latest)
2. Update API endpoints in `app3.py`
3. Test with Swagger UI at `http://127.0.0.1:8000/docs`

### Frontend Development
1. Develop components in `src/components/`
2. Consume API endpoints from `src/services/axios.ts`
3. Use webpack for development: `npm run dev`
4. Build for production: `npm run build`

### Data Generation
1. Configure data patterns in `data_gen/main.py`
2. Run data generator: `python main.py`
3. Output datasets stored in `data_gen/data/`

## 15. Database Setup (Optional)

For WIP dashboard with actual database:

```bash
cd sqldashboard
python seed_wip_dashboard.py
```

This will initialize the database schema and seed data from `wip_dashboard.sql`.

## 16. Troubleshooting

### Backend Issues
- Ensure Python virtual environment is activated
- Check that all dependencies in `requirements.txt` are installed
- Verify `DEEPSEEK_API_KEY` is set in `.env` file
- Check API logs at `http://127.0.0.1:8000/docs`

### Frontend Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check webpack configuration in `webpack.dev.js`
- Ensure backend is running on correct port (8000)

### Data Generation
- Verify CSV and JSON data files exist in `data_gen/data/`
- Check file permissions and paths in `main.py`

## 17. Additional Resources

- **Query API Spec**: [backend/QUERY_API_SPEC.md](backend/QUERY_API_SPEC.md)
- **Frontend README**: [frontend/README.md](frontend/README.md)
- **Swagger Docs**: Available at `http://127.0.0.1:8000/docs`

---

**Last Updated**: May 2026
**Latest Schema Versions**: UIConfigV4, QueryAPIV1

