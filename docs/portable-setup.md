# Moving ResQ to Another Windows Laptop (Step-by-Step Portability Guide)

This guide is written specifically for students and evaluators who want to clone and run **ResQ** on any standard Windows 10/11 laptop using **Visual Studio Code** and a standard terminal, completely independent of any specialized AI IDEs or cloud platforms.

---

## 1. Prerequisites (Free Tools)

Ensure the following 4 tools are installed on the laptop:

1. **Node.js (v18.x or above)**:
   - Download the LTS installer from [https://nodejs.org](https://nodejs.org).
   - Verify in PowerShell:
     ```powershell
     node -v
     npm -v
     ```

2. **MySQL Server 8.0** (or XAMPP):
   - Download MySQL Community Server from [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/).
   - Note down the `root` password chosen during setup.
   - Verify MySQL service is running in Windows Services (`services.msc`).

3. **Git**:
   - Download from [https://git-scm.com](https://git-scm.com).

4. **Visual Studio Code**:
   - Download from [https://code.visualstudio.com](https://code.visualstudio.com).

---

## 2. Clone the Repository

Open Command Prompt or PowerShell and run:

```bash
git clone https://github.com/your-username/ResQ.git
cd ResQ
```

Open the project folder in VS Code:
```bash
code .
```

---

## 3. Install Dependencies

Open the integrated terminal in VS Code (`Ctrl + ~`):

### Install Backend Dependencies
```bash
cd server
npm install
```

### Install Frontend Dependencies
```bash
cd ../client
npm install
```

---

## 4. Configure Environment Variables

1. In the `server` directory, create a `.env` file by copying `.env.example`:
   ```bash
   cd ../server
   cp .env.example .env
   ```
   *(On Windows Command Prompt, run: `copy .env.example .env`)*

2. Open `server/.env` in VS Code and fill in your MySQL password:
   ```env
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173

   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=resq_db
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password_here

   JWT_SECRET=resq_emergency_secret_key_2026_xyz
   JWT_EXPIRES_IN=7d

   # Optional: Google Gemini API Key
   # If left blank, ResQ automatically switches to Intelligent Fallback Mode!
   GEMINI_API_KEY=
   ```

---

## 5. Initialize & Seed the MySQL Database

From the `server` directory, execute the automated migration scripts:

```bash
# 1. Create database and apply the 9 relational tables
npm run db:init

# 2. Populate realistic demo records (citizens, volunteers, admin, reports, shelters)
npm run db:seed
```

You should see:
```
✅ [Success] Database "resq_db" and all 9 tables initialized successfully!
✅ [Success] Realistic demo data seeded successfully!
```

---

## 6. Start the Application

### Option A: Two VS Code Terminals (Recommended for Development)

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```
*Backend runs on `http://localhost:5000`.*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

### Option B: Single Production Build Mode

You can also run the entire full-stack app on a single port (`5000`):

```bash
# 1. Build React
cd client
npm run build

# 2. Start Express (automatically serves client/dist)
cd ../server
npm start
```
Open your browser at `http://localhost:5000`.

---

## 7. Log in with Demo Credentials

Open Google Chrome at `http://localhost:5173` (or `http://localhost:5000`).

You can use the one-click demo login buttons or sign in with:

| Role | Email | Password |
|---|---|---|
| **Citizen** | `citizen@resq.org` | `Citizen@123` |
| **Volunteer** | `volunteer@resq.org` | `Volunteer@123` |
| **Administrator** | `admin@resq.org` | `Admin@123` |

---

## 8. Troubleshooting Common Issues

### Issue 1: `ECONNREFUSED` on database connection
- **Cause**: MySQL server service is stopped.
- **Solution**: Open `services.msc`, locate `MySQL80` (or `MySQL`), right-click and select **Start**.

### Issue 2: `Access denied for user 'root'@'localhost'`
- **Cause**: `DB_PASSWORD` in `server/.env` does not match your MySQL root password.
- **Solution**: Update `DB_PASSWORD` in `server/.env` with your correct password.

### Issue 3: Gemini API Quota Exceeded or No Internet
- **Solution**: No action needed! ResQ will automatically switch to its **Intelligent Fallback Engine** and continue classifying reports and answering chatbot queries seamlessly.
