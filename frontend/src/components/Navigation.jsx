import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/PalmExitLogo.png';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', route: '/' },
    { label: 'Estimate', route: '/estimate' },
    { label: 'New Customer', route: '/customer/new' },
    { label: 'Existing Customer', route: '/customer/existing' },
    { label: 'Parts Inventory', route: '/inventory/edit' }
  ];

  const isActive = (route) => {
    return location.pathname === route;
  };

  return (
    <nav style={{
      backgroundColor: '#222',
      padding: '15px 30px',
      borderBottom: '3px solid #FFD329',
      display: 'flex',
      alignItems: 'center',
      gap: '30px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
    }}>
      {/* Logo */}
      <div 
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          marginRight: '20px'
        }}
      >
        <img 
          src={logo} 
          alt="Palm Exit Garage" 
          style={{ 
            height: '50px',
            width: 'auto',
            marginRight: '15px'
          }} 
          onError={(e) => {
            // Fallback if image doesn't load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#FFD329',
          fontFamily: 'Arial, sans-serif',
          display: 'none' // Hidden by default, shown if image fails
        }}>
          🏁 PalmExitGarage 🔧
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '5px',
        flex: 1
      }}>
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.route)}
            style={{
              backgroundColor: isActive(item.route) ? '#FFD329' : 'transparent',
              color: isActive(item.route) ? '#000' : '#FFD329',
              padding: '12px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: isActive(item.route) ? 'none' : '2px solid #FFD329',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={e => {
              if (!isActive(item.route)) {
                e.currentTarget.style.backgroundColor = '#FFD329';
                e.currentTarget.style.color = '#000';
              }
            }}
            onMouseOut={e => {
              if (!isActive(item.route)) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#FFD329';
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#ccc',
          fontStyle: 'italic'
        }}>
          Professional Auto Repair Services
        </div>
      </div>
    </nav>
  );
}

export default Navigation;