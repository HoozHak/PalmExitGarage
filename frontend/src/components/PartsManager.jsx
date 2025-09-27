import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation.jsx';

const API_BASE = 'http://localhost:5000/api';

function PartsManager() {
  const navigate = useNavigate();
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPart, setNewPart] = useState({
    brand: '',
    item: '',
    part_number: '',
    cost_cents: '',
    category: '',
    description: '',
    in_stock: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadParts();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = parts.filter(part =>
        part.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredParts(filtered);
    } else {
      setFilteredParts(parts);
    }
  }, [searchTerm, parts]);

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
        setShowAddForm(false);
        setNewPart({
          brand: '',
          item: '',
          part_number: '',
          cost_cents: '',
          category: '',
          description: '',
          in_stock: true
        });
        loadParts(); // Refresh the parts list
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

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPart(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedPart(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
        loadParts(); // Refresh the parts list
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
        loadParts(); // Refresh the parts list
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

  const handleCancelEdit = () => {
    setEditingPart(null);
    setEditedPart({
      brand: '',
      item: '',
      part_number: '',
      cost_cents: '',
      category: '',
      description: '',
      in_stock: true
    });
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
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
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
            Parts Inventory
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                backgroundColor: showAddForm ? '#666' : '#FFD329',
                color: showAddForm ? '#FFD329' : 'black',
                padding: '10px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: showAddForm ? '1px solid #888' : 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {showAddForm ? 'Cancel' : 'Add New Part'}
            </button>
          </div>
        </div>

        {/* Add Part Form */}
        {showAddForm && (
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    <option value="Engine">Engine</option>
                    <option value="Transmission">Transmission</option>
                    <option value="Brakes">Brakes</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Exhaust">Exhaust</option>
                    <option value="Cooling">Cooling</option>
                    <option value="Fuel System">Fuel System</option>
                    <option value="Body">Body</option>
                    <option value="Interior">Interior</option>
                    <option value="Filters">Filters</option>
                    <option value="Fluids">Fluids</option>
                    <option value="Tools">Tools</option>
                    <option value="Other">Other</option>
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
                  onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleEditChange}
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
                    onChange={handleEditChange}
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
                    onChange={handleEditChange}
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
                    onChange={handleEditChange}
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
                    onChange={handleEditChange}
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
                    <option value="Engine">Engine</option>
                    <option value="Transmission">Transmission</option>
                    <option value="Brakes">Brakes</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Exhaust">Exhaust</option>
                    <option value="Cooling">Cooling</option>
                    <option value="Fuel System">Fuel System</option>
                    <option value="Body">Body</option>
                    <option value="Interior">Interior</option>
                    <option value="Filters">Filters</option>
                    <option value="Fluids">Fluids</option>
                    <option value="Tools">Tools</option>
                    <option value="Other">Other</option>
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
                  onChange={handleEditChange}
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
                    onChange={handleEditChange}
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
                  {isUpdating ? 'Updating...' : 'Submit Changes'}
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
                  {isDeleting ? 'Deleting...' : 'Delete Item'}
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

        {/* Search Bar */}
        <div style={{
          backgroundColor: '#333',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Search Parts</h3>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              {searchTerm ? 'No parts found matching your search.' : 'No parts in inventory.'}
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

        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#333',
          borderRadius: '5px',
          fontSize: '14px',
          color: '#ccc'
        }}>
          <strong>Note:</strong> Part ID numbers are automatically generated. 
          Use the search bar to quickly find parts by brand, name, part number, or category.
        </div>
      </div>
      </div>
    </div>
  );
}

export default PartsManager;