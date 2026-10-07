# ResQ – AI-Powered Disaster Response & Emergency Coordination Platform

**Specialization Academic Project**  
**Bachelor of Computer Applications (BCA)**  

### Project Group Members
- **Atharva Goel** (24215014)  
- **Rajdeep Debnath** (24215032)  
- **Rohan Raj** (24215034)  

---

## 1. Project Overview

Natural disasters such as floods, earthquakes, structural fires, cyclones, road accidents, and acute medical emergencies require rapid communication, accurate triage, and seamless coordination between affected citizens and response forces. 

**ResQ** is a centralized, AI-powered emergency management web application. It connects citizens, community relief volunteers, and disaster management authorities on a single unified platform. ResQ leverages **Google Gemini AI** to automatically classify disaster types, calculate triage urgency priorities (Low, Medium, High, Critical), summarize lengthy civilian reports into crisp operational briefings for first responders, and provide life-safety guidance via an interactive safety advisor chatbot.

---

## 2. Key Modules & Features

ResQ is built across eight core functional modules:

1. **Module 1 — User Authentication & RBAC**:
   - Secure registration, login, and profile management.
   - JSON Web Token (JWT) stateless authorization.
   - Bcrypt salted password hashing.
   - Three distinct operational roles: **Citizen**, **Volunteer**, and **Administrator**.

2. **Module 2 — Emergency Incident Reporting**:
   - Geo-tagged incident logging with disaster categories (Flood, Earthquake, Fire, Cyclone, Road Accident, Medical Emergency, Landslide, Other).
   - One-click browser GPS location detection.
   - Disaster photo uploads with automated image verification.
   - Real-time AI analysis on report submission.

3. **Module 3 — Rescue Coordination Management**:
   - Immediate rescue dispatch requests created by citizens.
   - High-priority volunteer dispatch queue sorted by threat urgency.
   - Volunteer assignment, mission claiming, and live status transitions (`Pending` ➔ `Accepted` ➔ `In Progress` ➔ `Completed`).
   - Chronological SITREP field audit trail.

4. **Module 4 — Relief Shelter & Resource Management**:
   - Live municipal relief shelter directory.
   - Real-time bed occupancy progress bars and slot counters.
   - Direct phone contact and Google Maps / OpenStreetMap navigation links.
   - Complete Administrative CRUD operations.

5. **Module 5 — Emergency Alerts & Broadcast Notifications**:
   - Official administrative warning broadcasting (Evacuation, Weather Warning, Safety Instruction, Emergency).
   - Color-coded severity badges with emergency ticker banners.
   - Instant public broadcast delivery.

6. **Module 6 — Gemini AI Intelligence & Fallback Engine**:
   - **Disaster Classification**: Validates incident type using LLM semantic understanding.
   - **Priority Scoring**: Predicts life-threat urgency (`Critical`, `High`, `Medium`, `Low`).
   - **Responder Summarization**: Distills lengthy descriptions into 1-2 sentence tactical briefs.
   - **Disaster Safety Advisor Chatbot**: Delivers step-by-step life preservation guidance with emergency disclaimers.
   - **Guaranteed Zero-Downtime Fallback Mode**: If no Gemini API key is provided, the application runs on a built-in rule and threat-keyword heuristic engine.

7. **Module 7 — Administrator Operations Dashboard**:
   - Unified emergency command center with real database metrics.
   - User account and role management.
   - Supervisor access to all incident dispatches and rescue updates.

8. **Module 8 — Reports & Interactive Analytics**:
   - Real Chart.js data visualizations:
     - Hazard category distribution (Doughnut chart)
     - AI priority urgency breakdown (Bar chart)
     - Rescue operation status ratios (Doughnut chart)
     - Shelter capacity utilization (Bar chart)

---

## 3. Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Lucide React Icons, Axios, Chart.js, React-Chartjs-2
- **Backend**: Node.js, Express.js REST APIs
- **Database**: MySQL 8.0 (Connection pooling via `mysql2/promise`)
- **Authentication**: JSON Web Tokens (JWT), BcryptJS
- **AI Integration**: Google Gemini API (`@google/generative-ai` with Model `gemini-1.5-flash`) + Built-in Fallback Knowledge Engine
- **File Storage**: Modular Multer disk storage (with AWS S3 compatibility design)
- **Deployment**: Local Windows Development / AWS EC2 + RDS / Nginx + PM2

---

## 4. System Architecture

```
[ Citizen / Volunteer / Admin Browser ]
                  │
                  ▼ (HTTP / JSON REST)
         [ Express.js API ] (Port 5000)
        ├── Helmet & CORS Security
        ├── Rate Limiting
        ├── JWT Authentication Middleware
        └── Multer Image Handler
          │                     │
          ▼                     ▼
[ MySQL 8.0 Database ]   [ AI Intelligence Layer ]
  - 9 Relational Tables    - Google Gemini 1.5 Flash
  - Connection Pool        - Fallback Threat Engine
```

---

## 5. Project Directory Structure

```
ResQ/
│
├── client/                     # React Frontend Application
│   ├── src/
│   │   ├── components/         # Navbars, Banners, Badges, ProtectedRoute
│   │   ├── context/            # AuthContext (JWT & User state)
│   │   ├── pages/              # Citizen, Volunteer, Admin & Public pages
│   │   ├── services/           # Axios API services
│   │   ├── App.jsx             # React Router configuration
│   │   └── main.jsx            # Entry point
│   ├── dist/                   # Production build directory
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express.js REST Backend
│   ├── src/
│   │   ├── config/             # DB pool, environment, Gemini AI config
│   │   ├── controllers/        # REST route handlers
│   │   ├── middleware/         # JWT Auth, Multer, Error handlers
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Gemini AI & Fallback engine
│   │   ├── scripts/            # Database init & seed scripts
│   │   ├── app.js              # Express app definition
│   │   └── server.js           # Server bootstrap
│   ├── uploads/                # Disaster incident photos
│   └── package.json
│
├── database/
│   ├── schema.sql              # MySQL DDL for all 9 entities
│   ├── seed.sql                # Realistic demo dataset & demo accounts
│   └── README.md               # Database setup guide
│
├── docs/
│   ├── architecture.md         # System architecture & ER design
│   ├── api.md                  # REST API specification
│   ├── portable-setup.md       # Moving to another Windows laptop
│   └── aws-deployment.md       # Student AWS deployment guide
│
├── .env.example                # Configuration template
├── .gitignore                  # Git exclusions (node_modules, .env, uploads)
├── package.json                # Project root orchestration scripts
└── README.md                   # Main documentation
```

---

## 6. Prerequisites

To run this project locally, ensure you have:

- **Windows 10 or 11**
- **Node.js LTS** (v18.x or v20.x or v22.x) — [Download](https://nodejs.org)
- **MySQL Server 8.0** (or XAMPP) — [Download](https://dev.mysql.com/downloads/installer/)
- **Visual Studio Code** — [Download](https://code.visualstudio.com)
- **Git** — [Download](https://git-scm.com)

---

## 7. Step-by-Step Installation & Local Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/ResQ.git
cd ResQ
```

### Step 2: Configure Environment Variables
Copy `.env.example` into `server/.env`:
```bash
cd server
copy .env.example .env
```
Open `server/.env` and update your MySQL password:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=resq_db
DB_USER=root
DB_PASSWORD=your_mysql_password_here

# Optional: Add your Google Gemini API Key
# If left blank, ResQ seamlessly runs on its Intelligent Fallback Engine!
GEMINI_API_KEY=
```

### Step 3: Install Dependencies
From the `server` directory:
```bash
npm install
```

From the `client` directory:
```bash
cd ../client
npm install
```

### Step 4: Initialize & Seed MySQL Database
From the `server` folder:
```bash
cd ../server
npm run db:init
npm run db:seed
```
This automatically creates the `resq_db` schema and seeds realistic demo data with pre-hashed passwords.

---

## 8. Starting the Application

### Method A: Independent Terminals in VS Code (Recommended)

1. **Terminal 1 — Backend API Server**:
   ```bash
   cd server
   npm run dev
   ```
   *Runs on `http://localhost:5000`*

2. **Terminal 2 — Frontend Client**:
   ```bash
   cd client
   npm run dev
   ```
   *Runs on `http://localhost:5173`*

Open **Google Chrome** and visit: **`http://localhost:5173`**

---

### Method B: Single Production Server (Unified Port 5000)

```bash
# 1. Build the React frontend
cd client
npm run build

# 2. Run the Express backend (automatically serves the frontend)
cd ../server
npm start
```
Open **Google Chrome** and visit: **`http://localhost:5000`**

---

## 9. Demo Login Credentials

The seed database includes ready-to-use accounts for evaluation:

| Role | Email | Password | Responsibilities |
|---|---|---|---|
| **Citizen** | `citizen@resq.org` | `Citizen@123` | File hazard reports, trigger rescue dispatch, track live responder updates, view relief shelters |
| **Volunteer** | `volunteer@resq.org` | `Volunteer@123` | Monitor unassigned dispatch queue, claim missions, post field SITREP notes, complete rescues |
| **Administrator** | `admin@resq.org` | `Admin@123` | Broadcast citywide warnings, manage relief shelters, oversee all incidents, inspect analytics |

*(A **"Switch Demo Role"** quick-login selector is also accessible at the top right of the navigation bar for rapid testing during project presentations!)*

---

## 10. AI Engine & Fallback Mechanism

ResQ features a dual-engine architecture:
- **Google Gemini API**: Connected when `GEMINI_API_KEY` is placed in `server/.env`.
- **Intelligent Fallback Engine**: Automatically active when no API key is provided, if network connectivity drops, or if API quotas are exceeded. Uses lexical threat-scoring heuristics and pre-compiled NDMA safety protocols.
- **Viva Assurance**: The application **never crashes** due to missing API keys or external AI service limits.

---

## 11. AWS Cloud Deployment

ResQ is architected for seamless cloud deployment on university AWS student accounts using:
- **AWS EC2 (Ubuntu 22.04 LTS / t2.micro or t3.micro Free Tier)**
- **Nginx Reverse Proxy & PM2 Process Manager**
- **AWS RDS MySQL 8.0** (or local MySQL on EC2 to save student credits)

A comprehensive, beginner-friendly deployment walkthrough is documented in [`docs/aws-deployment.md`](docs/aws-deployment.md).

---

## 12. Pushing to GitHub

To push the project to your GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit: Complete ResQ Disaster Response Platform"
git branch -M main
git remote add origin https://github.com/<your-username>/ResQ.git
git push -u origin main
```
*Note: Sensitive credentials in `.env`, user uploads, and `node_modules` are automatically protected by `.gitignore`.*

---

## 13. Future Enhancements

As outlined in Section 7 of the project synopsis:
- Native Android and iOS mobile applications with offline caching.
- Live GPS tracking of rescue boats and emergency vehicles via WebSockets.
- Automated SMS alerts for populations without smartphone access.
- Voice-based multi-language disaster reporting.
- Autonomous drone fleet integration for aerial flood and earthquake surveillance.
- Direct operational integration with national government emergency services.

---

## 14. References

1. React.js Official Documentation — [https://react.dev](https://react.dev)
2. Node.js & Express.js Documentation — [https://expressjs.com](https://expressjs.com)
3. MySQL 8.0 Reference Manual — [https://dev.mysql.com](https://dev.mysql.com)
4. Google Gemini API Documentation — [https://ai.google.dev](https://ai.google.dev)
5. JSON Web Token Specification — [https://jwt.io](https://jwt.io)
6. National Disaster Management Authority (NDMA) Guidelines — [https://ndma.gov.in](https://ndma.gov.in)
