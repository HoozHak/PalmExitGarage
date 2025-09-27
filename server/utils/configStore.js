const fs = require('fs').promises;
const path = require('path');

const CONFIG_FILE_PATH = path.join(__dirname, '../config/email-config.json');

class ConfigStore {
  constructor() {
    this.configCache = null;
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
        // NOTE: We don't save the password for security reasons
        // User will need to re-enter password on server restart
      };

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