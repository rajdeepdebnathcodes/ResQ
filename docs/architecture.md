# ResQ – Architecture & System Design Documentation

## 1. System Overview

**ResQ** is an AI-powered disaster response and emergency coordination platform designed for rapid humanitarian relief operations. It bridges communication gaps among affected citizens, volunteers/rescue personnel, relief shelter managers, and central disaster administrators.

```
+-------------------------------------------------------------------------+
|                              CITIZEN BROWSER                            |
|             (React.js, Tailwind CSS, Lucide Icons, Chart.js)            |
+-------------------------------------------------------------------------+
                                    |
                                    | HTTPS / JSON REST APIs
                                    v
+-------------------------------------------------------------------------+
|                           NODE.JS / EXPRESS API                         |
|  - Rate Limiting, Helmet Security, CORS                                 |
|  - JWT Authentication & RBAC (Citizen, Volunteer, Administrator)        |
|  - Multer Image Uploads (/server/uploads)                               |
+-------------------------------------------------------------------------+
               |                                            |
               v                                            v
+-------------------------------+       +---------------------------------+
|        MYSQL 8.0 DATABASE     |       |         AI ENGINE LAYER         |
|  - Connection Pooling (mysql2)|       |  - Google Gemini 1.5 Flash API  |
|  - Parameterized SQL Queries  |       |  - Intelligent Fallback Engine  |
|  - 9 Relational Entities      |       |    (Rules, Priority, Chatbot)   |
+-------------------------------+       +---------------------------------+
```

---

## 2. Relational Database Design (ER Model)

The database adheres strictly to the synopsis entity relationship model:

```
[ users ] (1) ------------ (N) [ emergency_reports ]
    |                                   | (1)
    | (1:1 extension)                   |
    +---- [ volunteers ]                +---- (1:1) [ ai_analysis ]
    |                                   |
    +---- [ admins ]                    +---- (1:N) [ rescue_requests ]
                                                        | (1)
                                                        |
                                                        +---- (1:N) [ rescue_updates ]
```

### Table Definitions

1. **`users`**:
   - `user_id` (INT, PK, Auto-Increment)
   - `name` (VARCHAR)
   - `email` (VARCHAR, Unique Index)
   - `password` (VARCHAR, Bcrypt Hash)
   - `phone` (VARCHAR)
   - `role` (ENUM: `citizen`, `volunteer`, `admin`)
   - `created_at` (DATETIME)

2. **`volunteers`**:
   - `volunteer_id` (INT, PK)
   - `user_id` (INT, FK -> `users.user_id`)
   - `skills` (VARCHAR)
   - `availability_status` (ENUM: `available`, `busy`, `offline`)
   - `created_at` (DATETIME)

3. **`admins`**:
   - `admin_id` (INT, PK)
   - `user_id` (INT, FK -> `users.user_id`)
   - `created_at` (DATETIME)

4. **`emergency_reports`**:
   - `report_id` (INT, PK)
   - `user_id` (INT, FK -> `users.user_id`)
   - `disaster_type` (VARCHAR)
   - `description` (TEXT)
   - `location` (VARCHAR)
   - `latitude`, `longitude` (DECIMAL)
   - `image_url` (VARCHAR)
   - `ai_classification` (VARCHAR)
   - `priority_level` (ENUM: `Low`, `Medium`, `High`, `Critical`)
   - `summary` (TEXT)
   - `status` (ENUM: `Reported`, `Verified`, `In Progress`, `Resolved`, `Dismissed`)
   - `created_at`, `updated_at` (DATETIME)

5. **`ai_analysis`**:
   - `analysis_id` (INT, PK)
   - `report_id` (INT, FK -> `emergency_reports.report_id`)
   - `classification` (VARCHAR)
   - `confidence` (VARCHAR)
   - `priority` (ENUM: `Low`, `Medium`, `High`, `Critical`)
   - `summary` (TEXT)
   - `safety_tips` (TEXT)
   - `source` (ENUM: `gemini`, `fallback`)
   - `raw_response` (TEXT)
   - `created_at` (DATETIME)

6. **`rescue_requests`**:
   - `request_id` (INT, PK)
   - `report_id` (INT, FK -> `emergency_reports.report_id`)
   - `requested_by` (INT, FK -> `users.user_id`)
   - `assigned_to` (INT, FK nullable -> `users.user_id`)
   - `status` (ENUM: `Pending`, `Accepted`, `In Progress`, `Completed`, `Cancelled`)
   - `priority_level` (ENUM: `Low`, `Medium`, `High`, `Critical`)
   - `notes` (TEXT)
   - `created_at`, `updated_at` (DATETIME)

7. **`rescue_updates`**:
   - `update_id` (INT, PK)
   - `request_id` (INT, FK -> `rescue_requests.request_id`)
   - `volunteer_id` (INT, FK -> `users.user_id`)
   - `status` (ENUM)
   - `remarks` (TEXT)
   - `updated_at` (DATETIME)

8. **`shelters`**:
   - `shelter_id` (INT, PK)
   - `name` (VARCHAR), `address` (VARCHAR)
   - `latitude`, `longitude` (DECIMAL)
   - `capacity` (INT), `available_slots` (INT)
   - `contact_number` (VARCHAR)
   - `status` (ENUM: `Available`, `Full`, `Temporarily Closed`)
   - `created_by` (INT, FK nullable)
   - `created_at`, `updated_at` (DATETIME)

9. **`alerts`**:
   - `alert_id` (INT, PK)
   - `admin_id` (INT, FK nullable -> `users.user_id`)
   - `title` (VARCHAR), `message` (TEXT)
   - `alert_type` (ENUM: `Evacuation`, `Weather Warning`, `Safety Instruction`, `Emergency`, `General`)
   - `severity` (ENUM: `Low`, `Medium`, `High`, `Critical`)
   - `location` (VARCHAR)
   - `is_active` (BOOLEAN)
   - `created_at` (DATETIME)

---

## 3. Gemini AI Integration & Dual-Engine Architecture

ResQ features a dual-engine architecture designed to ensure zero downtime:

```
                          Incident Submitted
                                   |
                                   v
                      Has GEMINI_API_KEY Configured?
                                /      \
                              YES       NO
                              /            \
                             v              v
                  Call Google Gemini API    Run Intelligent Fallback
                  Model: gemini-1.5-flash   (Keyword & Threat Heuristic)
                             |                      |
                   Did request succeed?             |
                       /       \                    |
                     YES        NO                  |
                     /           \                  |
                    v             +-----------------+
            Parse JSON Schema                       |
                    \                               /
                     \                             /
                      v                           v
              Normalize Priority, Summary & Classification
                                   |
                                   v
                        Persist in MySQL Database
```

1. **Google Gemini Generative AI**:
   - Uses `@google/generative-ai` with structured prompts requesting JSON output.
   - Evaluates life-threat factors (trapped individuals, rising water, fire, medical severity).
   - Generates 1-2 sentence operational briefings for responders.
2. **Intelligent Fallback Engine**:
   - Keyword lexical matcher mapping descriptions to standard categories.
   - Urgency scorer weighting critical terms (e.g., *terrace*, *trapped*, *unconscious*, *drowning*) to Critical/High.
   - Pre-loaded NDMA disaster protocols for the safety chatbot.
   - **Guaranteed non-breaking**: The application never crashes if the internet drops, an API key is missing, or quota is exhausted.

---

## 4. Security Principles

1. **Password Hashing**: Bcrypt with salt rounds = 10 (`bcryptjs`).
2. **Stateless JWT Authorization**: Signed with `JWT_SECRET`, validated on every protected API call.
3. **Role-Based Access Control (RBAC)**: Distinct permissions for Citizens, Volunteers, and Admins.
4. **Parameterized SQL Queries**: All MySQL queries utilize placeholders (`?`) to prevent SQL injection vulnerabilities.
5. **Input Validation**: Safe sanitization and MIME-type verification for file uploads (JPG, PNG, WebP only, 5MB limit).
6. **Error Masking**: Stack traces are never exposed in production HTTP responses.
