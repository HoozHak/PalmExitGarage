import React, { useState, useEffect } from 'react';
import Navigation from './Navigation.jsx';

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

  useEffect(() => {
    loadEmailStatus();
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
              📧 Email Settings
            </h2>
            <p style={{ color: '#ccc', margin: 0 }}>
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