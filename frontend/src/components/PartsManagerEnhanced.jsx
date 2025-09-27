import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

function PartsManagerEnhanced() {
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [formData, setFormData] = useState({
    brand: '',
    item: '',
    part_number: '',
    cost_cents: '',
    category: '',
    description: '',
    in_stock: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        ...formData,
        cost_cents: Math.round(parseFloat(formData.cost_cents || '0') * 100)
      };

      const url = editingPart ? `${API_BASE}/parts/${editingPart.part_id}` : `${API_BASE}/parts`;
      const method = editingPart ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        alert(editingPart ? 'Part updated successfully!' : `Part added successfully! ID: ${result.part_id}`);
        resetForm();
        loadParts();
      } else {
        const error = await response.json();
        alert(`Error ${editingPart ? 'updating' : 'adding'} part: ` + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: Could not connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setFormData({
      brand: part.brand,
      item: part.item,
      part_number: part.part_number,
      cost_cents: (part.cost_cents / 100).toFixed(2),
      category: part.category,
      description: part.description || '',
      in_stock: part.in_stock
    });
    setShowForm(true);
  };

  const handleDelete = async (part) => {
    if (!confirm(`Are you sure you want to delete "${part.brand} ${part.item}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/parts/${part.part_id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Part deleted successfully!');
        loadParts();
      } else {
        const error = await response.json();
        alert('Error deleting part: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: Could not delete part');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPart(null);
    setFormData({
      brand: '',
      item: '',
      part_number: '',
      cost_cents: '',
      category: '',
      description: '',
      in_stock: true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  return (
    <div style={{ padding: '25px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px'
      }}>
        <h3 style={{ margin: 0, color: '#FFD329', fontSize: '22px' }}>
          🔧 Parts Inventory ({filteredParts.length})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: showForm ? '#666' : '#FFD329',
            color: showForm ? '#FFD329' : 'black',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            border: showForm ? '1px solid #888' : 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {showForm ? '❌ Cancel' : '➕ Add New Part'}
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search parts by brand, name, part number, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '5px',
            border: '1px solid #666',
            backgroundColor: '#444',
            color: '#FFD329',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          backgroundColor: '#444',
          padding: '20px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h4 style={{ marginTop: 0, color: '#FFD329' }}>
            {editingPart ? '✏️ Edit Part' : '➕ Add New Part'}
          </h4>
          
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Brand *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #666',
                    backgroundColor: '#333',
                    color: '#FFD329',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Part Name *
                </label>
                <input
                  type="text"
                  name="item"
                  value={formData.item}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #666',
                    backgroundColor: '#333',
                    color: '#FFD329',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Part Number
                </label>
                <input
                  type="text"
                  name="part_number"
                  value={formData.part_number}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #666',
                    backgroundColor: '#333',
                    color: '#FFD329',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Cost (USD) *
                </label>
                <input
                  type="number"
                  name="cost_cents"
                  value={formData.cost_cents}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #666',
                    backgroundColor: '#333',
                    color: '#FFD329',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #666',
                    backgroundColor: '#333',
                    color: '#FFD329',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                  <input
                    type="checkbox"
                    name="in_stock"
                    checked={formData.in_stock}
                    onChange={handleChange}
                    style={{ marginRight: '8px' }}
                  />
                  In Stock
                </label>
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #666',
                  backgroundColor: '#333',
                  color: '#FFD329',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: isSubmitting ? '#666' : '#4CAF50',
                  color: 'white',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Saving...' : (editingPart ? 'Update Part' : 'Add Part')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  backgroundColor: '#666',
                  color: '#FFD329',
                  padding: '10px 20px',
                  fontSize: '14px',
                  border: '1px solid #888',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Parts Table */}
      <div style={{
        backgroundColor: '#444',
        borderRadius: '5px',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 100px 100px',
          gap: '1px',
          backgroundColor: '#666'
        }}>
          {/* Header */}
          <div style={{ backgroundColor: '#FFD329', color: 'black', padding: '12px', fontWeight: 'bold' }}>
            Part Details
          </div>
          <div style={{ backgroundColor: '#FFD329', color: 'black', padding: '12px', fontWeight: 'bold' }}>
            Part Number
          </div>
          <div style={{ backgroundColor: '#FFD329', color: 'black', padding: '12px', fontWeight: 'bold' }}>
            Category
          </div>
          <div style={{ backgroundColor: '#FFD329', color: 'black', padding: '12px', fontWeight: 'bold' }}>
            Cost
          </div>
          <div style={{ backgroundColor: '#FFD329', color: 'black', padding: '12px', fontWeight: 'bold' }}>
            Stock
          </div>
          <div style={{ backgroundColor: '#FFD329', color: 'black', padding: '12px', fontWeight: 'bold' }}>
            Actions
          </div>

          {/* Data Rows */}
          {filteredParts.map((part, index) => (
            <React.Fragment key={part.part_id}>
              <div style={{ backgroundColor: '#444', padding: '12px' }}>
                <div style={{ fontWeight: 'bold' }}>{part.brand} {part.item}</div>
                {part.description && (
                  <div style={{ fontSize: '12px', color: '#ccc', marginTop: '5px' }}>
                    {part.description}
                  </div>
                )}
              </div>
              <div style={{ backgroundColor: '#444', padding: '12px' }}>
                {part.part_number || 'N/A'}
              </div>
              <div style={{ backgroundColor: '#444', padding: '12px' }}>
                {part.category || 'N/A'}
              </div>
              <div style={{ backgroundColor: '#444', padding: '12px', fontWeight: 'bold' }}>
                {formatCurrency(part.cost_cents)}
              </div>
              <div style={{ backgroundColor: '#444', padding: '12px' }}>
                <span style={{
                  color: part.in_stock ? '#4CAF50' : '#f44336',
                  fontWeight: 'bold'
                }}>
                  {part.in_stock ? '✓' : '✗'}
                </span>
              </div>
              <div style={{ backgroundColor: '#444', padding: '8px', display: 'flex', gap: '5px' }}>
                <button
                  onClick={() => handleEdit(part)}
                  style={{
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  title="Edit Part"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(part)}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  title="Delete Part"
                >
                  🗑️
                </button>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {filteredParts.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: '#ccc',
          fontSize: '16px',
          padding: '40px'
        }}>
          {searchTerm ? 'No parts found matching your search.' : 'No parts in inventory yet.'}
        </div>
      )}
    </div>
  );
}

export default PartsManagerEnhanced;