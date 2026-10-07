# VisionGuard AI — Intelligent Visual Auditor for Engineering Labs

[![Node.js Version](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Vision_API-orange.svg)](https://ai.google.dev/)

**VisionGuard AI** is an enterprise-grade agentic visual intelligence and safety auditing platform engineered specifically for university and industrial electrical, electronic, robotics, and hardware laboratories.

Unlike basic object detection tools that merely list visible items, VisionGuard AI implements a strict **4-phase Visual Intelligence Reasoning Pipeline**:
1. **Visual Capture**: Ingests high-resolution workstation imagery or camera frames.
2. **Contextual Understanding**: Identifies active electronic instruments (oscilloscopes, power supplies, soldering stations), wiring harnesses, chemical wash bottles, and safety personal protective equipment (PPE).
3. **Agentic Reasoning & Historical Cross-Referencing**: Evaluates conditions against IEEE 1584, NFPA 70E, and OSHA 1910 electrical safety standards, while querying **historical Supabase audit logs** for that specific workstation to diagnose recurring failure patterns over time.
4. **Actionable Intelligence**: Prioritizes hazards into `Critical`, `Medium`, and `Low` severities, formulates concrete technical explanations, prescribes corrective remediation procedures, and updates institutional safety compliance metrics.

---

## Architecture Diagram

```
                                +---------------------------+
                                |  Laboratory Workstation   |
                                | (Image Upload / Preset)   |
                                +-------------+-------------+
                                              |
                                              v
                               +-----------------------------+
                               | React Frontend (Vite)       |
                               | - Live Scan Visualizer      |
                               | - Recurring Alert Radar     |
                               | - Safety Command Dashboard  |
                               +--------------+--------------+
                                              |
                                   REST API   |  JWT Bearer
                                              v
+---------------------------------------------------------------------------------+
| Express.js Backend Architecture                                                 |
|                                                                                 |
|   +-----------------------+     +--------------------+                          |
|   | Multer Memory Storage | --> | Zod Request Schema |                          |
|   +-----------------------+     +---------+----------+                          |
|                                           |                                     |
|             +-----------------------------+-----------------------------+       |
|             |                                                           |       |
|             v                                                           v       |
|  +---------------------------+                             +-----------------+  |
|  | Historical Logs Query     |                             | Gemini Vision   |  |
|  | (Past Audits for WS-XX)   |                             | Reasoning Agent |  |
|  +-------------+-------------+                             +--------+--------+  |
|                |                                                    |           |
|                +--------------> Synthesized Prompt <----------------+           |
|                                         |                                       |
|                                         v                                       |
|                            Structured JSON Intelligence                         |
|                         (Condition, Recurring Flag, Issues)                     |
+-----------------------------------------+---------------------------------------+
                                          |
                                          v
                         +---------------------------------+
                         | Supabase Cloud PostgreSQL DB    |
                         | - users (RBAC)                  |
                         | - inspections (Workstation Logs)|
                         | - detected_issues (Action Items)|
                         | - Row Level Security (RLS)      |
                         +---------------------------------+
```

---

## 1. Database Schema & Supabase Migrations

All tables, Row Level Security (RLS) policies, indexes, and initial seed records are defined in:
`/supabase/migrations/001_initial_schema.sql`

### Tables:
1. **`users`**: User identity and role management (`admin`, `lab_staff`, `inspector`).
2. **`inspections`**: Workstation audit headers (`lab_name`, `workstation_id`, `image_url`, `overall_condition`, `is_recurring`, `recurring_details`, `inspected_by`, `created_at`).
3. **`detected_issues`**: Prioritized physical anomalies (`inspection_id`, `issue`, `category`, `severity`, `confidence`, `explanation`, `recommended_action`, `status`).

### Executing Migrations:
To apply migrations directly from Node.js to your Supabase Cloud instance:
```bash
# 1. Provide your Supabase database URI in server/.env
DATABASE_URL=postgresql://postgres.YOUR_PROJECT:YOUR_PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres

# 2. Run the migration script
npm --prefix server run migrate
```
*Alternatively, copy `/supabase/migrations/001_initial_schema.sql` and run it directly in your Supabase SQL Editor.*

---

## 2. Environment Configuration

### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Supabase Credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres.yourproject:password@aws-0-region.pooler.supabase.com:6543/postgres

# Google Gemini Vision API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
```

---

## 3. Quick Start & Local Execution

Both client and server run concurrently with hot module reload:

```bash
# In project root:
npm run server    # Starts Express backend on port 5000
npm run client    # Starts Vite frontend on port 5173
```

- **Frontend Application**: `http://localhost:5173`
- **Backend Health Check**: `http://localhost:5000/api/health`

---

## 4. REST API Endpoints Specification

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register user account
- `POST /api/auth/login`: Authenticate and obtain JWT
- `GET /api/auth/me`: Fetch authenticated user profile
- `GET /api/auth/demo-users`: Retrieve quick-access demo credentials

### Inspections (`/api/inspections`)
- `POST /api/inspections`: Upload image / trigger Gemini visual agentic audit
- `GET /api/inspections`: Filter inspections by lab, workstation, and condition
- `GET /api/inspections/:id`: Retrieve single audit with all detected hazards
- `DELETE /api/inspections/:id`: Remove inspection record

### Issues & Corrective Actions (`/api/issues`)
- `GET /api/issues`: Query detected hazards by status, severity, category, or search
- `PATCH /api/issues/:id/status`: Update status (`Pending` -> `In Progress` -> `Resolved`)

### Workstation Historical Intelligence (`/api/workstations`)
- `GET /api/workstations`: Overview of all monitored workstations
- `GET /api/workstations/:id/history`: Chronological multi-audit timeline for workstation

### Analytics & Compliance (`/api/analytics`)
- `GET /api/analytics/summary`: Institutional safety score, severity breakdown, recurring hazards
- `GET /api/analytics/labs`: Facility-specific safety compliance index

---

## 5. Pre-Seeded Demo Personas

For rapid assessment, the platform includes 1-click persona switching:
- **Admin**: `admin@visionguard.edu` (Dr. Sarah Connor)
- **Lab Staff**: `staff@visionguard.edu` (Marcus Vance)
- **Inspector**: `inspector@visionguard.edu` (Elena Rostova)
- Default Password: `Password@123`
