# Install MySQL Locally on Windows

This guide will help you install MySQL directly on your Windows machine for PalmExitGarage.

## 🎯 Why Local MySQL?

- ✅ **Free forever** - No cloud service fees
- ✅ **No internet required** - Works completely offline
- ✅ **Full control** - Your data stays on your machine
- ✅ **Simple backups** - Copy files to Google Drive manually
- ✅ **Fast** - No network latency

---

## 📥 Option 1: MySQL Installer (Recommended)

### Step 1: Download MySQL

1. Go to: https://dev.mysql.com/downloads/installer/
2. Download **MySQL Installer** - Recommended versions:
   - **MySQL 8.0.x** (8.0.35 or higher) - Most tested and recommended
   - MySQL 8.4.x or MySQL 9.x also work fine
   - The application is compatible with most MySQL versions
3. Download **mysql-installer-community.msi**
   - Choose the **"Full" installer (~400MB)** - Recommended for offline installs
   - Or **"Web" installer (~30MB)** - Downloads components during installation (requires internet)
4. For older 8.0.x versions:
   - Click "Looking for previous GA versions?" or "Archives"

### Step 2: Run the Installer

1. **Double-click** the downloaded `.msi` file
2. If Windows asks "Do you want to allow this app to make changes?" → Click **Yes**

### Step 3: Choose Setup Type

⚠️ **IMPORTANT: Choose the right setup type based on your needs**

**Option A - Server Only (Recommended for production):**
- Select **"Server only"**
- Installs: MySQL Server 8.0.x only
- Size: ~200MB
- Best for: Production environments, minimal installations

**Option B - Developer Default (Recommended for development):**
- Select **"Developer Default"**
- Installs: MySQL Server, MySQL Workbench, MySQL Shell, connectors, samples
- Size: ~400MB
- Best for: Developers who want GUI management tools
- Includes MySQL Workbench - a visual database management tool

**Option C - Custom:**
- For advanced users who want to select specific components
- Minimum required: MySQL Server 8.0.x

Click **Next**

### Step 4: Check Requirements

If any requirements are missing, click **Execute** to install them.
Click **Next**

### Step 5: Installation

Click **Execute** to start installing.
Wait for all products to install (may take 5-10 minutes).
Click **Next**

### Step 6: Configure MySQL Server

**Type and Networking:**
- Config Type: **Development Computer** (or "Server Computer" for production)
  - Development: Optimized for minimal resource usage
  - Server: Optimized for dedicated database server
- Port: **3306** (default - DO NOT CHANGE unless you have a conflict)
- TCP/IP: Should be **CHECKED** ✓
- Open Windows Firewall port: **CHECKED** ✓ (allows connections)
- Show Advanced and Logging Options: Optional
- Click **Next**

**Authentication Method:**
- Select **"Use Strong Password Encryption"** (recommended)
- Click **Next**

**Accounts and Roles:**
- Set a **Root Password** (remember this - you'll need it EVERY TIME!)
  - **REQUIREMENT:** Minimum 8 characters, mix of letters, numbers, and symbols
  - Example: `MySecure123!` or `PalmExit2025!`
  - **⚠️ CRITICAL: WRITE THIS DOWN AND KEEP IT SAFE!**
  - You will need this password to configure PalmExitGarage
- Optional: Add MySQL User Accounts (can do this later)
- Click **Next**

💡 **Pro Tip:** Use a password manager or write it in your installation notes file

**Windows Service:**
- Keep default settings:
  - Service Name: MySQL80
  - Start MySQL at System Startup: ✓ (checked)
- Click **Next**

**Server File Permissions:**
- Keep default
- Click **Next**

**Apply Configuration:**
- Click **Execute**
- Wait for configuration to complete
- Click **Finish**

### Step 7: Complete Installation

Click **Next** → **Finish**

---

## 🔧 Configure PalmExitGarage

### Update Database Configuration:

Open: `C:\palmexitgarage_test\server\config\database.js`

Update with your settings:
```javascript
module.exports = {
    host: 'localhost',           // Local MySQL
    port: 3306,                  // Default MySQL port
    user: 'root',                // MySQL username
    password: 'YourPasswordHere', // Password you set during install
    database: 'palmexitgarage',  // Database name
    connectTimeout: 60000
};
```

**Important:** Replace `'YourPasswordHere'` with the password you set!

---

## 🗄️ Create the Database

### Option A: Using MySQL Workbench (If installed)

1. Open **MySQL Workbench**
2. Click your connection (usually "Local instance MySQL80")
3. Enter your root password
4. In the query window, run:
   ```sql
   CREATE DATABASE palmexitgarage;
   ```
5. Click the ⚡ (Execute) button

### Option B: Using Command Line

1. Open **Command Prompt** or **PowerShell**
2. Navigate to MySQL bin directory:
   ```bash
   cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
   ```
3. Connect to MySQL:
   ```bash
   mysql -u root -p
   ```
4. Enter your root password
5. Create database:
   ```sql
   CREATE DATABASE palmexitgarage;
   exit;
   ```

### Option C: Let the Migration Script Create It

The app can create the database automatically. Just update the config and run migrations (next step).

---

## 🚀 Initialize PalmExitGarage Database

### 1. Test Connection:
```bash
cd C:\palmexitgarage_test\server
node index.js
```

Look for: `Connected to MySQL database` ✅

If you see an error, check:
- Is MySQL service running?
- Is password correct in `database.js`?
- Does database exist?

### 2. Create Tables:
```bash
node migrate.js
```

You should see:
```
Connected to MySQL database
Creating PalmExitGarage database tables...
customers table created successfully
vehicles table created successfully
parts table created successfully
...
All PalmExitGarage tables created successfully!
```

### 3. (Optional) Add Sample Data:
```bash
node seed_comprehensive_vehicles.js
```

---

## 📦 Using Backups with Google Drive

### Your Workflow:

1. **Create backup** in the app:
   - Click "💾 Database Backup"
   - Select database
   - Click "Create Backup"
   - File saved to: `C:\palmexitgarage_test\server\backups\`

2. **Copy to Google Drive**:
   - Open File Explorer
   - Navigate to: `C:\palmexitgarage_test\server\backups\`
   - Copy the `.sql` file
   - Paste into your Google Drive folder

3. **To restore later**:
   - Copy file from Google Drive
   - Paste into: `C:\palmexitgarage_test\server\backups\`
   - Use the app's restore feature

### Automate Google Drive Sync (Optional):

If you have **Google Drive Desktop** installed:
1. In File Explorer, navigate to: `C:\palmexitgarage_test\server\backups\`
2. Right-click on the `backups` folder
3. Select **"Add to Google Drive"** or **"Sync this folder"**
4. Now all backups automatically sync to Google Drive!

---

## 📥 Option 2: XAMPP (Alternative - Easier)

If MySQL Installer seems complicated, use XAMPP:

### Install XAMPP:

1. Download from: https://www.apachefriends.org/
2. Run installer
3. Select **MySQL** (required) and **phpMyAdmin** (optional)
4. Install to: `C:\xampp`
5. After install, open **XAMPP Control Panel**
6. Click **Start** next to MySQL

### Configure:

Default settings:
- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: `` (empty by default)

Update `database.js`:
```javascript
module.exports = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',  // Empty for XAMPP default
    database: 'palmexitgarage',
    connectTimeout: 60000
};
```

### Create Database:

1. Open browser: http://localhost/phpmyadmin
2. Click "Databases" tab
3. Enter database name: `palmexitgarage`
4. Click "Create"

Then run migrations as described above.

---

## 🔧 Troubleshooting

### "MySQL service not running"

**Solution:**
1. Open **Services** (Windows key + R, type `services.msc`)
2. Find **MySQL80** (or MySQL)
3. Right-click → **Start**

Or use Command Prompt as Administrator:
```bash
net start MySQL80
```

### "Access denied for user 'root'"

**Solution:**
- Double-check password in `database.js`
- Make sure you're using the correct password you set during installation

### "Can't connect to MySQL server"

**Solution:**
1. Verify MySQL is running (see above)
2. Check port is 3306 in both MySQL and config
3. Try: `telnet localhost 3306` (should connect)

### "Unknown database 'palmexitgarage'"

**Solution:**
Create the database first (see "Create the Database" section above)

---

## ✅ Quick Start Checklist

- [ ] Downloaded MySQL Installer or XAMPP
- [ ] Installed MySQL
- [ ] Set root password (MySQL Installer) or kept empty (XAMPP)
- [ ] MySQL service is running
- [ ] Updated `server/config/database.js` with password
- [ ] Created `palmexitgarage` database
- [ ] Ran `node migrate.js` to create tables
- [ ] Started server successfully (`node index.js`)
- [ ] Tested backup feature in the app
- [ ] Copied backup file to Google Drive manually
- [ ] (Optional) Set up Google Drive Desktop auto-sync

---

## 💾 Backup Best Practices

### Daily Routine:
1. End of day: Create backup in app
2. File automatically appears in Google Drive (if synced)
3. Or: Manually copy to Google Drive weekly

### Storage:
- Keep last 7 daily backups locally
- Keep last 4 weekly backups in Google Drive
- Keep monthly backups for 1 year

### File Organization in Google Drive:
```
Google Drive/
└── PalmExitGarage_Backups/
    ├── 2025-10/
    │   ├── palmexitgarage_backup_2025-10-01T17-00-00.sql
    │   ├── palmexitgarage_backup_2025-10-02T17-00-00.sql
    │   └── ...
    └── 2025-11/
        └── ...
```

---

## 🎉 You're Done!

Your setup:
- ✅ MySQL running locally on your PC
- ✅ PalmExitGarage connected and working
- ✅ Backups saved to `server/backups/`
- ✅ Manual or automatic sync to Google Drive
- ✅ Complete offline capability
- ✅ No monthly fees!

**Next:** Open the app and click "💾 Database Backup" to create your first backup!

---

**Last Updated:** October 2025  
**Version:** 1.1.0
