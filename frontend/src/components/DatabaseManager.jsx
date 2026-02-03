import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';

function DatabaseManager() {
  const navigate = useNavigate();
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [backups, setBackups] = useState([]);
  const [backupDirectory, setBackupDirectory] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoreFilename, setRestoreFilename] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [showRestoreSuccess, setShowRestoreSuccess] = useState(false);
  const [restoreStats, setRestoreStats] = useState(null);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    loadDatabases();
    loadBackups();
    loadBackupDirectory();
  }, []);

  const loadDatabases = async () => {
    try {
      const response = await fetch(`${API_BASE}/backup/databases`);
      const data = await response.json();
      if (response.ok) {
        setDatabases(data.databases);
        if (data.databases.length > 0) {
          setSelectedDatabase(data.databases[0]);
        }
      } else {
        showMessage('error', data.error || 'Failed to load databases');
      }
    } catch (error) {
      showMessage('error', 'Error connecting to server: ' + error.message);
    }
  };

  const loadBackups = async () => {
    try {
      const response = await fetch(`${API_BASE}/backup/list`);
      const data = await response.json();
      if (response.ok) {
        setBackups(data.backups);
        setBackupDirectory(data.backupDirectory);
      }
    } catch (error) {
      console.error('Error loading backups:', error);
    }
  };

  const loadBackupDirectory = async () => {
    try {
      const response = await fetch(`${API_BASE}/backup/directory`);
      const data = await response.json();
      if (response.ok) {
        setBackupDirectory(data.backupDirectory);
      }
    } catch (error) {
      console.error('Error loading backup directory:', error);
    }
  };

  const showMessage = (type, text, duration = 5000) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), duration);
  };

  const handleCreateBackup = async () => {
    if (!selectedDatabase) {
      showMessage('error', 'Please select a database');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/backup/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ database: selectedDatabase })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', `Backup created: ${data.filename}`);
        loadBackups(); // Refresh backup list
      } else {
        showMessage('error', data.error || 'Failed to create backup');
      }
    } catch (error) {
      showMessage('error', 'Error creating backup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (filename) => {
    if (!confirm(`Are you sure you want to delete backup: ${filename}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/backup/${filename}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Backup deleted successfully');
        loadBackups();
      } else {
        showMessage('error', data.error || 'Failed to delete backup');
      }
    } catch (error) {
      showMessage('error', 'Error deleting backup: ' + error.message);
    }
  };

  const initiateRestore = (filename) => {
    setRestoreFilename(filename);
    setConfirmationText('');
    setShowRestoreConfirm(true);
  };

  const handleRestore = async () => {
    if (confirmationText !== 'RESTORE') {
      showMessage('error', 'Please type RESTORE to confirm');
      return;
    }

    setLoading(true);
    setShowRestoreConfirm(false);

    try {
      const response = await fetch(`${API_BASE}/backup/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: restoreFilename,
          confirmationKey: 'RESTORE_DANGER_CONFIRMED'
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store statistics and show success modal
        setRestoreStats(data.statistics || {});
        setShowRestoreSuccess(true);
        
        // Also show message banner
        let successMsg = data.message;
        if (data.statistics) {
          successMsg += ` (${data.statistics.tablesCreated} tables, ${data.statistics.rowsInserted} rows)`;
        }
        showMessage('success', successMsg, 10000);
        
        // Reload the page data to reflect restored state
        loadBackups();
      } else {
        showMessage('error', data.error || 'Failed to restore backup');
      }
    } catch (error) {
      showMessage('error', 'Error restoring backup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div style={{ backgroundColor: 'black', minHeight: '100vh', color: '#FFD329' }}>
      <Navigation />
      
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#333',
              color: '#FFD329',
              padding: '10px 20px',
              fontSize: '16px',
              border: '2px solid #FFD329',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← Back to Home
          </button>
        </div>

        <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>💾 Database Backup & Restore</h1>
        <p style={{ color: '#ccc', marginBottom: '30px', fontSize: '16px' }}>
          Create backups of your databases for safe storage and recovery
        </p>

        {message.text && (
          <div style={{
            padding: '15px',
            marginBottom: '20px',
            backgroundColor: message.type === 'error' ? '#f44336' : '#4CAF50',
            color: 'white',
            borderRadius: '8px',
            fontSize: '16px'
          }}>
            {message.text}
          </div>
        )}

        {/* Backup Creation Section */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '2px solid #FFD329',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#FFD329' }}>
            📦 Create Backup
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '16px' }}>
              Select Database to Backup:
            </label>
            <select
              value={selectedDatabase}
              onChange={(e) => setSelectedDatabase(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                backgroundColor: '#333',
                color: '#FFD329',
                border: '2px solid #FFD329',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {databases.map(db => (
                <option key={db} value={db}>{db}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCreateBackup}
            disabled={loading || !selectedDatabase}
            style={{
              backgroundColor: loading ? '#666' : '#FFD329',
              color: '#000',
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          >
            {loading ? '⏳ Creating Backup...' : '💾 Create Backup'}
          </button>

          {backupDirectory && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <strong>📁 Backup Storage Location:</strong>
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#1a1a1a',
                borderRadius: '6px',
                fontFamily: 'monospace',
                color: '#4CAF50',
                wordBreak: 'break-all'
              }}>
                {backupDirectory}
              </div>
              <div style={{ marginTop: '10px', color: '#ccc', fontSize: '13px' }}>
                💡 After creating a backup, you can copy the .sql file from this location to any external storage (USB drive, cloud storage, etc.) for safe keeping.
              </div>
            </div>
          )}
        </div>

        {/* Available Backups Section */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '2px solid #FFD329',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#FFD329' }}>
            📋 Available Backups ({backups.length})
          </h2>

          {backups.length === 0 ? (
            <p style={{ color: '#ccc', fontSize: '16px', textAlign: 'center', padding: '20px' }}>
              No backups found. Create your first backup above.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #FFD329' }}>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#FFD329' }}>Database</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#FFD329' }}>Filename</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#FFD329' }}>Size</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#FFD329' }}>Created</th>
                    <th style={{ padding: '15px', textAlign: 'center', color: '#FFD329' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup, index) => (
                    <tr key={index} style={{
                      borderBottom: '1px solid #333',
                      backgroundColor: index % 2 === 0 ? '#1a1a1a' : '#222'
                    }}>
                      <td style={{ padding: '15px', color: '#FFD329', fontWeight: 'bold' }}>
                        {backup.database}
                      </td>
                      <td style={{ padding: '15px', color: '#ccc', fontFamily: 'monospace', fontSize: '13px' }}>
                        {backup.filename}
                      </td>
                      <td style={{ padding: '15px', color: '#ccc' }}>
                        {formatFileSize(backup.size)}
                      </td>
                      <td style={{ padding: '15px', color: '#ccc' }}>
                        {formatDate(backup.created)}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <button
                          onClick={() => initiateRestore(backup.filename)}
                          style={{
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            padding: '8px 15px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            marginRight: '10px'
                          }}
                        >
                          🔄 Restore
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.filename)}
                          style={{
                            backgroundColor: '#666',
                            color: 'white',
                            padding: '8px 15px',
                            fontSize: '14px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Danger Zone - Restore Confirmation Modal */}
        {showRestoreConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '4px solid #ff0000',
              borderRadius: '12px',
              padding: '40px',
              maxWidth: '600px',
              width: '90%'
            }}>
              <h2 style={{
                fontSize: '32px',
                marginBottom: '20px',
                color: '#ff0000',
                textAlign: 'center'
              }}>
                ⚠️ DANGER ZONE ⚠️
              </h2>

              <div style={{
                backgroundColor: '#2a0000',
                border: '2px solid #ff0000',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <p style={{ fontSize: '18px', marginBottom: '15px', color: '#ff6b6b', fontWeight: 'bold' }}>
                  WARNING: This action will RESTORE the database!
                </p>
                <ul style={{ color: '#ccc', fontSize: '16px', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li>This will REPLACE all current database data</li>
                  <li>Any data created after this backup will be LOST</li>
                  <li>This action CANNOT be undone</li>
                  <li>Make sure you have a recent backup before proceeding</li>
                </ul>
              </div>

              <div style={{
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <p style={{ fontSize: '14px', color: '#FFD329', marginBottom: '10px' }}>
                  <strong>Restoring:</strong> {restoreFilename}
                </p>
              </div>

              <div style={{
                backgroundColor: '#333',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '16px', color: '#ff6b6b', marginBottom: '15px', fontWeight: 'bold' }}>
                  🚨 If you don't know what you're doing, contact your administrator! 🚨
                </p>
                <p style={{ fontSize: '14px', color: '#ccc' }}>
                  Type <strong style={{ color: '#FFD329' }}>RESTORE</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Type RESTORE here"
                  style={{
                    marginTop: '10px',
                    padding: '12px',
                    fontSize: '16px',
                    width: '100%',
                    backgroundColor: '#1a1a1a',
                    color: '#FFD329',
                    border: '2px solid #ff0000',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={() => {
                    setShowRestoreConfirm(false);
                    setRestoreFilename('');
                    setConfirmationText('');
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#666',
                    color: 'white',
                    padding: '15px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  disabled={confirmationText !== 'RESTORE'}
                  style={{
                    flex: 1,
                    backgroundColor: confirmationText === 'RESTORE' ? '#ff0000' : '#444',
                    color: 'white',
                    padding: '15px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: confirmationText === 'RESTORE' ? 'pointer' : 'not-allowed'
                  }}
                >
                  ⚠️ RESTORE DATABASE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restore In Progress Modal */}
        {loading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}>
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '3px solid #FFD329',
              borderRadius: '16px',
              padding: '50px',
              maxWidth: '600px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(255, 211, 41, 0.3)'
            }}>
              {/* Animated Spinner */}
              <div style={{
                width: '80px',
                height: '80px',
                border: '8px solid #333',
                borderTop: '8px solid #FFD329',
                borderRadius: '50%',
                margin: '0 auto 30px',
                animation: 'spin 1s linear infinite'
              }} />
              
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                  @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                  }
                `}
              </style>

              <h2 style={{
                fontSize: '32px',
                marginBottom: '20px',
                color: '#FFD329',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                {restoreFilename ? '🔄 Restoring Database...' : '⏳ Processing...'}
              </h2>

              {restoreFilename && (
                <div style={{
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '25px'
                }}>
                  <p style={{ fontSize: '14px', color: '#999', marginBottom: '10px' }}>
                    Restoring from:
                  </p>
                  <p style={{ fontSize: '16px', color: '#FFD329', fontWeight: 'bold', wordBreak: 'break-all' }}>
                    {restoreFilename}
                  </p>
                </div>
              )}

              <div style={{
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '25px',
                marginBottom: '20px'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{
                    fontSize: '18px',
                    color: '#4CAF50',
                    marginBottom: '8px',
                    fontWeight: 'bold'
                  }}>
                    ✓ Dropping existing tables...
                  </div>
                  <div style={{
                    fontSize: '18px',
                    color: '#FFD329',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}>
                    ⟳ Recreating tables and data...
                  </div>
                  <div style={{
                    fontSize: '18px',
                    color: '#999',
                    fontWeight: 'bold'
                  }}>
                    ○ Finalizing restore...
                  </div>
                </div>
              </div>

              <div style={{
                fontSize: '16px',
                color: '#ccc',
                lineHeight: '1.6'
              }}>
                <p style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#ff6b6b' }}>⚠️ Do not close this window or refresh the page!</strong>
                </p>
                <p style={{ fontSize: '14px' }}>
                  This process may take a few moments depending on database size.
                </p>
                <p style={{ fontSize: '14px', marginTop: '10px' }}>
                  Progress details are being logged to the server console.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Restore Success Modal */}
        {showRestoreSuccess && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001
          }}>
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '3px solid #4CAF50',
              borderRadius: '16px',
              padding: '50px',
              maxWidth: '650px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(76, 175, 80, 0.4)'
            }}>
              {/* Success Icon */}
              <div style={{
                width: '100px',
                height: '100px',
                backgroundColor: '#4CAF50',
                borderRadius: '50%',
                margin: '0 auto 30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '60px'
              }}>
                ✓
              </div>

              <h2 style={{
                fontSize: '36px',
                marginBottom: '20px',
                color: '#4CAF50'
              }}>
                ✅ Database Restored Successfully!
              </h2>

              <div style={{
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '25px',
                marginBottom: '25px'
              }}>
                <p style={{ fontSize: '16px', color: '#ccc', marginBottom: '20px' }}>
                  Your database has been completely restored from the backup.
                </p>
                
                {restoreStats && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '20px',
                    marginTop: '20px'
                  }}>
                    <div style={{
                      backgroundColor: '#333',
                      borderRadius: '8px',
                      padding: '15px'
                    }}>
                      <div style={{ fontSize: '32px', color: '#FFD329', fontWeight: 'bold', marginBottom: '5px' }}>
                        {restoreStats.tablesCreated || 0}
                      </div>
                      <div style={{ fontSize: '14px', color: '#999' }}>
                        Tables Created
                      </div>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#333',
                      borderRadius: '8px',
                      padding: '15px'
                    }}>
                      <div style={{ fontSize: '32px', color: '#4CAF50', fontWeight: 'bold', marginBottom: '5px' }}>
                        {restoreStats.rowsInserted || 0}
                      </div>
                      <div style={{ fontSize: '14px', color: '#999' }}>
                        Rows Inserted
                      </div>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#333',
                      borderRadius: '8px',
                      padding: '15px'
                    }}>
                      <div style={{ fontSize: '32px', color: '#2196F3', fontWeight: 'bold', marginBottom: '5px' }}>
                        {restoreStats.statementsExecuted || 0}
                      </div>
                      <div style={{ fontSize: '14px', color: '#999' }}>
                        Statements Executed
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                backgroundColor: '#2a4a2a',
                border: '1px solid #4CAF50',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '25px'
              }}>
                <div style={{ fontSize: '16px', color: '#ccc', lineHeight: '1.6' }}>
                  <p style={{ marginBottom: '10px' }}>
                    <strong style={{ color: '#4CAF50' }}>✓ All existing data has been replaced</strong>
                  </p>
                  <p style={{ marginBottom: '10px' }}>
                    <strong style={{ color: '#4CAF50' }}>✓ Database structure recreated</strong>
                  </p>
                  <p>
                    <strong style={{ color: '#4CAF50' }}>✓ All backup data has been restored</strong>
                  </p>
                </div>
              </div>

              <div style={{
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '25px'
              }}>
                <p style={{ fontSize: '14px', color: '#FFD329', marginBottom: '5px' }}>
                  💾 Restored from:
                </p>
                <p style={{ fontSize: '14px', color: '#ccc', wordBreak: 'break-all' }}>
                  {restoreFilename}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowRestoreSuccess(false);
                  setRestoreFilename('');
                  setConfirmationText('');
                  setRestoreStats(null);
                }}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '15px 40px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                ✓ Done
              </button>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '2px solid #4CAF50',
          borderRadius: '12px',
          padding: '30px'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#4CAF50' }}>
            ℹ️ Important Information
          </h2>
          
          <div style={{ fontSize: '16px', color: '#ccc', lineHeight: '1.8' }}>
            <h3 style={{ color: '#FFD329', marginBottom: '10px' }}>Backup Files:</h3>
            <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
              <li>Backup files are stored in: <code style={{ color: '#4CAF50', backgroundColor: '#2a2a2a', padding: '2px 6px', borderRadius: '4px' }}>{backupDirectory}</code></li>
              <li>Files are named: <code style={{ color: '#4CAF50' }}>databasename_backup_timestamp.sql</code></li>
              <li>You can manually copy these files to external storage for safekeeping</li>
            </ul>

            <h3 style={{ color: '#FFD329', marginBottom: '10px' }}>Restore Files:</h3>
            <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
              <li>To restore from an external backup, copy the .sql file back to the backup directory</li>
              <li>The file must follow the naming format: <code style={{ color: '#4CAF50' }}>databasename_backup_timestamp.sql</code></li>
              <li>Refresh this page to see newly added backup files</li>
            </ul>

            <h3 style={{ color: '#FFD329', marginBottom: '10px' }}>⚠️ Safety Tips:</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Always</strong> create a backup before restoring</li>
              <li>Store important backups on external drives or cloud storage</li>
              <li>Test your backups regularly to ensure they work</li>
              <li>Keep multiple backup versions (daily, weekly, monthly)</li>
              <li>Contact your administrator if you're unsure about any operation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatabaseManager;
