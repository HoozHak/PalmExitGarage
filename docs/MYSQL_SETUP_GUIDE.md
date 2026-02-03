# MySQL Setup Guide - Third-Party Database Options

This guide will help you set up PalmExitGarage with a third-party MySQL database provider.

## 🌐 Free MySQL Database Providers

### Option 1: Clever Cloud (Recommended - Free Tier)
- **Free Tier:** Yes (256MB storage)
- **Location:** EU/US data centers
- **Setup:** ~5 minutes

**Steps:**
1. Go to https://www.clever-cloud.com/
2. Sign up for a free account
3. Create a new MySQL add-on
4. Note your connection details:
   - Host
   - Port (usually 3306)
   - Username
   - Password
   - Database name

### Option 2: Aiven (Free Trial)
- **Free Trial:** $300 credit for 30 days
- **Location:** Multiple regions
- **Setup:** ~5 minutes

**Steps:**
1. Go to https://aiven.io/
2. Sign up for a free trial
3. Create a MySQL service
4. Get your connection details from the service page

### Option 3: PlanetScale (Free Tier)
- **Free Tier:** Yes (5GB storage, 1 billion row reads/month)
- **Location:** Global
- **Setup:** ~5 minutes

**Steps:**
1. Go to https://planetscale.com/
2. Sign up for a free account
3. Create a new database
4. Create a connection string
5. Note your connection details

### Option 4: FreeMySQLHosting.net
- **Free Tier:** Yes (5MB storage - limited!)
- **Location:** US
- **Setup:** Instant

**Steps:**
1. Go to https://www.freemysqlhosting.net/
2. Sign up for a free account
3. Create a database
4. Note your connection details

### Option 5: db4free.net
- **Free Tier:** Yes (200MB storage)
- **Location:** Germany
- **Setup:** Instant

**Steps:**
1. Go to https://www.db4free.net/
2. Sign up for a free account
3. Create a database
4. Note your connection details

---

## ⚙️ Configuring PalmExitGarage

Once you have your database credentials, update the configuration file:

### 1. Open the configuration file:
```
C:\palmexitgarage_test\server\config\database.js
```

### 2. Update with your credentials:

```javascript
module.exports = {
    host: 'your-database-host.example.com',  // From provider
    port: 3306,                               // Usually 3306
    user: 'your-username',                    // From provider
    password: 'your-password',                // From provider
    database: 'your-database-name',           // From provider
    
    connectTimeout: 60000
};
```

### 3. Example configurations:

**PlanetScale example:**
```javascript
module.exports = {
    host: 'aws.connect.psdb.cloud',
    port: 3306,
    user: 'myusername',
    password: 'pscale_pw_xxxxxxxxxxxxxxxx',
    database: 'palmexitgarage',
    connectTimeout: 60000
};
```

**Clever Cloud example:**
```javascript
module.exports = {
    host: 'bmyfaxmwicl1gvmd-mysql.services.clever-cloud.com',
    port: 3306,
    user: 'ucv7abc123',
    password: 'aBcDeFgHiJkLmN',
    database: 'bmyfaxmwicl1gvmd',
    connectTimeout: 60000
};
```

---

## 🗄️ Setting Up Your Database

After connecting, you need to create the database tables:

### 1. Make sure your server can connect:
```bash
cd C:\palmexitgarage_test\server
node index.js
```

Look for: `Connected to MySQL database`

### 2. Run the migration script:
```bash
node migrate.js
```

This will create all necessary tables.

### 3. (Optional) Seed sample data:
```bash
node seed_comprehensive_vehicles.js
```

---

## 🔒 Security Best Practices

### 1. Environment Variables (Recommended)

Instead of hardcoding credentials, use environment variables:

**Create `.env` file** in `C:\palmexitgarage_test\server\`:
```
DB_HOST=your-database-host.example.com
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database-name
```

**Update `database.js`:**
```javascript
require('dotenv').config();

module.exports = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'palmexitgarage',
    connectTimeout: 60000
};
```

### 2. Add `.env` to `.gitignore`

Make sure `.env` is in your `.gitignore` file so passwords aren't committed to git:
```
.env
```

---

## 🔍 Testing Your Connection

### Quick Connection Test:

Create a test file `test-connection.js`:
```javascript
const dbConfig = require('./config/database');
const mysql = require('mysql2');

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
    console.log('✅ Successfully connected to MySQL!');
    
    connection.query('SELECT DATABASE() as db', (err, results) => {
        if (err) {
            console.error('❌ Query failed:', err);
        } else {
            console.log('📊 Current database:', results[0].db);
        }
        connection.end();
    });
});
```

Run it:
```bash
node test-connection.js
```

---

## ⚠️ Common Issues

### "Connection refused"
- **Cause:** Wrong host or port
- **Solution:** Double-check your connection details from the provider

### "Access denied for user"
- **Cause:** Wrong username or password
- **Solution:** Verify credentials, regenerate if needed

### "Unknown database"
- **Cause:** Database doesn't exist
- **Solution:** Make sure the database is created in your provider's dashboard

### "Connection timeout"
- **Cause:** Firewall blocking connection
- **Solution:** Check if your IP is whitelisted (some providers require this)

### "Too many connections"
- **Cause:** Free tier connection limit reached
- **Solution:** Close unused connections or upgrade to paid tier

---

## 📊 Database Size Considerations

**PalmExitGarage typical storage needs:**
- Fresh install: ~1-2 MB
- Small shop (1 year): ~10-50 MB
- Medium shop (1 year): ~50-200 MB
- Large shop (1 year): ~200-500 MB

**Recommendation:** Choose a provider with at least 200MB free storage.

---

## 🔄 Migrating from Local/Docker to Cloud

If you have existing data:

1. **Create a backup** of your current database:
   - Use the app's backup feature
   - Or use: `mysqldump -u root -p palmexitgarage > backup.sql`

2. **Set up your cloud database** (follow steps above)

3. **Restore your backup** to the cloud database:
   - Use the app's restore feature
   - Or manually import the SQL file through your provider's dashboard

---

## 💡 Tips

1. **Keep backups!** Cloud databases can have issues, always maintain local backups
2. **Monitor usage:** Check your database size regularly to avoid hitting limits
3. **Use compression:** Some providers support compression to reduce storage
4. **Regional selection:** Choose a database close to your physical location for better speed
5. **SSL connections:** Many cloud providers require or recommend SSL connections

---

## 📞 Support

If you have issues connecting:

1. Check the provider's status page
2. Verify your credentials in the provider's dashboard
3. Test connection with a simple tool like MySQL Workbench
4. Check provider documentation for connection examples
5. Ensure your firewall allows outbound connections on port 3306

---

## ✅ Quick Checklist

- [ ] Created account with database provider
- [ ] Created new MySQL database
- [ ] Noted all connection credentials (host, port, user, password, database)
- [ ] Updated `server/config/database.js` with credentials
- [ ] Tested connection by starting the server
- [ ] Ran migrations to create tables
- [ ] Created first backup using the app
- [ ] (Optional) Set up environment variables for security
- [ ] Added `.env` to `.gitignore`

---

**Last Updated:** October 2025  
**Version:** 1.1.0
