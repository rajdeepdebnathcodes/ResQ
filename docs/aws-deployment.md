# Deploying ResQ on AWS (Student / Academic Guide)

This guide explains how to deploy **ResQ** using a **university AWS student account** (such as AWS Academy, AWS Educate, or AWS Free Tier) with **zero expensive services**.

---

## 1. Cost-Aware Architecture for Academic Demos

```
Internet Browser
      │
      ▼ (HTTP / Port 80)
AWS EC2 Instance (t2.micro or t3.micro — Free Tier Eligible)
  ├── Nginx Reverse Proxy (Port 80 -> Port 5000)
  ├── Node.js + Express (Managed by PM2 Process Manager)
  └── Static React Build (`client/dist` served by Express or Nginx)
      │
      ▼
Database Options:
  • Option A (Multi-tier): AWS RDS MySQL 8.0 (db.t3.micro / db.t4g.micro free tier)
  • Option B (Zero extra cost): MySQL 8.0 installed directly on the same EC2 instance!
```

> **Cost Advisory:** Option B is ideal for university labs because running MySQL directly on the EC2 instance uses only **1 single virtual machine**, conserving your limited student credits!

---

## 2. Step 1: Launch EC2 Virtual Machine

1. Log in to your **AWS Management Console**.
2. Navigate to **EC2 -> Instances -> Launch an instance**.
3. Configure the following settings:
   - **Name**: `ResQ-Disaster-Server`
   - **Amazon Machine Image (AMI)**: **Ubuntu Server 22.04 LTS (HVM)**
   - **Instance Type**: `t2.micro` (or `t3.micro` if in newer regions)
   - **Key Pair**: Create new or select existing (e.g. `resq-key.pem`)
4. **Network Settings (Security Group)**:
   Allow incoming traffic on:
   - `SSH` (Port 22) - from your IP or Anywhere
   - `HTTP` (Port 80) - from Anywhere
   - `Custom TCP` (Port 5000) - from Anywhere
5. Click **Launch Instance**.

---

## 3. Step 2: Connect via SSH

In PowerShell or Terminal:

```bash
# Set key permissions
chmod 400 resq-key.pem

# SSH into your EC2 public IP
ssh -i resq-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

## 4. Step 3: Install Node.js, Git, and MySQL on EC2

Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
```

Install Git:
```bash
sudo apt install -y git
```

Install Node.js 20.x:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # Should output v20.x.x
npm -v
```

Install PM2 Process Manager:
```bash
sudo npm install -g pm2
```

Install MySQL Server (Option B - on the same instance):
```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

Configure MySQL root password:
```bash
sudo mysql
```
Inside the MySQL shell, run:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'ResQSecret@2026';
FLUSH PRIVILEGES;
EXIT;
```

---

## 5. Step 4: Clone the Project from GitHub

```bash
cd /home/ubuntu
git clone https://github.com/your-username/ResQ.git
cd ResQ
```

---

## 6. Step 5: Install Dependencies & Build Frontend

### Install Backend Dependencies:
```bash
cd server
npm install
```

### Configure Environment Variables:
Create `/home/ubuntu/ResQ/server/.env`:
```bash
nano .env
```
Paste the following production configuration:
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=http://<YOUR_EC2_PUBLIC_IP>:5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=resq_db
DB_USER=root
DB_PASSWORD=ResQSecret@2026

JWT_SECRET=super_secure_production_secret_key_resq_2026
JWT_EXPIRES_IN=7d

# Optional Google Gemini Key
GEMINI_API_KEY=
```
Save and exit (`Ctrl + O`, `Enter`, `Ctrl + X`).

### Install & Build Frontend:
```bash
cd ../client
npm install
npm run build
```
*(This produces the optimized production build at `client/dist`)*

---

## 7. Step 6: Initialize and Seed the Database

From the `server` directory:
```bash
cd ../server
npm run db:init
npm run db:seed
```
Output:
```
✅ [Success] Database "resq_db" and all 9 tables initialized successfully!
✅ [Success] Realistic demo data seeded successfully!
```

---

## 8. Step 7: Start Application with PM2

Run the server in the background using PM2 so it keeps running even after you close the SSH terminal:

```bash
pm2 start src/server.js --name resq-server
pm2 save
pm2 startup
```

Verify status:
```bash
pm2 status
```

---

## 9. Step 8 (Optional): Configure Nginx Reverse Proxy (Port 80)

To allow visitors to open `http://<YOUR_EC2_PUBLIC_IP>` without typing `:5000`:

1. Install Nginx:
   ```bash
   sudo apt install -y nginx
   ```
2. Configure default site:
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```
   Replace the `location /` block with:
   ```nginx
   server {
       listen 80;
       server_name _;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
3. Test and restart Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 10. Access the Application

Open your browser at:
- If using Nginx: `http://<YOUR_EC2_PUBLIC_IP>`
- If direct: `http://<YOUR_EC2_PUBLIC_IP>:5000`

Log in using the demo accounts:
- **Citizen**: `citizen@resq.org` / `Citizen@123`
- **Volunteer**: `volunteer@resq.org` / `Volunteer@123`
- **Admin**: `admin@resq.org` / `Admin@123`

---

## 11. Cleanup to Conserve Student Credits

After your university viva or demonstration is complete:
1. Open the **AWS Console -> EC2 -> Instances**.
2. Select `ResQ-Disaster-Server`.
3. Click **Instance state -> Terminate instance** (or **Stop instance** if you plan to demonstrate again tomorrow).
4. If you used AWS RDS, ensure the RDS database instance is also deleted to avoid consuming credits while idle.
