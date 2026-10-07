# ResQ Database Setup Guide

This directory contains the MySQL database schema and seed data for **ResQ – AI-Powered Disaster Response & Emergency Coordination Platform**.

---

## Files in this Directory

- `schema.sql`: Complete DDL schema creating all tables, foreign key relationships, indexes, and constraints.
- `seed.sql`: Realistic demo records with pre-hashed passwords for Citizen, Volunteer, and Administrator testing.

---

## Method 1: Automated Setup via Node.js (Recommended)

1. Ensure MySQL is running on your machine.
2. In `server/.env`, verify your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=resq_db
   ```
3. Run the automated initialization script from the `server` folder:
   ```bash
   cd server
   npm run db:init
   npm run db:seed
   ```
   This will automatically create the `resq_db` database, apply the schema, and seed realistic demo accounts and records.

---

## Method 2: Setup via MySQL Command Line

Open your Command Prompt or PowerShell and run:

```bash
# 1. Login and execute the schema
mysql -u root -p < database/schema.sql

# 2. Populate the demo seed data
mysql -u root -p < database/seed.sql
```

Enter your MySQL root password when prompted.

---

## Method 3: Setup via MySQL Workbench

1. Open **MySQL Workbench**.
2. Connect to your local MySQL instance.
3. Go to **File -> Open SQL Script...** and select `database/schema.sql`.
4. Click the **Execute (Lightning bolt)** icon to run the script.
5. Next, open `database/seed.sql` and click **Execute**.
6. In the left *Navigator* panel, refresh *Schemas* to see `resq_db` with all 9 tables.

---

## Database Entity Relationships (ER Summary)

| Entity Table | Primary Key | Description |
|---|---|---|
| `users` | `user_id` | Core accounts for Citizens, Volunteers, and Admins |
| `volunteers` | `volunteer_id` | Volunteer skill set and live availability status |
| `admins` | `admin_id` | Administrative privileges extension |
| `emergency_reports`| `report_id` | Citizen emergency reports with AI fields |
| `ai_analysis` | `analysis_id` | Gemini/Fallback analysis (disaster classification, priority, summary) |
| `rescue_requests` | `request_id` | Dispatch requests linked to reports and assigned volunteers |
| `rescue_updates` | `update_id` | Timestamped audit log of rescue status changes and remarks |
| `shelters` | `shelter_id` | Relief camps, capacity, and live slot counters |
| `alerts` | `alert_id` | Official emergency warnings, evacuation orders, broadcasts |

---

## Default Demo Accounts

All demo accounts are immediately ready after running `seed.sql`:

| Role | Email | Password |
|---|---|---|
| **Citizen** | `citizen@resq.org` | `Citizen@123` |
| **Volunteer** | `volunteer@resq.org` | `Volunteer@123` |
| **Administrator** | `admin@resq.org` | `Admin@123` |
