import React, { useState } from 'react';
import Navigation from './Navigation.jsx';
import PartsManager from './PartsManager.jsx';
import LaborManager from './LaborManager.jsx';
import VehicleReferenceManager from './VehicleReferenceManager.jsx';

function InventoryManager() {
  const [activeTab, setActiveTab] = useState('parts');

  const tabs = [
    { id: 'parts', label: '🔧 Parts', icon: '🔧' },
    { id: 'labor', label: '⚒️ Labor', icon: '⚒️' },
    { id: 'vehicles', label: '🚗 Vehicle Reference', icon: '🚗' }
  ];

  const getTabComponent = () => {
    switch (activeTab) {
      case 'parts':
        return <PartsManager />;
      case 'labor':
        return <LaborManager />;
      case 'vehicles':
        return <VehicleReferenceManager />;
      default:
        return <PartsManager />;
    }
  };

  return (
    <div style={{
      backgroundColor: 'black',
      minHeight: '100vh',
      color: '#FFD329'
    }}>
      <Navigation />
      <div style={{
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <h2 style={{
              fontSize: '28px',
              color: '#FFD329',
              margin: 0
            }}>
              📦 Inventory Management
            </h2>
          </div>

          {/* Tab Navigation */}
          <div style={{
            backgroundColor: '#333',
            borderRadius: '10px 10px 0 0',
            padding: '0',
            marginBottom: '0'
          }}>
            <div style={{
              display: 'flex',
              gap: '0'
            }}>
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    backgroundColor: activeTab === tab.id ? '#FFD329' : '#444',
                    color: activeTab === tab.id ? 'black' : '#FFD329',
                    padding: '15px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: index === 0 
                      ? '10px 0 0 0' 
                      : index === tabs.length - 1 
                        ? '0 10px 0 0'
                        : '0',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    borderRight: index < tabs.length - 1 ? '1px solid #555' : 'none',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={e => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = '#555';
                    }
                  }}
                  onMouseOut={e => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = '#444';
                    }
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{tab.icon}</span>
                  {tab.label.replace(/^\w+\s/, '')}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{
            backgroundColor: '#333',
            borderRadius: '0 0 10px 10px',
            padding: '0',
            minHeight: '600px'
          }}>
            {getTabComponent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryManager;