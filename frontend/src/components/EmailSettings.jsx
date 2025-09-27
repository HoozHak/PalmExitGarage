import React, { useState, useEffect } from 'react';
import Navigation from './Navigation.jsx';
import {
  loadTimeSettings,
  saveTimeSettings,
  getCurrentTime,
  formatTimeForDisplay,
  getTimezoneDisplayName,
  getCommonTimezones,
  timeZoneObservesDST,
  toInputDateTime
} from '../utils/timeSettings.js';

const API_BASE = 'http://localhost:5000/api';

function EmailSettings() {
  const [emailConfig, setEmailConfig] = useState({
    email: '',
    password: '',
    shopName: 'Palm Exit Garage'
  });
  const [emailStatus, setEmailStatus] = useState({
    configured: false,
    shopEmail: null,
    shopName: null
  });
  const [testEmail, setTestEmail] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Time settings state
  const [timeSettings, setTimeSettings] = useState({
    useCustomTime: false,
    customDate: '',
    customTime: '',
    timezone: 'America/New_York',
    autoDetectTimezone: true,
    enableDST: true
  });
  const [currentDisplayTime, setCurrentDisplayTime] = useState('');
  const [timeMessage, setTimeMessage] = useState('');
  const [timeError, setTimeError] = useState('');

  useEffect(() => {
    loadEmailStatus();
    loadTimeSettingsData();
    updateDisplayTime();

    // Update display time every second
    const timeInterval = setInterval(updateDisplayTime, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const loadEmailStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/email/status`);
      if (response.ok) {
        const status = await response.json();
        setEmailStatus(status);
        if (status.configured || status.hasSavedConfig) {
          setEmailConfig({
            email: status.shopEmail || status.savedEmail || '',
            password: '',
            shopName: status.shopName || status.savedShopName || 'Palm Exit Garage'
          });
        }
        
        // Show message if we have saved config but need password
        if (status.needsPassword) {
          setMessage(`Found saved configuration for ${status.savedEmail}. Please re-enter your Gmail App Password to activate email service.`);
        }
      }
    } catch (error) {
      console.error('Error loading email status:', error);
    }
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setEmailConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfigure = async (e) => {
    e.preventDefault();
    setIsConfiguring(true);
    setMessage('');
    setError('');

    if (!emailConfig.email || !emailConfig.password) {
      setError('Email and password are required');
      setIsConfiguring(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/email/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailConfig),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage('Email service configured successfully! You can now send receipts to customers.');
        loadEmailStatus();
        // Clear password for security
        setEmailConfig(prev => ({ ...prev, password: '' }));
      } else {
        const errorData = await response.json();
        setError('Configuration failed: ' + errorData.error);
      }
    } catch (error) {
      console.error('Email configuration error:', error);
      setError('Network error: Could not connect to server');
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleTestEmail = async (e) => {
    e.preventDefault();
    setIsTesting(true);
    setMessage('');
    setError('');

    if (!testEmail) {
      setError('Test email address is required');
      setIsTesting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/email/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipientEmail: testEmail }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`Test email sent successfully to ${testEmail}! Check your inbox.`);
        setTestEmail('');
      } else {
        const errorData = await response.json();
        setError('Test email failed: ' + errorData.error);
      }
    } catch (error) {
      console.error('Test email error:', error);
      setError('Network error: Could not connect to server');
    } finally {
      setIsTesting(false);
    }
  };

  // Time Settings Functions
  const loadTimeSettingsData = () => {
    try {
      const settings = loadTimeSettings();
      setTimeSettings(settings);
      
      // If using custom time, populate the input fields
      if (settings.useCustomTime && settings.customDate && settings.customTime) {
        // Settings already contain the date and time strings
      } else if (settings.useCustomTime) {
        // Set to current time if custom time is enabled but no date/time set
        const current = getCurrentTime();
        const inputDateTime = toInputDateTime(current);
        setTimeSettings(prev => ({
          ...prev,
          customDate: inputDateTime.date,
          customTime: inputDateTime.time
        }));
      }
    } catch (error) {
      console.error('Error loading time settings:', error);
      setTimeError('Error loading time settings');
    }
  };

  const updateDisplayTime = () => {
    try {
      const displayTime = formatTimeForDisplay();
      setCurrentDisplayTime(displayTime);
    } catch (error) {
      console.error('Error updating display time:', error);
      setCurrentDisplayTime('Error loading time');
    }
  };

  const handleTimeSettingChange = (field, value) => {
    setTimeSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear any previous messages
    setTimeMessage('');
    setTimeError('');
  };

  const handleSaveTimeSettings = () => {
    setTimeMessage('');
    setTimeError('');
    
    try {
      // Validate custom time if enabled
      if (timeSettings.useCustomTime) {
        if (!timeSettings.customDate || !timeSettings.customTime) {
          setTimeError('Please set both date and time when using custom time');
          return;
        }
        
        // Validate date format
        const testDate = new Date(`${timeSettings.customDate}T${timeSettings.customTime}`);
        if (isNaN(testDate.getTime())) {
          setTimeError('Invalid date or time format');
          return;
        }
      }
      
      const success = saveTimeSettings(timeSettings);
      if (success) {
        setTimeMessage('Time settings saved successfully!');
        updateDisplayTime(); // Update the display immediately
      } else {
        setTimeError('Failed to save time settings');
      }
    } catch (error) {
      console.error('Error saving time settings:', error);
      setTimeError('Error saving time settings: ' + error.message);
    }
  };

  const handleResetToSystemTime = () => {
    const systemTime = new Date();
    const inputDateTime = toInputDateTime(systemTime);
    
    setTimeSettings(prev => ({
      ...prev,
      useCustomTime: false,
      customDate: inputDateTime.date,
      customTime: inputDateTime.time,
      autoDetectTimezone: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }));
    
    setTimeMessage('Reset to system time');
    setTimeError('');
  };

  return (
    <div style={{
      backgroundColor: 'black',
      minHeight: '100vh',
      color: '#FFD329'
    }}>
      <Navigation />
      <div style={{ padding: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{
            marginBottom: '30px'
          }}>
            <h2 style={{
              fontSize: '28px',
              color: '#FFD329',
              margin: 0,
              marginBottom: '10px'
            }}>
              ⚙️ Settings
            </h2>
            <p style={{ color: '#ccc', margin: 0 }}>
              Configure email and time settings for work orders
            </p>
          </div>

          {/* Time & Date Settings Section */}
          <div style={{
            backgroundColor: '#333',
            padding: '25px',
            borderRadius: '10px',
            marginBottom: '30px',
            border: '2px solid #FFD329'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#FFD329' }}>
              🕰️ Time & Date Settings
            </h3>

            {/* Current Time Display */}
            <div style={{
              backgroundColor: '#444',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #666'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#ccc' }}>Current Time:</span>
                <strong style={{ color: '#FFD329', fontSize: '18px' }}>
                  {currentDisplayTime}
                </strong>
              </div>
              {timeSettings.useCustomTime && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#FF9800',
                  fontStyle: 'italic'
                }}>
                  ⚠️ Using custom time for work orders
                </div>
              )}
            </div>

            {/* Time Messages */}
            {timeMessage && (
              <div style={{
                backgroundColor: '#2d5a2d',
                color: '#90ee90',
                padding: '12px',
                borderRadius: '5px',
                marginBottom: '15px',
                border: '1px solid #4CAF50',
                fontSize: '14px'
              }}>
                {timeMessage}
              </div>
            )}

            {timeError && (
              <div style={{
                backgroundColor: '#5a2d2d',
                color: '#ff9999',
                padding: '12px',
                borderRadius: '5px',
                marginBottom: '15px',
                border: '1px solid #f44336',
                fontSize: '14px'
              }}>
                {timeError}
              </div>
            )}

            {/* Custom Time Toggle */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                <input
                  type="checkbox"
                  checked={timeSettings.useCustomTime}
                  onChange={(e) => handleTimeSettingChange('useCustomTime', e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ color: '#FFD329' }}>Use Custom Time for Work Orders</span>
              </label>
              <p style={{
                fontSize: '12px',
                color: '#ccc',
                margin: '5px 0 0 28px'
              }}>
                When enabled, work orders will use your custom date/time instead of the current system time
              </p>
            </div>

            {/* Custom Date and Time Inputs */}
            {timeSettings.useCustomTime && (
              <div style={{
                backgroundColor: '#444',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #666'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontWeight: 'bold',
                      color: '#FFD329'
                    }}>
                      Custom Date
                    </label>
                    <input
                      type="date"
                      value={timeSettings.customDate}
                      onChange={(e) => handleTimeSettingChange('customDate', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #666',
                        backgroundColor: '#555',
                        color: '#FFD329',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontWeight: 'bold',
                      color: '#FFD329'
                    }}>
                      Custom Time
                    </label>
                    <input
                      type="time"
                      value={timeSettings.customTime}
                      onChange={(e) => handleTimeSettingChange('customTime', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #666',
                        backgroundColor: '#555',
                        color: '#FFD329',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Timezone Settings */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#FFD329'
              }}>
                Timezone
              </label>
              <select
                value={timeSettings.timezone}
                onChange={(e) => handleTimeSettingChange('timezone', e.target.value)}
                disabled={timeSettings.autoDetectTimezone}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #666',
                  backgroundColor: timeSettings.autoDetectTimezone ? '#555' : '#444',
                  color: timeSettings.autoDetectTimezone ? '#999' : '#FFD329',
                  fontSize: '14px',
                  cursor: timeSettings.autoDetectTimezone ? 'not-allowed' : 'pointer'
                }}
              >
                {getCommonTimezones().map(tz => (
                  <option key={tz} value={tz}>
                    {getTimezoneDisplayName(tz)}
                  </option>
                ))}
              </select>

              <div style={{ marginTop: '10px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  <input
                    type="checkbox"
                    checked={timeSettings.autoDetectTimezone}
                    onChange={(e) => handleTimeSettingChange('autoDetectTimezone', e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: '#ccc' }}>Auto-detect timezone from system</span>
                </label>
              </div>

              <div style={{ marginTop: '8px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  <input
                    type="checkbox"
                    checked={timeSettings.enableDST}
                    onChange={(e) => handleTimeSettingChange('enableDST', e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: '#ccc' }}>Enable automatic daylight saving time adjustments</span>
                </label>
                {timeSettings.enableDST && timeZoneObservesDST(timeSettings.timezone) && (
                  <div style={{
                    fontSize: '12px',
                    color: '#4CAF50',
                    marginLeft: '26px',
                    marginTop: '4px'
                  }}>
                    ✓ This timezone observes daylight saving time
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'flex-start'
            }}>
              <button
                onClick={handleSaveTimeSettings}
                style={{
                  backgroundColor: '#FFD329',
                  color: 'black',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                💾 Save Time Settings
              </button>

              <button
                onClick={handleResetToSystemTime}
                style={{
                  backgroundColor: '#666',
                  color: '#FFD329',
                  padding: '12px 24px',
                  fontSize: '14px',
                  border: '1px solid #888',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                🔄 Reset to System Time
              </button>
            </div>
          </div>

          {/* Email Settings Section Header */}
          <div style={{
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '2px solid #666'
          }}>
            <h3 style={{
              fontSize: '24px',
              color: '#FFD329',
              margin: 0
            }}>
              📧 Email Settings
            </h3>
            <p style={{ color: '#ccc', margin: '8px 0 0 0', fontSize: '14px' }}>
              Configure Gmail SMTP to automatically send work order receipts to customers
            </p>
          </div>

          {/* Status Card */}
          <div style={{
            backgroundColor: '#333',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px',
            border: `2px solid ${emailStatus.configured ? '#4CAF50' : '#666'}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div style={{
                fontSize: '24px'
              }}>
                {emailStatus.configured ? '✅' : emailStatus.needsPassword ? '🔐' : '❌'}
              </div>
              <div>
                <h3 style={{ margin: 0, color: emailStatus.configured ? '#4CAF50' : emailStatus.needsPassword ? '#FF9800' : '#f44336' }}>
                  {emailStatus.configured ? 'Email Service Active' : 
                   emailStatus.needsPassword ? 'Email Service - Password Required' :
                   'Email Service Not Configured'}
                </h3>
                {emailStatus.configured && (
                  <p style={{ margin: '5px 0 0 0', color: '#ccc', fontSize: '14px' }}>
                    <strong>Shop:</strong> {emailStatus.shopName} | <strong>Email:</strong> {emailStatus.shopEmail}
                  </p>
                )}
                {emailStatus.needsPassword && (
                  <p style={{ margin: '5px 0 0 0', color: '#ccc', fontSize: '14px' }}>
                    <strong>Saved:</strong> {emailStatus.savedShopName} | <strong>Email:</strong> {emailStatus.savedEmail}
                    <br /><span style={{ color: '#FF9800' }}>Enter password below to activate</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div style={{
              backgroundColor: '#2d5a2d',
              color: '#90ee90',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #4CAF50'
            }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#5a2d2d',
              color: '#ff9999',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #f44336'
            }}>
              {error}
            </div>
          )}

          {/* Gmail Setup Instructions */}
          <div style={{
            backgroundColor: '#444',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <h3 style={{ marginTop: 0, color: '#FFD329' }}>📋 Gmail Setup Instructions</h3>
            <ol style={{ paddingLeft: '20px', color: '#ccc' }}>
              <li style={{ marginBottom: '10px' }}>
                <strong>Enable 2-Factor Authentication</strong> on your Gmail account
              </li>
              <li style={{ marginBottom: '10px' }}>
                Go to <strong>Google Account Settings → Security → App Passwords</strong>
              </li>
              <li style={{ marginBottom: '10px' }}>
                Create a new <strong>"App Password"</strong> for "Mail"
              </li>
              <li style={{ marginBottom: '10px' }}>
                Use your <strong>Gmail address</strong> and the <strong>App Password</strong> (not your regular password) below
              </li>
            </ol>
            <div style={{
              backgroundColor: '#333',
              padding: '15px',
              borderRadius: '5px',
              marginTop: '15px'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#FFD329' }}>
                💡 <strong>Why App Password?</strong> Gmail requires App Passwords for security when accessing from applications like this one.
              </p>
            </div>
          </div>

          {/* Configuration Form */}
          <div style={{
            backgroundColor: '#333',
            padding: '25px',
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#FFD329' }}>
              {emailStatus.configured ? '🔧 Update Email Configuration' : '⚙️ Configure Email Service'}
            </h3>
            
            <form onSubmit={handleConfigure}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Gmail Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={emailConfig.email}
                    onChange={handleConfigChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '5px',
                      border: '1px solid #666',
                      backgroundColor: '#444',
                      color: '#FFD329',
                      fontSize: '16px'
                    }}
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Shop Name
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    value={emailConfig.shopName}
                    onChange={handleConfigChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '5px',
                      border: '1px solid #666',
                      backgroundColor: '#444',
                      color: '#FFD329',
                      fontSize: '16px'
                    }}
                    placeholder="Your Shop Name"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Gmail App Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={emailConfig.password}
                    onChange={handleConfigChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      paddingRight: '50px',
                      borderRadius: '5px',
                      border: '1px solid #666',
                      backgroundColor: '#444',
                      color: '#FFD329',
                      fontSize: '16px'
                    }}
                    placeholder="Enter your Gmail App Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#FFD329',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <small style={{ color: '#ccc', fontSize: '12px' }}>
                  Use the App Password from Gmail, not your regular password
                </small>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="submit"
                  disabled={isConfiguring}
                  style={{
                    backgroundColor: isConfiguring ? '#666' : '#FFD329',
                    color: 'black',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isConfiguring ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isConfiguring ? 'Configuring...' : (emailStatus.configured ? 'Update Configuration' : 'Configure Email')}
                </button>
              </div>
            </form>
          </div>

          {/* Test Email Section */}
          {emailStatus.configured && (
            <div style={{
              backgroundColor: '#333',
              padding: '25px',
              borderRadius: '10px',
              marginBottom: '30px'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#FFD329' }}>
                🧪 Test Email Service
              </h3>
              
              <form onSubmit={handleTestEmail}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Send Test Email To:
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '5px',
                      border: '1px solid #666',
                      backgroundColor: '#444',
                      color: '#FFD329',
                      fontSize: '16px'
                    }}
                    placeholder="test@example.com"
                  />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <button
                    type="submit"
                    disabled={isTesting}
                    style={{
                      backgroundColor: isTesting ? '#666' : '#4CAF50',
                      color: 'white',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isTesting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isTesting ? 'Sending...' : '📧 Send Test Email'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Important Notes */}
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #555'
          }}>
            <h3 style={{ marginTop: 0, color: '#FFD329' }}>📝 Important Notes</h3>
            <ul style={{ paddingLeft: '20px', color: '#ccc' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>100% Free:</strong> Gmail SMTP allows up to 500 emails per day at no cost
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Security:</strong> Your App Password is stored temporarily in memory and not saved to disk
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Auto-Send:</strong> Once configured, receipts will be sent automatically when work orders are completed
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Customer Email Required:</strong> Make sure to collect customer email addresses during intake
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailSettings;