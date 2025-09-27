const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const CONFIG_FILE_PATH = path.join(__dirname, '../config/email-config.json');

class ConfigStore {
  constructor() {
    this.configCache = null;
    // Use a machine-specific key for encryption
    this.encryptionKey = this.generateEncryptionKey();
  }

  // Generate a machine-specific encryption key
  generateEncryptionKey() {
    const os = require('os');
    const machineId = os.hostname() + os.platform() + os.arch();
    return crypto.createHash('sha256').update(machineId + 'PalmExitGarage').digest();
  }

  // Encrypt password
  encryptPassword(password) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  // Decrypt password
  decryptPassword(encryptedPassword) {
    try {
      const parts = encryptedPassword.split(':');
      if (parts.length !== 2) throw new Error('Invalid encrypted password format');
      
      const iv = Buffer.from(parts[0], 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
      let decrypted = decipher.update(parts[1], 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Error decrypting password:', error.message);
      return null;
    }
  }

  // Ensure config directory exists
  async ensureConfigDirectory() {
    const configDir = path.dirname(CONFIG_FILE_PATH);
    try {
      await fs.mkdir(configDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error('Error creating config directory:', error);
        throw error;
      }
    }
  }

  // Save email configuration to file
  async saveEmailConfig(emailConfig) {
    try {
      await this.ensureConfigDirectory();
      
      const configData = {
        email: emailConfig.email,
        shopName: emailConfig.shopName,
        savedAt: new Date().toISOString()
      };
      
      // Encrypt and save password if provided
      if (emailConfig.password) {
        configData.encryptedPassword = this.encryptPassword(emailConfig.password);
      }

      await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(configData, null, 2), 'utf8');
      this.configCache = configData;
      console.log('Email configuration saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving email configuration:', error);
      return false;
    }
  }

  // Load email configuration from file
  async loadEmailConfig() {
    try {
      if (this.configCache) {
        return this.configCache;
      }

      const configData = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
      const parsedConfig = JSON.parse(configData);
      this.configCache = parsedConfig;
      return parsedConfig;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return null
        return null;
      } else {
        console.error('Error loading email configuration:', error);
        return null;
      }
    }
  }

  // Check if email configuration exists
  async hasEmailConfig() {
    const config = await this.loadEmailConfig();
    return config !== null && config.email;
  }

  // Get decrypted password from saved config
  async getDecryptedPassword() {
    const config = await this.loadEmailConfig();
    if (config && config.encryptedPassword) {
      return this.decryptPassword(config.encryptedPassword);
    }
    return null;
  }

  // Clear email configuration
  async clearEmailConfig() {
    try {
      await fs.unlink(CONFIG_FILE_PATH);
      this.configCache = null;
      console.log('Email configuration cleared');
      return true;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error clearing email configuration:', error);
        return false;
      }
      return true; // File doesn't exist, consider it cleared
    }
  }
}

// Create singleton instance
const configStore = new ConfigStore();

module.exports = configStore;