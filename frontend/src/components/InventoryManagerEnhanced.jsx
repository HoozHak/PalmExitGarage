import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation.jsx';

const API_BASE = 'http://localhost:5000/api';

function InventoryManagerEnhanced() {
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('parts'); // 'parts', 'labor', or 'database'
  
  // Database management state
  const [selectedDatabases, setSelectedDatabases] = useState({
    customers: false,
    vehicles: false,
    parts: false,
    labor: false,
    workOrders: false,
    taxSettings: false
  });
  const [isDeletingDatabases, setIsDeletingDatabases] = useState(false);
  const [databaseCounts, setDatabaseCounts] = useState({
    customers: 0,
    vehicles: 0,
    parts: 0,
    labor: 0,
    workOrders: 0,
    taxSettings: 0
  });
  
  // Parts state
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [partsSearchTerm, setPartsSearchTerm] = useState('');
  const [showAddPartForm, setShowAddPartForm] = useState(false);
  const [newPart, setNewPart] = useState({
    brand: '',
    item: '',
    part_number: '',
    cost_paid_cents: '',
    cost_charged_cents: '',
    category: '',
    description: '',
    quantity_on_hand: ''
  });
  const [editingPart, setEditingPart] = useState(null);
  const [editedPart, setEditedPart] = useState({
    brand: '',
    item: '',
    part_number: '',
    cost_paid_cents: '',
    cost_charged_cents: '',
    category: '',
    description: '',
    quantity_on_hand: ''
  });

  // Labor state
  const [labor, setLabor] = useState([]);
  const [filteredLabor, setFilteredLabor] = useState([]);
  const [laborSearchTerm, setLaborSearchTerm] = useState('');
  const [showAddLaborForm, setShowAddLaborForm] = useState(false);
  const [newLabor, setNewLabor] = useState({
    labor_name: '',
    labor_cost_cents: '',
    category: '',
    description: '',
    estimated_time_hours: ''
  });
  const [editingLabor, setEditingLabor] = useState(null);
  const [editedLabor, setEditedLabor] = useState({
    labor_name: '',
    labor_cost_cents: '',
    category: '',
    description: '',
    estimated_time_hours: ''
  });

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadParts();
    loadLabor();
    loadDatabaseCounts();
  }, []);
  
  // Reload database counts when active tab changes to database
  useEffect(() => {
    if (activeTab === 'database') {
      loadDatabaseCounts();
    }
  }, [activeTab]);

  // Filter parts based on search term
  useEffect(() => {
    if (partsSearchTerm.length >= 2) {
      const filtered = parts.filter(part =>
        part.brand.toLowerCase().includes(partsSearchTerm.toLowerCase()) ||
        part.item.toLowerCase().includes(partsSearchTerm.toLowerCase()) ||
        part.part_number.toLowerCase().includes(partsSearchTerm.toLowerCase()) ||
        part.category.toLowerCase().includes(partsSearchTerm.toLowerCase())
      );
      setFilteredParts(filtered);
    } else {
      setFilteredParts(parts);
    }
  }, [partsSearchTerm, parts]);

  // Filter labor based on search term
  useEffect(() => {
    if (laborSearchTerm.length >= 2) {
      const filtered = labor.filter(laborItem =>
        laborItem.labor_name.toLowerCase().includes(laborSearchTerm.toLowerCase()) ||
        laborItem.category.toLowerCase().includes(laborSearchTerm.toLowerCase()) ||
        laborItem.description.toLowerCase().includes(laborSearchTerm.toLowerCase())
      );
      setFilteredLabor(filtered);
    } else {
      setFilteredLabor(labor);
    }
  }, [laborSearchTerm, labor]);

  // === PARTS FUNCTIONS ===
  const loadParts = async () => {
    try {
      const response = await fetch(`${API_BASE}/parts`);
      if (response.ok) {
        const data = await response.json();
        setParts(data);
        setFilteredParts(data);
      }
    } catch (error) {
      console.error('Error loading parts:', error);
    }
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/parts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPart,
          cost_paid_cents: Math.round(parseFloat(newPart.cost_paid_cents || '0') * 100),
          cost_charged_cents: Math.round(parseFloat(newPart.cost_charged_cents || '0') * 100),
          quantity_on_hand: parseInt(newPart.quantity_on_hand || '0')
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Part added successfully! Part ID: ${result.part_id}`);
        setShowAddPartForm(false);
        setNewPart({
          brand: '',
          item: '',
          part_number: '',
          cost_paid_cents: '',
          cost_charged_cents: '',
          category: '',
          description: '',
          quantity_on_hand: ''
        });
        loadParts();
      } else {
        const error = await response.json();
        alert('Error adding part: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: Could not connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPart = (part) => {
    setEditingPart(part.part_id);
    setEditedPart({
      brand: part.brand,
      item: part.item,
      part_number: part.part_number || '',
      cost_paid_cents: ((part.cost_paid_cents || part.cost_cents || 0) / 100).toString(),
      cost_charged_cents: ((part.cost_charged_cents || part.cost_cents || 0) / 100).toString(),
      category: part.category || '',
      description: part.description || '',
      quantity_on_hand: (part.quantity_on_hand || 0).toString()
    });
  };

  const handleUpdatePart = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetch(`${API_BASE}/parts/${editingPart}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedPart,
          cost_paid_cents: Math.round(parseFloat(editedPart.cost_paid_cents || '0') * 100),
          cost_charged_cents: Math.round(parseFloat(editedPart.cost_charged_cents || '0') * 100),
          quantity_on_hand: parseInt(editedPart.quantity_on_hand || '0')
        }),
      });

      if (response.ok) {
        alert('Part updated successfully!');
        setEditingPart(null);
        loadParts();
      } else {
        const error = await response.json();
        alert('Error updating part: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: Could not connect to server');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePart = async () => {
    if (!confirm('Are you sure you want to delete this part? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`${API_BASE}/parts/${editingPart}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Part deleted successfully!');
        setEditingPart(null);
        loadParts();
      } else {
        const error = await response.json();
        alert('Error deleting part: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: Could not connect to server');
    } finally {
      setIsDeleting(false);
    }
  };

  // === LABOR FUNCTIONS ===
  const loadLabor = async () => {
    try {
      const response = await fetch(`${API_BASE}/labor`);
      if (response.ok) {
        const data = await response.json();
        setLabor(data);
        setFilteredLabor(data);
      }
    } catch (error) {
      console.error('Error loading labor:', error);
    }
  };

  const handleAddLabor = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/labor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newLabor,
          labor_cost_cents: Math.round(parseFloat(newLabor.labor_cost_cents || '0') * 100),
          estimated_time_hours: parseFloat(newLabor.estimated_time_hours || '0')
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Labor item added successfully! Labor ID: ${result.labor_id}`);
        setShowAddLaborForm(false);
        setNewLabor({
          labor_name: '',
          labor_cost_cents: '',
          category: '',
          description: '',
          estimated_time_hours: ''
        });
        loadLabor();
      } else {
        const error = await response.json();
        alert('Error adding labor item: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: Could not connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLabor = (laborItem) => {
    console.log('Editing labor item:', laborItem); // Debug log
    console.log('Setting editingLabor to:', laborItem.labor_id); // Additional debug
    
    setEditingLabor(laborItem.labor_id);
    setEditedLabor({
      labor_name: laborItem.labor_name || '',
      labor_cost_cents: ((laborItem.labor_cost_cents || 0) / 100).toString(),
      category: laborItem.category || '',
      description: laborItem.description || '',
      estimated_time_hours: (laborItem.estimated_time_hours || 0).toString()
    });
    console.log('Updated editedLabor state:', {
      labor_name: laborItem.labor_name || '',
      labor_cost_cents: ((laborItem.labor_cost_cents || 0) / 100).toString(),
      category: laborItem.category || '',
      description: laborItem.description || '',
      estimated_time_hours: (laborItem.estimated_time_hours || 0).toString()
    }); // Debug the state being set
  };

  const handleUpdateLabor = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetch(`${API_BASE}/labor/${editingLabor}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedLabor,
          labor_cost_cents: Math.round(parseFloat(editedLabor.labor_cost_cents || '0') * 100),
          estimated_time_hours: parseFloat(editedLabor.estimated_time_hours || '0')
        }),
      });

      if (response.ok) {
        alert('Labor item updated successfully!');
        setEditingLabor(null);
        loadLabor();
      } else {
        const error = await response.json();
        alert('Error updating labor item: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: Could not connect to server');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteLabor = async () => {
    if (!confirm('Are you sure you want to delete this labor item? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`${API_BASE}/labor/${editingLabor}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Labor item deleted successfully!');
        setEditingLabor(null);
        loadLabor();
      } else {
        const error = await response.json();
        alert('Error deleting labor item: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: Could not connect to server');
    } finally {
      setIsDeleting(false);
    }
  };

  // === UTILITY FUNCTIONS ===
  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const handlePartChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPart(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePartEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedPart(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLaborChange = (e) => {
    const { name, value } = e.target;
    setNewLabor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLaborEditChange = (e) => {
    const { name, value } = e.target;
    setEditedLabor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelEdit = () => {
    setEditingPart(null);
    setEditingLabor(null);
    setEditedPart({
      brand: '',
      item: '',
      part_number: '',
      cost_paid_cents: '',
      cost_charged_cents: '',
      category: '',
      description: '',
      quantity_on_hand: ''
    });
    setEditedLabor({
      labor_name: '',
      labor_cost_cents: '',
      category: '',
      description: '',
      estimated_time_hours: ''
    });
  };

  const partCategories = [
    "Engine", "Transmission", "Brakes", "Suspension", "Electrical", "Exhaust", 
    "Cooling", "Fuel System", "Body", "Interior", "Filters", "Fluids", "Tools", "Other"
  ];

  const laborCategories = [
    "Diagnostics", "Engine Repair", "Transmission", "Brakes", "Suspension", 
    "Electrical", "AC/Heating", "Exhaust", "Oil Change", "Tune-Up", "Inspection", "Other"
  ];

  // === DATABASE MANAGEMENT FUNCTIONS ===
  const loadDatabaseCounts = async () => {
    try {
      const response = await fetch(`${API_BASE}/database/counts`);
      if (response.ok) {
        const counts = await response.json();
        setDatabaseCounts(counts);
      }
    } catch (error) {
      console.error('Error loading database counts:', error);
    }
  };

  const handleDatabaseSelection = (database, checked) => {
    setSelectedDatabases(prev => ({
      ...prev,
      [database]: checked
    }));
  };

  const handleDeleteDatabases = async () => {
    const selectedTables = Object.keys(selectedDatabases).filter(key => selectedDatabases[key]);
    
    if (selectedTables.length === 0) {
      alert('Please select at least one database to delete.');
      return;
    }

    // First confirmation dialog
    const tableNames = selectedTables.map(table => {
      const tableMap = {
        customers: 'Customers',
        vehicles: 'Vehicles', 
        parts: 'Parts Inventory',
        labor: 'Labor & Pricing',
        workOrders: 'Work Orders',
        taxSettings: 'Tax Settings'
      };
      return tableMap[table];
    }).join(', ');

    const firstConfirm = confirm(
      `⚠️ CRITICAL WARNING ⚠️\n\n` +
      `You are about to PERMANENTLY DELETE the following databases:\n\n` +
      `${tableNames}\n\n` +
      `This action will:\n` +
      `• Remove ALL data from selected databases\n` +
      `• Cannot be undone\n` +
      `• May affect related data due to database relationships\n\n` +
      `Are you absolutely sure you want to continue?\n\n` +
      `Click OK to proceed to final confirmation, or Cancel to abort.`
    );

    if (!firstConfirm) {
      return;
    }

    // Second confirmation with typing requirement
    const secondConfirm = prompt(
      `🚨 FINAL CONFIRMATION REQUIRED 🚨\n\n` +
      `You are about to permanently delete:\n${tableNames}\n\n` +
      `This will remove:\n` +
      selectedTables.map(table => {
        const count = databaseCounts[table] || 0;
        const desc = {
          customers: `${count} customer records`,
          vehicles: `${count} vehicle records`,
          parts: `${count} parts from inventory`,
          labor: `${count} labor items`,
          workOrders: `${count} work orders with all history`,
          taxSettings: `Tax configuration settings`
        };
        return `• ${desc[table]}`;
      }).join('\n') + '\n\n' +
      `⚠️ THIS CANNOT BE UNDONE! ⚠️\n\n` +
      `To confirm this permanent deletion, type:\n` +
      `DELETE_CONFIRMED\n\n` +
      `Type exactly as shown (case-sensitive):`
    );

    if (secondConfirm !== 'DELETE_CONFIRMED') {
      alert('Database deletion cancelled. You must type "DELETE_CONFIRMED" exactly to proceed.');
      return;
    }

    // Proceed with deletion
    setIsDeletingDatabases(true);
    
    try {
      const response = await fetch(`${API_BASE}/database/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tables: selectedTables,
          confirmationKey: 'DELETE_CONFIRMED_TWICE'
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          `Database deletion completed successfully!\n\n` +
          `Results:\n` +
          Object.entries(result.results).map(([table, data]) => 
            `• ${data.description}: ${data.rowsDeleted} records deleted`
          ).join('\n')
        );
        
        // Clear selections and reload counts
        setSelectedDatabases({
          customers: false,
          vehicles: false,
          parts: false,
          labor: false,
          workOrders: false,
          taxSettings: false
        });
        
        // Reload all data
        loadDatabaseCounts();
        loadParts();
        loadLabor();
        
      } else {
        const error = await response.json();
        alert(`Database deletion failed:\n${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting databases:', error);
      alert('Network error: Could not delete databases');
    } finally {
      setIsDeletingDatabases(false);
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
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
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
              Inventory Management
            </h2>
          </div>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            marginBottom: '30px',
            backgroundColor: '#333',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => setActiveTab('parts')}
              style={{
                flex: 1,
                backgroundColor: activeTab === 'parts' ? '#FFD329' : '#444',
                color: activeTab === 'parts' ? 'black' : '#FFD329',
                padding: '15px 20px',
                fontSize: '18px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Parts Inventory ({parts.length})
            </button>
            <button
              onClick={() => setActiveTab('labor')}
              style={{
                flex: 1,
                backgroundColor: activeTab === 'labor' ? '#FFD329' : '#444',
                color: activeTab === 'labor' ? 'black' : '#FFD329',
                padding: '15px 20px',
                fontSize: '18px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Labor & Pricing ({labor.length})
            </button>
            <button
              onClick={() => setActiveTab('database')}
              style={{
                flex: 1,
                backgroundColor: activeTab === 'database' ? '#FFD329' : '#444',
                color: activeTab === 'database' ? 'black' : '#FFD329',
                padding: '15px 20px',
                fontSize: '18px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              🗑️ Database Management
            </button>
          </div>

          {/* Parts Tab Content */}
          {activeTab === 'parts' && (
            <div>
              {/* Add Part Button */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  onClick={() => setShowAddPartForm(!showAddPartForm)}
                  style={{
                    backgroundColor: showAddPartForm ? '#666' : '#FFD329',
                    color: showAddPartForm ? '#FFD329' : 'black',
                    padding: '10px 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: showAddPartForm ? '1px solid #888' : 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {showAddPartForm ? 'Cancel' : 'Add New Part'}
                </button>
              </div>

              {/* Add Part Form */}
              {showAddPartForm && (
                <div style={{
                  backgroundColor: '#333',
                  padding: '25px',
                  borderRadius: '10px',
                  marginBottom: '30px'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#FFD329' }}>Add New Part</h3>
                  
                  <form onSubmit={handleAddPart}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Brand *
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={newPart.brand}
                          onChange={handlePartChange}
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
                          placeholder="Part brand/manufacturer"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Part Name *
                        </label>
                        <input
                          type="text"
                          name="item"
                          value={newPart.item}
                          onChange={handlePartChange}
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
                          placeholder="Part name/description"
                        />
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Part Number
                        </label>
                        <input
                          type="text"
                          name="part_number"
                          value={newPart.part_number}
                          onChange={handlePartChange}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '1px solid #666',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                          placeholder="Manufacturer part number"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Category
                        </label>
                        <select
                          name="category"
                          value={newPart.category}
                          onChange={handlePartChange}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '1px solid #666',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                        >
                          <option value="">Select Category</option>
                          {partCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#FF9800' }}>
                          💰 Wholesale Cost (You Pay) *
                        </label>
                        <input
                          type="number"
                          name="cost_paid_cents"
                          value={newPart.cost_paid_cents}
                          onChange={handlePartChange}
                          required
                          min="0"
                          step="0.01"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '2px solid #FF9800',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4CAF50' }}>
                          💵 Retail Cost (Customer Pays) *
                        </label>
                        <input
                          type="number"
                          name="cost_charged_cents"
                          value={newPart.cost_charged_cents}
                          onChange={handlePartChange}
                          required
                          min="0"
                          step="0.01"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '2px solid #4CAF50',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#FFD329' }}>
                          💰 Profit Per Unit
                        </label>
                        <div style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '5px',
                          border: '2px solid #FFD329',
                          backgroundColor: '#222',
                          color: '#FFD329',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}>
                          {formatCurrency(Math.round((parseFloat(newPart.cost_charged_cents || '0') - parseFloat(newPart.cost_paid_cents || '0')) * 100))}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          📦 Quantity in Stock
                        </label>
                        <input
                          type="number"
                          name="quantity_on_hand"
                          value={newPart.quantity_on_hand}
                          onChange={handlePartChange}
                          min="0"
                          step="1"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '1px solid #666',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={newPart.description}
                        onChange={handlePartChange}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '5px',
                          border: '1px solid #666',
                          backgroundColor: '#444',
                          color: '#FFD329',
                          fontSize: '16px',
                          resize: 'vertical'
                        }}
                        placeholder="Additional part description or notes..."
                      />
                    </div>


                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          backgroundColor: isSubmitting ? '#666' : '#FFD329',
                          color: 'black',
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isSubmitting ? 'Adding Part...' : 'Add Part'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Edit Part Form */}
              {editingPart && (
                <div style={{
                  backgroundColor: '#2c3e50',
                  padding: '25px',
                  borderRadius: '10px',
                  marginBottom: '30px',
                  border: '2px solid #FFD329'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#FFD329' }}>
                    Edit Part (ID: {editingPart})
                  </h3>
                  
                  <form onSubmit={handleUpdatePart}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Brand *
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={editedPart.brand}
                          onChange={handlePartEditChange}
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
                          placeholder="Part brand/manufacturer"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Part Name *
                        </label>
                        <input
                          type="text"
                          name="item"
                          value={editedPart.item}
                          onChange={handlePartEditChange}
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
                          placeholder="Part name/description"
                        />
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Part Number
                        </label>
                        <input
                          type="text"
                          name="part_number"
                          value={editedPart.part_number}
                          onChange={handlePartEditChange}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '1px solid #666',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                          placeholder="Manufacturer part number"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Category
                        </label>
                        <select
                          name="category"
                          value={editedPart.category}
                          onChange={handlePartEditChange}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '1px solid #666',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                        >
                          <option value="">Select Category</option>
                          {partCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#FF9800' }}>
                          💰 Wholesale Cost (You Pay) *
                        </label>
                        <input
                          type="number"
                          name="cost_paid_cents"
                          value={editedPart.cost_paid_cents}
                          onChange={handlePartEditChange}
                          required
                          min="0"
                          step="0.01"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '2px solid #FF9800',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4CAF50' }}>
                          💵 Retail Cost (Customer Pays) *
                        </label>
                        <input
                          type="number"
                          name="cost_charged_cents"
                          value={editedPart.cost_charged_cents}
                          onChange={handlePartEditChange}
                          required
                          min="0"
                          step="0.01"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '2px solid #4CAF50',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#FFD329' }}>
                          💰 Profit Per Unit
                        </label>
                        <div style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '5px',
                          border: '2px solid #FFD329',
                          backgroundColor: '#222',
                          color: '#FFD329',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}>
                          {formatCurrency(Math.round((parseFloat(editedPart.cost_charged_cents || '0') - parseFloat(editedPart.cost_paid_cents || '0')) * 100))}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          📦 Quantity in Stock
                        </label>
                        <input
                          type="number"
                          name="quantity_on_hand"
                          value={editedPart.quantity_on_hand}
                          onChange={handlePartEditChange}
                          min="0"
                          step="1"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '1px solid #666',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editedPart.description}
                        onChange={handlePartEditChange}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '5px',
                          border: '1px solid #666',
                          backgroundColor: '#444',
                          color: '#FFD329',
                          fontSize: '16px',
                          resize: 'vertical'
                        }}
                        placeholder="Additional part description or notes..."
                      />
                    </div>


                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        style={{
                          backgroundColor: isUpdating ? '#666' : '#4CAF50',
                          color: 'white',
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: isUpdating ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isUpdating ? 'Updating...' : 'Update Part'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleDeletePart}
                        disabled={isDeleting}
                        style={{
                          backgroundColor: isDeleting ? '#666' : '#f44336',
                          color: 'white',
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: isDeleting ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete Part'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={{
                          backgroundColor: '#666',
                          color: '#FFD329',
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          border: '1px solid #888',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Parts Search Bar */}
              <div style={{
                backgroundColor: '#333',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '30px'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Search Parts</h3>
                <input
                  type="text"
                  value={partsSearchTerm}
                  onChange={(e) => setPartsSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '5px',
                    border: '1px solid #666',
                    backgroundColor: '#444',
                    color: '#FFD329',
                    fontSize: '16px'
                  }}
                  placeholder="Search by brand, part name, part number, or category..."
                />
              </div>

              {/* Parts List */}
              <div style={{
                backgroundColor: '#333',
                padding: '25px',
                borderRadius: '10px'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#FFD329' }}>
                  Parts Inventory ({filteredParts.length} {filteredParts.length === 1 ? 'part' : 'parts'})
                </h3>
                
                {filteredParts.length === 0 ? (
                  <p style={{ color: '#ccc', fontStyle: 'italic', textAlign: 'center', padding: '40px' }}>
                    {partsSearchTerm ? 'No parts found matching your search.' : 'No parts in inventory.'}
                  </p>
                ) : (
                  <div>
                    {/* Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 80px',
                      gap: '15px',
                      padding: '15px',
                      backgroundColor: '#444',
                      borderRadius: '5px',
                      marginBottom: '15px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: '#FFD329'
                    }}>
                      <div>PART DETAILS</div>
                      <div>PART NUMBER</div>
                      <div>CATEGORY</div>
                      <div>WHOLESALE</div>
                      <div>RETAIL</div>
                      <div>PROFIT</div>
                      <div>STOCK</div>
                      <div>ACTIONS</div>
                    </div>

                    {/* Parts List */}
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {filteredParts.map(part => (
                        <div
                          key={part.part_id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 80px',
                            gap: '15px',
                            padding: '15px',
                            backgroundColor: '#444',
                            borderRadius: '5px',
                            border: '1px solid #666',
                            alignItems: 'center',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#555'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = '#444'}
                        >
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                              {part.brand} - {part.item}
                            </div>
                            <div style={{ color: '#ccc', fontSize: '14px' }}>
                              Part ID: {part.part_id}
                            </div>
                            {part.description && (
                              <div style={{ color: '#ccc', fontSize: '12px', marginTop: '4px' }}>
                                {part.description.length > 60 
                                  ? `${part.description.substring(0, 60)}...` 
                                  : part.description}
                              </div>
                            )}
                          </div>
                          <div style={{ color: '#ccc', fontSize: '14px' }}>
                            {part.part_number || 'N/A'}
                          </div>
                          <div style={{ color: '#ccc' }}>
                            {part.category || 'Uncategorized'}
                          </div>
                          <div style={{ fontWeight: 'bold', color: '#FF9800' }}>
                            {formatCurrency(part.cost_paid_cents || part.cost_cents || 0)}
                          </div>
                          <div style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                            {formatCurrency(part.cost_charged_cents || part.cost_cents || 0)}
                          </div>
                          <div style={{ fontWeight: 'bold', color: '#FFD329' }}>
                            {formatCurrency((part.cost_charged_cents || part.cost_cents || 0) - (part.cost_paid_cents || part.cost_cents || 0))}
                          </div>
                          <div>
                            <span style={{
                              backgroundColor: (part.quantity_on_hand > 0) ? '#4CAF50' : '#f44336',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {part.quantity_on_hand || 0} in stock
                            </span>
                          </div>
                          <div>
                            <button
                              onClick={() => handleEditPart(part)}
                              style={{
                                backgroundColor: '#666',
                                color: '#FFD329',
                                padding: '6px 12px',
                                fontSize: '12px',
                                border: '1px solid #888',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = '#777'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = '#666'}
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Labor Tab Content */}
          {activeTab === 'labor' && (
            <div>
              {/* Add Labor Button */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  onClick={() => setShowAddLaborForm(!showAddLaborForm)}
                  style={{
                    backgroundColor: showAddLaborForm ? '#666' : '#FFD329',
                    color: showAddLaborForm ? '#FFD329' : 'black',
                    padding: '10px 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: showAddLaborForm ? '1px solid #888' : 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {showAddLaborForm ? 'Cancel' : 'Add New Labor Item'}
                </button>
              </div>

              {/* Add Labor Form */}
              {showAddLaborForm && (
                <div style={{
                  backgroundColor: '#333',
                  padding: '25px',
                  borderRadius: '10px',
                  marginBottom: '30px'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#FFD329' }}>Add New Labor Item</h3>
                  
                  <form onSubmit={handleAddLabor}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Labor Name *
                        </label>
                        <input
                          type="text"
                          name="labor_name"
                          value={newLabor.labor_name}
                          onChange={handleLaborChange}
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
                          placeholder="e.g., Oil Change, Brake Pad Replacement"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Cost *
                        </label>
                        <input
                          type="number"
                          name="labor_cost_cents"
                          value={newLabor.labor_cost_cents}
                          onChange={handleLaborChange}
                          required
                          min="0"
                          step="0.01"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '1px solid #666',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Category
                        </label>
                        <select
                          name="category"
                          value={newLabor.category}
                          onChange={handleLaborChange}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '1px solid #666',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                        >
                          <option value="">Select Category</option>
                          {laborCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Estimated Time (Hours)
                        </label>
                        <input
                          type="number"
                          name="estimated_time_hours"
                          value={newLabor.estimated_time_hours}
                          onChange={handleLaborChange}
                          min="0"
                          step="0.1"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '1px solid #666',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                          placeholder="e.g., 1.5"
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={newLabor.description}
                        onChange={handleLaborChange}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '5px',
                          border: '1px solid #666',
                          backgroundColor: '#444',
                          color: '#FFD329',
                          fontSize: '16px',
                          resize: 'vertical'
                        }}
                        placeholder="Detailed description of the labor service..."
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          backgroundColor: isSubmitting ? '#666' : '#FFD329',
                          color: 'black',
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isSubmitting ? 'Adding Labor...' : 'Add Labor Item'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Edit Labor Form */}
              {editingLabor && (
                <div style={{
                  backgroundColor: '#2c3e50',
                  padding: '25px',
                  borderRadius: '10px',
                  marginBottom: '30px',
                  border: '3px solid #FFD329',
                  boxShadow: '0 0 20px rgba(255, 211, 41, 0.3)',
                  position: 'relative',
                  zIndex: 100
                }}>
                  <h3 style={{ 
                    marginTop: 0, 
                    marginBottom: '20px', 
                    color: '#FFD329',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    backgroundColor: '#444',
                    padding: '10px',
                    borderRadius: '5px'
                  }}>
                    🔧 EDITING LABOR ITEM (ID: {editingLabor}) 🔧
                  </h3>
                  
                  <form onSubmit={handleUpdateLabor}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Labor Name *
                        </label>
                        <input
                          type="text"
                          name="labor_name"
                          value={editedLabor.labor_name}
                          onChange={handleLaborEditChange}
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
                          placeholder="e.g., Oil Change, Brake Pad Replacement"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Cost *
                        </label>
                        <input
                          type="number"
                          name="labor_cost_cents"
                          value={editedLabor.labor_cost_cents}
                          onChange={handleLaborEditChange}
                          required
                          min="0"
                          step="0.01"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '1px solid #666',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Category
                        </label>
                        <select
                          name="category"
                          value={editedLabor.category}
                          onChange={handleLaborEditChange}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '1px solid #666',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                        >
                          <option value="">Select Category</option>
                          {laborCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Estimated Time (Hours)
                        </label>
                        <input
                          type="number"
                          name="estimated_time_hours"
                          value={editedLabor.estimated_time_hours}
                          onChange={handleLaborEditChange}
                          min="0"
                          step="0.1"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '5px',
                            border: '1px solid #666',
                            backgroundColor: '#444',
                            color: '#FFD329',
                            fontSize: '16px'
                          }}
                          placeholder="e.g., 1.5"
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editedLabor.description}
                        onChange={handleLaborEditChange}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '5px',
                          border: '1px solid #666',
                          backgroundColor: '#444',
                          color: '#FFD329',
                          fontSize: '16px',
                          resize: 'vertical'
                        }}
                        placeholder="Detailed description of the labor service..."
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        style={{
                          backgroundColor: isUpdating ? '#666' : '#4CAF50',
                          color: 'white',
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: isUpdating ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isUpdating ? 'Updating...' : 'Update Labor'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleDeleteLabor}
                        disabled={isDeleting}
                        style={{
                          backgroundColor: isDeleting ? '#666' : '#f44336',
                          color: 'white',
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: isDeleting ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete Labor'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={{
                          backgroundColor: '#666',
                          color: '#FFD329',
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          border: '1px solid #888',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Labor Search Bar */}
              <div style={{
                backgroundColor: '#333',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '30px'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Search Labor Items</h3>
                <input
                  type="text"
                  value={laborSearchTerm}
                  onChange={(e) => setLaborSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '5px',
                    border: '1px solid #666',
                    backgroundColor: '#444',
                    color: '#FFD329',
                    fontSize: '16px'
                  }}
                  placeholder="Search by labor name, category, or description..."
                />
              </div>

              {/* Labor List */}
              <div style={{
                backgroundColor: '#333',
                padding: '25px',
                borderRadius: '10px'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#FFD329' }}>
                  Labor & Pricing ({filteredLabor.length} {filteredLabor.length === 1 ? 'item' : 'items'})
                </h3>
                
                {filteredLabor.length === 0 ? (
                  <p style={{ color: '#ccc', fontStyle: 'italic', textAlign: 'center', padding: '40px' }}>
                    {laborSearchTerm ? 'No labor items found matching your search.' : 'No labor items defined.'}
                  </p>
                ) : (
                  <div>
                    {/* Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                      gap: '15px',
                      padding: '15px',
                      backgroundColor: '#444',
                      borderRadius: '5px',
                      marginBottom: '15px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: '#FFD329'
                    }}>
                      <div>LABOR DETAILS</div>
                      <div>CATEGORY</div>
                      <div>COST</div>
                      <div>EST. TIME</div>
                      <div>ACTIONS</div>
                    </div>

                    {/* Labor List */}
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {filteredLabor.map(laborItem => (
                        <div
                          key={laborItem.labor_id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                            gap: '15px',
                            padding: '15px',
                            backgroundColor: '#444',
                            borderRadius: '5px',
                            border: '1px solid #666',
                            alignItems: 'center',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#555'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = '#444'}
                        >
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                              {laborItem.labor_name}
                            </div>
                            <div style={{ color: '#ccc', fontSize: '14px' }}>
                              Labor ID: {laborItem.labor_id}
                            </div>
                            {laborItem.description && (
                              <div style={{ color: '#ccc', fontSize: '12px', marginTop: '4px' }}>
                                {laborItem.description.length > 60 
                                  ? `${laborItem.description.substring(0, 60)}...` 
                                  : laborItem.description}
                              </div>
                            )}
                          </div>
                          <div style={{ color: '#ccc' }}>
                            {laborItem.category || 'Uncategorized'}
                          </div>
                          <div style={{ fontWeight: 'bold', color: '#FFD329' }}>
                            {formatCurrency(laborItem.labor_cost_cents)}
                          </div>
                          <div style={{ color: '#ccc' }}>
                            {laborItem.estimated_time_hours ? `${laborItem.estimated_time_hours}h` : 'N/A'}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditLabor(laborItem);
                              }}
                              style={{
                                backgroundColor: '#666',
                                color: '#FFD329',
                                padding: '6px 12px',
                                fontSize: '12px',
                                border: '1px solid #888',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                minWidth: '50px',
                                zIndex: 10,
                                position: 'relative'
                              }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = '#777'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = '#666'}
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Database Management Tab Content */}
          {activeTab === 'database' && (
            <div>
              <div style={{
                backgroundColor: '#1a1a1a',
                padding: '25px',
                borderRadius: '10px',
                border: '2px solid #f44336',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    fontSize: '24px',
                    marginRight: '10px'
                  }}>⚠️</div>
                  <h3 style={{
                    margin: 0,
                    color: '#f44336',
                    fontSize: '20px'
                  }}>DANGER ZONE - Database Management</h3>
                </div>
                
                <p style={{
                  color: '#ff9800',
                  marginBottom: '20px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  ⚠️ WARNING: These actions will permanently delete data from your database.
                  This cannot be undone. Use with extreme caution.
                </p>
                
                <div style={{
                  backgroundColor: '#333',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{
                    color: '#FFD329',
                    marginTop: 0,
                    marginBottom: '15px'
                  }}>Select Databases to Delete:</h4>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '20px'
                  }}>
                    {[
                      { key: 'customers', label: 'Customers', icon: '👥' },
                      { key: 'vehicles', label: 'Vehicles', icon: '🚗' },
                      { key: 'parts', label: 'Parts Inventory', icon: '🔧' },
                      { key: 'labor', label: 'Labor & Pricing', icon: '⚙️' },
                      { key: 'workOrders', label: 'Work Orders', icon: '📋' },
                      { key: 'taxSettings', label: 'Tax Settings', icon: '💰' }
                    ].map(db => (
                      <div
                        key={db.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: selectedDatabases[db.key] ? '#4CAF50' : '#444',
                          padding: '12px',
                          borderRadius: '8px',
                          border: selectedDatabases[db.key] ? '2px solid #4CAF50' : '1px solid #666',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onClick={() => handleDatabaseSelection(db.key, !selectedDatabases[db.key])}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDatabases[db.key]}
                          onChange={(e) => handleDatabaseSelection(db.key, e.target.checked)}
                          style={{
                            marginRight: '10px',
                            transform: 'scale(1.2)'
                          }}
                        />
                        <div style={{
                          fontSize: '20px',
                          marginRight: '8px'
                        }}>{db.icon}</div>
                        <div style={{
                          flex: 1
                        }}>
                          <div style={{
                            fontWeight: 'bold',
                            color: selectedDatabases[db.key] ? 'white' : '#FFD329',
                            marginBottom: '4px'
                          }}>
                            {db.label}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: selectedDatabases[db.key] ? '#e0e0e0' : '#ccc'
                          }}>
                            {databaseCounts[db.key] || 0} records
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={handleDeleteDatabases}
                    disabled={isDeletingDatabases || Object.values(selectedDatabases).every(v => !v)}
                    style={{
                      backgroundColor: isDeletingDatabases ? '#666' : '#f44336',
                      color: 'white',
                      padding: '15px 30px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isDeletingDatabases || Object.values(selectedDatabases).every(v => !v) ? 'not-allowed' : 'pointer',
                      opacity: Object.values(selectedDatabases).every(v => !v) ? 0.5 : 1,
                      transition: 'all 0.3s'
                    }}
                  >
                    {isDeletingDatabases ? (
                      <span>
                        <span style={{ marginRight: '8px' }}>⏳</span>
                        Deleting Selected Databases...
                      </span>
                    ) : (
                      <span>
                        <span style={{ marginRight: '8px' }}>🗑️</span>
                        Delete Selected Databases
                      </span>
                    )}
                  </button>
                </div>
                
                {Object.values(selectedDatabases).some(v => v) && (
                  <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: '#444',
                    borderRadius: '8px',
                    border: '1px solid #ff9800'
                  }}>
                    <div style={{
                      color: '#ff9800',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ marginRight: '8px' }}>⚠️</span>
                      Selected for Deletion:
                    </div>
                    <div style={{
                      color: '#ccc',
                      fontSize: '14px'
                    }}>
                      {Object.entries(selectedDatabases)
                        .filter(([key, selected]) => selected)
                        .map(([key, _]) => {
                          const labels = {
                            customers: 'Customers',
                            vehicles: 'Vehicles',
                            parts: 'Parts Inventory',
                            labor: 'Labor & Pricing',
                            workOrders: 'Work Orders',
                            taxSettings: 'Tax Settings'
                          };
                          return `${labels[key]} (${databaseCounts[key] || 0} records)`;
                        })
                        .join(', ')}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Database Status Information */}
              <div style={{
                backgroundColor: '#333',
                padding: '20px',
                borderRadius: '10px'
              }}>
                <h4 style={{
                  color: '#FFD329',
                  marginTop: 0,
                  marginBottom: '15px'
                }}>📊 Database Status</h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '10px'
                }}>
                  {[
                    { key: 'customers', label: 'Customers', icon: '👥', color: '#2196F3' },
                    { key: 'vehicles', label: 'Vehicles', icon: '🚗', color: '#FF5722' },
                    { key: 'parts', label: 'Parts', icon: '🔧', color: '#4CAF50' },
                    { key: 'labor', label: 'Labor Items', icon: '⚙️', color: '#FF9800' },
                    { key: 'workOrders', label: 'Work Orders', icon: '📋', color: '#9C27B0' },
                    { key: 'taxSettings', label: 'Tax Config', icon: '💰', color: '#FFD329' }
                  ].map(db => (
                    <div
                      key={db.key}
                      style={{
                        backgroundColor: '#444',
                        padding: '12px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: `2px solid ${db.color}`
                      }}
                    >
                      <div style={{
                        fontSize: '24px',
                        marginBottom: '5px'
                      }}>{db.icon}</div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: db.color,
                        marginBottom: '3px'
                      }}>
                        {databaseCounts[db.key] || 0}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#ccc'
                      }}>
                        {db.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#333',
            borderRadius: '5px',
            fontSize: '14px',
            color: '#ccc'
          }}>
            <strong>Note:</strong> Use the tabs above to switch between managing Parts inventory, Labor/Pricing, and Database Management. 
            All changes are automatically saved to the database.
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryManagerEnhanced;