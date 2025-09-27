import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation.jsx';

const API_BASE = 'http://localhost:5000/api';

function InventoryManagerEnhanced() {
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('parts'); // 'parts' or 'labor'
  
  // Parts state
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [partsSearchTerm, setPartsSearchTerm] = useState('');
  const [showAddPartForm, setShowAddPartForm] = useState(false);
  const [newPart, setNewPart] = useState({
    brand: '',
    item: '',
    part_number: '',
    cost_cents: '',
    category: '',
    description: '',
    in_stock: true
  });
  const [editingPart, setEditingPart] = useState(null);
  const [editedPart, setEditedPart] = useState({
    brand: '',
    item: '',
    part_number: '',
    cost_cents: '',
    category: '',
    description: '',
    in_stock: true
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
  }, []);

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
          cost_cents: Math.round(parseFloat(newPart.cost_cents || '0') * 100)
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
          cost_cents: '',
          category: '',
          description: '',
          in_stock: true
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
      cost_cents: (part.cost_cents / 100).toString(),
      category: part.category || '',
      description: part.description || '',
      in_stock: part.in_stock
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
          cost_cents: Math.round(parseFloat(editedPart.cost_cents || '0') * 100)
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
      cost_cents: '',
      category: '',
      description: '',
      in_stock: true
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
                      gridTemplateColumns: '1fr 1fr 1fr',
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
                          Cost *
                        </label>
                        <input
                          type="number"
                          name="cost_cents"
                          value={newPart.cost_cents}
                          onChange={handlePartChange}
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

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                        <input
                          type="checkbox"
                          name="in_stock"
                          checked={newPart.in_stock}
                          onChange={handlePartChange}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        In Stock
                      </label>
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
                      gridTemplateColumns: '1fr 1fr 1fr',
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
                          Cost *
                        </label>
                        <input
                          type="number"
                          name="cost_cents"
                          value={editedPart.cost_cents}
                          onChange={handlePartEditChange}
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

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                        <input
                          type="checkbox"
                          name="in_stock"
                          checked={editedPart.in_stock}
                          onChange={handlePartEditChange}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        In Stock
                      </label>
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
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px',
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
                      <div>COST</div>
                      <div>STATUS</div>
                      <div>ACTIONS</div>
                    </div>

                    {/* Parts List */}
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {filteredParts.map(part => (
                        <div
                          key={part.part_id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px',
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
                          <div style={{ fontWeight: 'bold', color: '#FFD329' }}>
                            {formatCurrency(part.cost_cents)}
                          </div>
                          <div>
                            <span style={{
                              backgroundColor: part.in_stock ? '#4CAF50' : '#f44336',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {part.in_stock ? 'IN STOCK' : 'OUT OF STOCK'}
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

          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#333',
            borderRadius: '5px',
            fontSize: '14px',
            color: '#ccc'
          }}>
            <strong>Note:</strong> Use the tabs above to switch between managing Parts inventory and Labor/Pricing. 
            All changes are automatically saved to the database.
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryManagerEnhanced;