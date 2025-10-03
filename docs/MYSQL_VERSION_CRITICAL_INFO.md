# ⚠️ CRITICAL: MySQL Version Requirements for PalmExitGarage

## 🚨 READ THIS BEFORE INSTALLING MYSQL! 🚨

**The MySQL download page will show you NEWER versions first (8.4.x, 9.x) - DO NOT INSTALL THESE!**

---

## ✅ CORRECT VERSION TO INSTALL

### **MySQL 8.0.x (LTS Version)**

**Supported versions:**
- ✅ MySQL 8.0.35
- ✅ MySQL 8.0.36
- ✅ MySQL 8.0.37
- ✅ MySQL 8.0.38
- ✅ MySQL 8.0.39
- ✅ MySQL 8.0.40 ⭐ **RECOMMENDED** (Latest stable 8.0.x)

---

## ❌ DO NOT INSTALL THESE VERSIONS

### **MySQL 8.4.x (Innovation Release)**
- ❌ MySQL 8.4.0
- ❌ MySQL 8.4.1
- ❌ MySQL 8.4.2
- ❌ Any version starting with 8.4

**Why not?** Innovation releases have breaking changes and are NOT compatible with this application.

### **MySQL 9.x (Innovation Release)**
- ❌ MySQL 9.0.0
- ❌ MySQL 9.0.1
- ❌ MySQL 9.1.0
- ❌ Any version starting with 9

**Why not?** Major version changes with breaking changes. NOT compatible with this application.

---

## 📥 HOW TO DOWNLOAD THE CORRECT VERSION

### Step-by-Step Download Instructions:

1. **Go to:** https://dev.mysql.com/downloads/installer/

2. **YOU WILL SEE SOMETHING LIKE THIS:**
   ```
   MySQL Installer 9.0.1         ← ❌ DO NOT DOWNLOAD THIS!
   (mysql-installer-community-9.0.1.msi)
   ```

3. **LOOK FOR THE LINK:**
   - Near the download button, you'll see text that says:
   - **"Looking for previous GA versions?"** ← CLICK THIS!
   - OR
   - **"Archives"** ← CLICK THIS!

4. **SELECT VERSION:**
   - In the dropdown menu, select **"8.0.40"** (or latest 8.0.x available)
   - Click the version to see download options

5. **DOWNLOAD THE INSTALLER:**
   - Choose **"Windows (x86, 32-bit), MSI Installer"** (Full package, ~400MB)
   - OR **"Windows (x86, 32-bit), MSI Installer"** (Web installer, ~30MB)
   - Click **"Download"**
   - You may need to click **"No thanks, just start my download"** (no login required)

---

## 🎯 WHAT YOU SHOULD SEE

### ✅ Correct Filename Format:
```
mysql-installer-community-8.0.40.msi  ← CORRECT!
mysql-installer-community-8.0.39.msi  ← CORRECT!
mysql-installer-community-8.0.38.msi  ← CORRECT!
```

### ❌ Wrong Filename Format:
```
mysql-installer-community-8.4.2.msi   ← WRONG! DO NOT USE!
mysql-installer-community-9.0.1.msi   ← WRONG! DO NOT USE!
mysql-installer-community-9.1.0.msi   ← WRONG! DO NOT USE!
```

---

## 🔍 VERIFY YOUR DOWNLOAD

**Before running the installer, check the filename:**

1. Open your **Downloads** folder
2. Look at the filename
3. Make sure it says **"8.0.xx"** NOT "8.4" or "9.x"

**If you downloaded the wrong version:**
- Delete the file
- Go back and download the correct version (8.0.x)

---

## 📋 INSTALLATION CHECKLIST

Use this checklist during installation:

### Before Installation:
- [ ] Downloaded **mysql-installer-community-8.0.xx.msi**
- [ ] Verified filename says **8.0** (not 8.4 or 9.x)
- [ ] Running installer as Administrator

### During Installation:
- [ ] Setup Type: **"Developer Default"** OR **"Server only"**
- [ ] MySQL Server version shown is **8.0.xx**
- [ ] Port set to **3306**
- [ ] Created **root password** (WROTE IT DOWN!)
- [ ] "Start MySQL at System Startup" is **CHECKED**

### After Installation:
- [ ] MySQL service is running
- [ ] Can connect using the password you set
- [ ] Updated `database.js` with your password

---

## 🚨 WHAT IF I ALREADY INSTALLED THE WRONG VERSION?

If you accidentally installed MySQL 8.4.x or 9.x:

### Option 1: Uninstall and Reinstall (Recommended)

1. **Uninstall MySQL:**
   - Open **Settings** → **Apps** → **Installed Apps**
   - Search for **"MySQL"**
   - Uninstall all MySQL components
   - Restart your computer

2. **Clean up (Optional but recommended):**
   - Delete folder: `C:\Program Files\MySQL\`
   - Delete folder: `C:\ProgramData\MySQL\`
   - Delete folder: `C:\Users\[YourName]\AppData\Roaming\MySQL\`

3. **Reinstall MySQL 8.0.x:**
   - Follow the download instructions above
   - Install MySQL 8.0.40 (or latest 8.0.x)

### Option 2: Install 8.0.x Alongside (Advanced)

- You can install MySQL 8.0.x on a different port (e.g., 3307)
- Update `database.js` to use port 3307
- Not recommended for beginners

---

## 📞 NEED HELP?

### Check Your MySQL Version:

**Method 1 - MySQL Workbench:**
1. Open MySQL Workbench
2. Connect to your server
3. Look at the connection info (should show version)

**Method 2 - Command Line:**
```powershell
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
.\mysql --version
```

Should show: `mysql  Ver 8.0.xx for Win64 on x86_64`

**Method 3 - Windows Services:**
1. Press `Windows + R`
2. Type: `services.msc`
3. Look for **"MySQL80"** or **"MySQL84"** or **"MySQL90"**
   - MySQL80 = Good! ✅
   - MySQL84 or MySQL90 = Wrong version! ❌

---

## 🎓 WHY IS THIS SO IMPORTANT?

**MySQL Versioning Strategy Changed:**

- **MySQL 8.0.x** = LTS (Long Term Support) - Stable, tested, compatible
- **MySQL 8.4.x** = Innovation Release - New features, breaking changes
- **MySQL 9.x** = Innovation Release - Major changes, NOT backward compatible

**PalmExitGarage was built and tested on MySQL 8.0.x**
- Using a newer version WILL cause compatibility issues
- Database queries may fail
- Application may not start
- Data integrity could be at risk

---

## ✅ QUICK REFERENCE

**When in doubt, remember this:**

```
8.0.xx = ✅ GOOD - Install this!
8.4.xx = ❌ BAD  - Skip this!
9.x.xx = ❌ BAD  - Skip this!
```

**Download page shows 9.x first?**
→ Click **"Looking for previous GA versions?"**
→ Select **8.0.40**
→ Download and install

---

## 📚 Additional Resources

- Official MySQL 8.0 Documentation: https://dev.mysql.com/doc/refman/8.0/en/
- MySQL 8.0 Archive Downloads: https://downloads.mysql.com/archives/installer/
- Detailed Installation Guide: See `INSTALL_MYSQL_WINDOWS.md`

---

**Last Updated:** October 2025
**Application Version:** 1.1.0
**Required MySQL Version:** 8.0.35 - 8.0.40 (LTS)

---

## 🎯 REMEMBER

**If you see MySQL 8.4 or 9.x on the download page:**

👉 **DON'T PANIC!**
👉 **DON'T CLICK DOWNLOAD!**
👉 **LOOK FOR "Previous GA versions" or "Archives"**
👉 **SELECT VERSION 8.0.40**
👉 **THEN DOWNLOAD**

**This single step will save you hours of troubleshooting!** ⚠️
