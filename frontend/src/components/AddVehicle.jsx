import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation.jsx';

const API_BASE = 'http://localhost:5000/api';

function AddVehicle() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_id: '',
    year: '',
    make: '',
    model: '',
    vin: '',
    license_plate: '',
    color: '',
    mileage: '',
    engine_size: '',
    transmission: '',
    notes: ''
  });

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load makes on component mount
  useEffect(() => {
    loadMakes();
    loadCustomers();
  }, []);

  // Load models when make changes
  useEffect(() => {
    if (formData.make) {
      loadModels(formData.make);
      setFormData(prev => ({ ...prev, model: '', year: '' }));
      setYears([]);
    }
  }, [formData.make]);

  // Load years when model changes
  useEffect(() => {
    if (formData.make && formData.model) {
      loadYears(formData.make, formData.model);
      setFormData(prev => ({ ...prev, year: '' }));
    }
  }, [formData.model]);

  const loadMakes = async () => {
    try {
      const response = await fetch(`${API_BASE}/vehicle-reference/makes`);
      if (response.ok) {
        const data = await response.json();
        setMakes(data);
      }
    } catch (error) {
      console.error('Error loading makes:', error);
    }
  };

  const loadModels = async (make) => {
    try {
      const response = await fetch(`${API_BASE}/vehicle-reference/models/${encodeURIComponent(make)}`);
      if (response.ok) {
        const data = await response.json();
        setModels(data);
      }
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const loadYears = async (make, model) => {
    try {
      const response = await fetch(`${API_BASE}/vehicle-reference/years/${encodeURIComponent(make)}/${encodeURIComponent(model)}`);
      if (response.ok) {
        const data = await response.json();
        setYears(data);
      }
    } catch (error) {
      console.error('Error loading years:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE}/customers`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCustomerSearch = (e) => {
    const value = e.target.value;
    setCustomerSearch(value);
    
    if (value.length >= 2) {
      const filtered = customers.filter(customer =>
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(value.toLowerCase()) ||
        customer.phone.includes(value) ||
        customer.customer_id.toString().includes(value)
      );
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(true);
    } else {
      setShowCustomerDropdown(false);
    }
  };

  const selectCustomer = (customer) => {
    setFormData(prev => ({
      ...prev,
      customer_id: customer.customer_id
    }));
    setCustomerSearch(`${customer.first_name} ${customer.last_name} (ID: ${customer.customer_id})`);
    setShowCustomerDropdown(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }
    
    if (!formData.year) {
      newErrors.year = 'Year is required';
    }
    
    if (!formData.make) {
      newErrors.make = 'Make is required';
    }
    
    if (!formData.model) {
      newErrors.model = 'Model is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          mileage: formData.mileage ? parseInt(formData.mileage) : null
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Vehicle added successfully! Vehicle ID: ${result.vehicle_id}`);
        navigate('/customer/existing');
      } else {
        const error = await response.json();
        alert('Error adding vehicle: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: Could not connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      customer_id: '',
      year: '',
      make: '',
      model: '',
      vin: '',
      license_plate: '',
      color: '',
      mileage: '',
      engine_size: '',
      transmission: '',
      notes: ''
    });
    setCustomerSearch('');
    setErrors({});
    setModels([]);
    setYears([]);
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
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#333',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '28px',
          color: '#FFD329'
        }}>
          Add New Vehicle
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Customer Selection */}
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Customer *
            </label>
            <input
              type="text"
              value={customerSearch}
              onChange={handleCustomerSearch}
              onFocus={() => setShowCustomerDropdown(true)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '5px',
                border: errors.customer_id ? '2px solid #ff4444' : '1px solid #666',
                backgroundColor: '#444',
                color: '#FFD329',
                fontSize: '16px'
              }}
              placeholder="Search by name, phone, or customer ID..."
            />
            {showCustomerDropdown && filteredCustomers.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#444',
                border: '1px solid #666',
                borderRadius: '5px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 1000
              }}>
                {filteredCustomers.map(customer => (
                  <div
                    key={customer.customer_id}
                    onClick={() => selectCustomer(customer)}
                    style={{
                      padding: '10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #555'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#555'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ fontWeight: 'bold' }}>
                      {customer.first_name} {customer.last_name} (ID: {customer.customer_id})
                    </div>
                    <div style={{ fontSize: '14px', color: '#ccc' }}>
                      {customer.phone} • {customer.email}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.customer_id && (
              <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                {errors.customer_id}
              </div>
            )}
          </div>

          {/* Vehicle Make/Model/Year */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Make */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Make *
              </label>
              <select
                name="make"
                value={formData.make}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '5px',
                  border: errors.make ? '2px solid #ff4444' : '1px solid #666',
                  backgroundColor: '#444',
                  color: '#FFD329',
                  fontSize: '16px'
                }}
              >
                <option value="">Select Make</option>
                {makes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
              {errors.make && (
                <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                  {errors.make}
                </div>
              )}
            </div>

            {/* Model */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Model *
              </label>
              <select
                name="model"
                value={formData.model}
                onChange={handleChange}
                disabled={!formData.make}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '5px',
                  border: errors.model ? '2px solid #ff4444' : '1px solid #666',
                  backgroundColor: formData.make ? '#444' : '#555',
                  color: formData.make ? '#FFD329' : '#999',
                  fontSize: '16px'
                }}
              >
                <option value="">Select Model</option>
                {models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              {errors.model && (
                <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                  {errors.model}
                </div>
              )}
            </div>

            {/* Year */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Year *
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                disabled={!formData.model}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '5px',
                  border: errors.year ? '2px solid #ff4444' : '1px solid #666',
                  backgroundColor: formData.model ? '#444' : '#555',
                  color: formData.model ? '#FFD329' : '#999',
                  fontSize: '16px'
                }}
              >
                <option value="">Select Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {errors.year && (
                <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                  {errors.year}
                </div>
              )}
            </div>
          </div>

          {/* VIN and License Plate */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                VIN Number
              </label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
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
                placeholder="Vehicle Identification Number"
                maxLength="17"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                License Plate
              </label>
              <input
                type="text"
                name="license_plate"
                value={formData.license_plate}
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
                placeholder="ABC-1234"
              />
            </div>
          </div>

          {/* Color and Mileage */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
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
                placeholder="Vehicle color"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Mileage
              </label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
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
                placeholder="Current mileage"
              />
            </div>
          </div>

          {/* Engine Size and Transmission */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Engine Size
              </label>
              <input
                type="text"
                name="engine_size"
                value={formData.engine_size}
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
                placeholder="e.g., 2.0L, V6"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Transmission
              </label>
              <select
                name="transmission"
                value={formData.transmission}
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
                <option value="">Select Transmission</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="CVT">CVT</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
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
              placeholder="Additional notes about the vehicle..."
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center'
          }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: isSubmitting ? '#666' : '#FFD329',
                color: 'black',
                padding: '15px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {isSubmitting ? 'Adding Vehicle...' : 'Add Vehicle'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              style={{
                backgroundColor: '#666',
                color: '#FFD329',
                padding: '15px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: '1px solid #888',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#777'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#666'}
            >
              Clear Form
            </button>

          </div>
        </form>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#444',
          borderRadius: '5px',
          fontSize: '14px',
          color: '#ccc'
        }}>
          <strong>Note:</strong> Vehicle ID will be automatically generated upon successful submission.
          Make/Model/Year selections are populated from the vehicle reference database. Fields marked with * are required.
        </div>
      </div>
      </div>
    </div>
  );
}

export default AddVehicle;