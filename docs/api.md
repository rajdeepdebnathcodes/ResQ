# ResQ REST API Specification

Base URL: `http://localhost:5000/api`

All JSON requests must supply `Content-Type: application/json`.
Protected endpoints require:
`Authorization: Bearer <jwt_token>`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new citizen, volunteer, or admin account.

**Request Body:**
```json
{
  "name": "Ramesh Kulkarni",
  "email": "ramesh@example.com",
  "password": "Password@123",
  "phone": "+91 98765 43210",
  "role": "citizen" // "citizen" | "volunteer" | "admin"
  "skills": "First Aid & CPR" // Optional for volunteers
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "user_id": 8,
    "name": "Ramesh Kulkarni",
    "email": "ramesh@example.com",
    "phone": "+91 98765 43210",
    "role": "citizen"
  }
}
```

### `POST /api/auth/login`
Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "citizen@resq.org",
  "password": "Citizen@123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Welcome back, Rahul Sharma!",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "user_id": 1,
    "name": "Rahul Sharma",
    "email": "citizen@resq.org",
    "role": "citizen"
  }
}
```

### `GET /api/auth/me` *(Protected)*
Returns the authenticated profile.

---

## 2. Emergency Reports Endpoints (`/api/reports`)

### `POST /api/reports` *(Protected - Citizen)*
Submits an emergency report and triggers Gemini AI analysis.
Accepts `multipart/form-data` with optional `image` file.

**Form Fields:**
- `disaster_type`: string (e.g. `Flood`, `Fire`, `Earthquake`, etc.)
- `location`: string (e.g. `Sector 4, Pune`)
- `description`: string (incident details)
- `latitude`: optional float
- `longitude`: optional float
- `request_rescue`: `true` | `false`
- `image`: optional image file (`.jpg`, `.png`, `.webp`, max 5MB)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Emergency report logged and analyzed successfully.",
  "report": {
    "report_id": 6,
    "disaster_type": "Flood",
    "ai_classification": "Flood",
    "priority_level": "Critical",
    "summary": "River overflow submerged ground floors; residents trapped on terrace.",
    "location": "Sector 4, Pune",
    "status": "Reported"
  },
  "ai_analysis": {
    "classification": "Flood",
    "confidence": "High (96%)",
    "priority": "Critical",
    "summary": "...",
    "safety_tips": "1. Move to higher ground...",
    "source": "gemini"
  },
  "rescue_request_id": 5
}
```

### `GET /api/reports`
Fetches all reports with optional filters:
- `?disaster_type=Flood`
- `?priority=Critical`
- `?status=In Progress`
- `?search=market`

### `GET /api/reports/my-reports` *(Protected - Citizen)*
Returns all emergency reports submitted by the authenticated citizen.

### `GET /api/reports/:id`
Retrieves full details of a specific report including AI analysis and responder details.

### `PATCH /api/reports/:id/status` *(Protected - Admin, Volunteer)*
Updates report verification status (`Reported`, `Verified`, `In Progress`, `Resolved`, `Dismissed`).

---

## 3. Rescue Coordination Endpoints (`/api/rescue`)

### `POST /api/rescue` *(Protected - Citizen)*
Creates a rescue dispatch request from an existing report.

**Request Body:**
```json
{
  "report_id": 2,
  "priority_level": "High",
  "notes": "Elderly grandmother cannot walk down stairs."
}
```

### `GET /api/rescue/pending` *(Protected - Volunteer, Admin)*
Lists unassigned rescue requests sorted by priority (`Critical` first).

### `GET /api/rescue/my-assignments` *(Protected - Volunteer)*
Lists rescue operations claimed by the authenticated volunteer.

### `POST /api/rescue/:id/accept` *(Protected - Volunteer)*
Assigns the rescue request to the volunteer and marks status as `Accepted`.

### `POST /api/rescue/:id/update-status` *(Protected - Volunteer, Admin)*
Updates rescue status with field remarks.

**Request Body:**
```json
{
  "status": "In Progress", // "Accepted" | "In Progress" | "Completed" | "Cancelled"
  "remarks": "Inflatable raft deployed. Evacuating 4 family members to relief shelter."
}
```

### `GET /api/rescue/:id` *(Protected)*
Returns rescue details and chronological progress timeline audit logs from `rescue_updates`.

---

## 4. Relief Shelters Endpoints (`/api/shelters`)

### `GET /api/shelters`
Returns list of relief shelters. Filter by `?status=Available` or `?search=camp`.

### `POST /api/shelters` *(Protected - Admin)*
Adds a new shelter:
```json
{
  "name": "Shivaji Stadium Camp",
  "address": "Camp Area, Pune",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "capacity": 250,
  "available_slots": 190,
  "contact_number": "+91 20 2550 0111",
  "status": "Available"
}
```

### `PUT /api/shelters/:id` *(Protected - Admin)*
Updates shelter capacity or contact info.

### `DELETE /api/shelters/:id` *(Protected - Admin)*
Removes a shelter.

---

## 5. Alerts & Broadcasts Endpoints (`/api/alerts`)

### `GET /api/alerts/active`
Returns all active emergency warnings.

### `POST /api/alerts` *(Protected - Admin)*
Broadcasts a new emergency alert:
```json
{
  "title": "Severe Cyclone Warning",
  "message": "Gale winds up to 90 km/h predicted. Stay indoors.",
  "alert_type": "Weather Warning",
  "severity": "Critical",
  "location": "Coastal District"
}
```

---

## 6. AI Assistance Endpoints (`/api/ai`)

### `GET /api/ai/status`
Returns whether Google Gemini API or Intelligent Fallback Engine is active.

### `POST /api/ai/chat`
Answers citizen disaster safety queries.

**Request Body:**
```json
{
  "message": "What should I do during an earthquake?",
  "conversationHistory": []
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "reply": "🏢 **Earthquake Safety Protocol:**\n1. Drop, Cover, and Hold On...",
  "source": "gemini" // or "fallback"
}
```

### `POST /api/ai/analyze`
Interactive test endpoint to analyze arbitrary disaster descriptions without saving to database.

---

## 7. Reports & Analytics (`/api/analytics`)

### `GET /api/analytics`
Returns real aggregated database counts for Chart.js:
- `summary`: user, report, rescue, shelter, alert counts
- `charts.disasterTypes`: breakdown by disaster category
- `charts.priorityDistribution`: count by Critical, High, Medium, Low
- `charts.rescueStatuses`: count by Pending, Accepted, In Progress, Completed
- `charts.shelterOccupancy`: capacity vs available beds
