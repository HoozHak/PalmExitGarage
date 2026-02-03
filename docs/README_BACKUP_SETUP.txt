═══════════════════════════════════════════════════════════════
  PALMEXITGARAGE BACKUP SETUP - LOCAL MySQL + GOOGLE DRIVE
═══════════════════════════════════════════════════════════════

✅ RECOMMENDED SETUP (Simple & Free):

1. Install MySQL locally on your Windows PC
   → See: INSTALL_MYSQL_WINDOWS.md

2. Use the app's backup feature to create backups
   → Backups saved to: C:\palmexitgarage_test\server\backups\

3. Manually copy backups to Google Drive
   → Or use Google Drive Desktop to auto-sync the folder

═══════════════════════════════════════════════════════════════

📦 HOW IT WORKS:

┌─────────────────┐
│  PalmExitGarage │  ← Your app
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  MySQL (Local)  │  ← Running on your PC
└────────┬────────┘
         │
         ↓ (Backup button clicked)
         │
┌─────────────────────────────────────┐
│  server/backups/                    │  ← Backup files (.sql)
│  palmexitgarage_backup_2025-10...  │
└────────┬────────────────────────────┘
         │
         ↓ (You copy manually or auto-sync)
         │
┌─────────────────┐
│  Google Drive   │  ← Safe cloud storage
└─────────────────┘

═══════════════════════════════════════════════════════════════

🚀 QUICK START:

Option 1: MySQL Installer
  → Download: https://dev.mysql.com/downloads/installer/
  → Install with GUI tools included
  → Set a root password

Option 2: XAMPP (Easier)
  → Download: https://www.apachefriends.org/
  → Includes MySQL + GUI management tool
  → No password by default

After installation:
  1. Update: server/config/database.js with your password
  2. Run: node migrate.js (creates tables)
  3. Start app: node index.js
  4. Create your first backup!

═══════════════════════════════════════════════════════════════

💾 BACKUP WORKFLOW:

Daily:
  1. Click "💾 Database Backup" in app
  2. Select "palmexitgarage" database  
  3. Click "Create Backup"
  4. Done! File saved locally

Weekly:
  1. Open: C:\palmexitgarage_test\server\backups\
  2. Copy latest .sql file
  3. Paste to Google Drive folder

═══════════════════════════════════════════════════════════════

🔄 AUTOMATIC GOOGLE DRIVE SYNC (Optional):

If you have Google Drive Desktop app:
  1. Right-click: C:\palmexitgarage_test\server\backups\
  2. Select: "Add to Google Drive" or "Sync"
  3. All backups now auto-sync to cloud!

═══════════════════════════════════════════════════════════════

💰 COST: $0.00 (100% FREE)

✅ MySQL: Free forever (local install)
✅ Google Drive: Free 15GB storage
✅ PalmExitGarage: Free open-source

No monthly fees. No cloud database charges. Complete control!

═══════════════════════════════════════════════════════════════

📖 FULL GUIDES AVAILABLE:

→ INSTALL_MYSQL_WINDOWS.md     - Complete MySQL setup guide
→ BACKUP_RESTORE_GUIDE.md      - How to use backup/restore
→ BACKUP_QUICK_START.txt       - Quick reference

═══════════════════════════════════════════════════════════════

🆘 NEED HELP?

1. Make sure MySQL service is running
2. Check password in database.js is correct
3. Verify port 3306 is not blocked
4. See troubleshooting in INSTALL_MYSQL_WINDOWS.md

═══════════════════════════════════════════════════════════════
