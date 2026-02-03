import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import logo from './assets/PalmExitLogo.png';
import Estimate from './pages/Estimate.jsx';
import AddCustomer from './components/AddCustomer.jsx';
import AddVehicle from './components/AddVehicle.jsx';
import ExistingCustomer from './components/ExistingCustomer.jsx';
import InventoryManagerEnhanced from './components/InventoryManagerEnhanced.jsx';
import WorkOrderManagement from './pages/WorkOrderManagement.jsx';
import EmailSettings from './components/EmailSettings.jsx';
import Reports from './components/Reports.jsx';
import DatabaseManager from './components/DatabaseManager.jsx';

function Home(){
  const navigate = useNavigate();

  const buttons = [
    { label: 'Estimate', route: '/estimate' },
    { label: 'New Customer', route: '/customer/new' },
    { label: 'Existing Customer', route: '/customer/existing' },
    { label: 'Work Orders', route: '/work-orders' },
    { label: 'Edit Inventory', route: '/inventory/edit' },
    { label: '📊 Create Report', route: '/reports' },
    { label: '💾 Database Backup', route: '/database' },
    { label: 'Settings', route: '/settings' },
  ];

  return (
    <div style={{
      backgroundColor: 'black',
      minHeight: '100vh',
      color: '#FFD329',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px'
    }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <img 
          src={logo} 
          alt="Palm Exit Garage" 
          style={{ 
            maxWidth: '320px', 
            maxHeight: '320px',
            width: 'auto',
            height: 'auto',
            marginBottom: '20px'
          }} 
          onError={(e) => {
            // Fallback to text if image doesn't load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          textAlign: 'center',
          color: '#FFD329',
          fontFamily: 'Arial, sans-serif',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          display: 'none' // Hidden by default, shown if image fails
        }}>
          🏁 PalmExitGarage 🔧
        </div>
        <div style={{ 
          fontSize: '18px', 
          textAlign: 'center',
          marginTop: '10px',
          opacity: 0.8,
          color: '#FFD329'
        }}>
          Professional Auto Repair Services
        </div>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '400px' }}>
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={() => navigate(btn.route)}
            style={{
              backgroundColor: '#333',
              color: '#FFD329',
              padding: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#444'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#333'}
          >
            {btn.label}
          </button>
        ))}
      </main>
    </div>
  );
}

// Additional route for adding vehicles from customer details
function AddVehicleForCustomer() {
  return <AddVehicle />;
}

function Page({ title }){
  return (
    <div style={{
      backgroundColor:'black',
      minHeight:'100vh',
      color:'#FFD329',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      fontSize:'28px'
    }}>{title}</div>
  );
}

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/estimate" element={<Estimate />} />
      <Route path="/customer/new" element={<AddCustomer />} />
      <Route path="/customer/existing" element={<ExistingCustomer />} />
      <Route path="/customer/add-vehicle" element={<AddVehicleForCustomer />} />
      <Route path="/work-orders" element={<WorkOrderManagement />} />
      <Route path="/inventory/edit" element={<InventoryManagerEnhanced />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/database" element={<DatabaseManager />} />
      <Route path="/settings" element={<EmailSettings />} />
    </Routes>
  );
}
