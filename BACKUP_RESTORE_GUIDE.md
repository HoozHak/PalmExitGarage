# 💾 Database Backup & Restore Guide

## Overview
This guide explains how to use the Database Backup & Restore feature in PalmExitGarage. This feature allows you to create backups of your databases and restore them when needed.

## 🎯 Quick Start

### Creating a Backup
1. Open the PalmExitGarage application
2. Click on **"💾 Database Backup"** from the home screen
3. Select the database you want to backup from the dropdown
4. Click **"Create Backup"**
5. Your backup file is now created!

### Restoring a Backup
1. Navigate to the Database Backup page
2. Find the backup you want to restore in the "Available Backups" table
3. Click the **"🔄 Restore"** button
4. **READ THE WARNING CAREFULLY** - Restoring will replace all current data!
5. Type **"RESTORE"** (in all caps) in the confirmation box
6. Click **"RESTORE DATABASE"**

---

## 📁 File Locations

### Where Backup Files Are Stored

**Backup Directory:** 
```
C:\palmexitgarage_test\server\backups\
```

All backup files are automatically saved to this directory when you create a backup.

### Backup File Naming Format

Backup files follow this naming pattern:
```
{databasename}_backup_{timestamp}.sql
```

**Example:**
```
palmexitgarage_backup_2025-10-02T15-30-45.sql
```

- `palmexitgarage` = Database name
- `2025-10-02T15-30-45` = Timestamp (Year-Month-Day, Hour-Minute-Second)
- `.sql` = File extension

---

## 💼 Managing Backup Files

### Moving Backups to Safe Storage

**IMPORTANT:** For proper data protection, you should copy backup files to external storage!

#### Recommended Storage Locations:
1. **USB Drive or External Hard Drive**
   - Most reliable for quick recovery
   - Keep in a safe physical location
   
2. **Cloud Storage** (OneDrive, Google Drive, Dropbox)
   - Access from anywhere
   - Automatic sync (if configured)
   
3. **Network Drive**
   - Good for business environments
   - Easy access for IT administrators

#### How to Copy Backups:

1. **Open File Explorer** (Windows + E)
2. Navigate to: `C:\palmexitgarage_test\server\backups\`
3. Find your backup file(s)
4. **Right-click** → **Copy**
5. Navigate to your external storage location
6. **Right-click** → **Paste**

### Restoring from External Backup

If you need to restore a backup that's stored externally:

1. **Copy the backup file** from your external storage
2. **Paste it** into: `C:\palmexitgarage_test\server\backups\`
3. Open the Database Backup page in the app
4. **Refresh the page** (or restart the app)
5. Your backup should now appear in the "Available Backups" list
6. Click **"Restore"** to restore it

**IMPORTANT:** The filename MUST follow the correct format (`databasename_backup_timestamp.sql`)

---

## ⚠️ DANGER ZONE - Restore Operation

### What Happens During a Restore?

When you restore a database:
- ✅ All data from the backup file is loaded
- ❌ **ALL CURRENT DATA IS REPLACED**
- ❌ Any changes made after the backup was created **WILL BE LOST**
- ❌ **THIS CANNOT BE UNDONE**

### Before You Restore - READ THIS!

**✅ DO THIS FIRST:**
1. **Create a backup of the current database** before restoring
2. Confirm you have the correct backup file
3. Verify the backup timestamp matches what you expect
4. Make sure you're ready to lose all data created after the backup

**🚨 When to Contact Your Administrator:**
- You're not sure which backup to restore
- You don't understand what will happen
- You need to keep current data AND restore old data
- Something seems wrong or unclear

---

## 📋 Best Practices

### Backup Schedule Recommendations

**Daily Backups:**
- Create a backup at the end of each business day
- Store on external drive weekly

**Weekly Backups:**
- Create a backup every Sunday
- Store on cloud storage
- Keep for at least 1 month

**Monthly Backups:**
- Create a backup on the last day of each month
- Store on external drive in a safe location
- Keep for at least 1 year

### File Organization Tips

Create folders to organize your backups:
```
External_Drive/
├── PalmExitGarage_Backups/
│   ├── 2025/
│   │   ├── October/
│   │   │   ├── Daily/
│   │   │   ├── Weekly/
│   │   │   └── Monthly/
│   │   ├── November/
│   │   └── December/
```

### Testing Your Backups

**Test backups regularly!** A backup is only good if it can be restored.

1. Create a test database (not your production database!)
2. Restore a backup to the test database
3. Verify the data is correct
4. This ensures your backups are working properly

---

## 🔧 Technical Details

### What Databases Can Be Backed Up?

The system will show all available MySQL databases on your server, excluding system databases:
- `palmexitgarage` (your main database)
- Any other custom databases you've created

System databases (mysql, information_schema, performance_schema, sys) are automatically excluded.

### File Format

Backup files are SQL dumps created using `mysqldump`. They contain:
- Complete database schema (table structures)
- All data from all tables
- Database settings and configurations

### Requirements

For backups and restores to work, you need:
- ✅ MySQL server running (via Docker or local installation)
- ✅ `mysql` and `mysqldump` command-line tools available
- ✅ Proper database credentials configured in `server/config/database.js`
- ✅ Write permissions to the `server/backups` directory

---

## 🆘 Troubleshooting

### "Failed to create backup"
**Possible causes:**
- MySQL server is not running
- Database credentials are incorrect
- No write permissions to backup directory
- Disk is full

**Solution:** Check server logs, verify MySQL is running, check disk space

### "Backup file not found"
**Possible causes:**
- File was deleted or moved
- Incorrect filename format
- File is not in the backups directory

**Solution:** Verify the file exists at `C:\palmexitgarage_test\server\backups\`

### "Failed to restore backup"
**Possible causes:**
- MySQL server is not running
- Corrupted backup file
- Database doesn't exist
- Incorrect credentials

**Solution:** Try restoring a different backup, check MySQL logs

### Backup files don't appear in the app
**Solution:** 
- Refresh the page
- Verify files are in the correct directory
- Check that filenames follow the correct format

---

## 📞 Support

### Need Help?

**Contact your system administrator if:**
- You're unsure about any operation
- You need to restore but don't know which backup to use
- Something went wrong during backup or restore
- You need help setting up automatic backups

### Administrator Contact

If you are the administrator and need technical support:
- Check server logs in `server/` directory
- Verify MySQL connection settings
- Review error messages in browser console
- Check file permissions on backup directory

---

## 🔐 Security Notes

### Backup File Security

**IMPORTANT:** Backup files contain ALL your business data, including:
- Customer information
- Vehicle records
- Financial data
- Work orders

**Security recommendations:**
1. **Encrypt** backup files when storing on cloud storage
2. **Restrict access** to backup files
3. **Use secure storage** locations (password-protected drives)
4. **Don't share** backups via email or unsecured channels
5. **Delete old backups** securely when no longer needed

### Physical Security

- Keep external backup drives in a locked safe
- Store offsite backups in a secure location
- Limit who has access to backup files
- Document who has access to backups

---

## ✅ Backup Checklist

Print this checklist and keep it visible:

**Daily:**
- [ ] Create end-of-day backup
- [ ] Verify backup was created successfully
- [ ] Note the backup timestamp

**Weekly:**
- [ ] Copy latest backup to external drive
- [ ] Verify external backup file is accessible
- [ ] Delete backups older than 1 month from server

**Monthly:**
- [ ] Create monthly archive backup
- [ ] Copy to secure long-term storage
- [ ] Test restore on test database
- [ ] Document any issues

**After Major Changes:**
- [ ] Create backup before major software updates
- [ ] Create backup before bulk data imports
- [ ] Create backup before database maintenance
- [ ] Keep these backups separate from regular backups

---

## 🎓 Quick Reference

### Key Shortcuts

| Action | Location | Details |
|--------|----------|---------|
| Create Backup | Database Backup page | Select DB → Click Create Backup |
| View Backups | Database Backup page | Scroll to "Available Backups" table |
| Restore | Database Backup page | Click Restore → Type "RESTORE" → Confirm |
| Backup Files | File Explorer | `C:\palmexitgarage_test\server\backups\` |

### File Naming Examples

```
palmexitgarage_backup_2025-10-02T09-00-00.sql  ← Morning backup
palmexitgarage_backup_2025-10-02T17-30-00.sql  ← Evening backup
palmexitgarage_backup_2025-10-02T23-59-59.sql  ← End of day backup
```

---

**Last Updated:** October 2025  
**Version:** 1.1.0

---

## 📝 Document History

- **v1.0** - Initial backup/restore feature documentation
- **v1.1** - Added security notes, troubleshooting, and best practices
