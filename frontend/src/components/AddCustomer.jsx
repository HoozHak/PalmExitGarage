import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation.jsx';
import WorkOrderForm from './WorkOrderForm.jsx';

const API_BASE = 'http://localhost:5000/api';

function AddCustomer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });

  const [vehicleData, setVehicleData] = useState({
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

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [addVehicle, setAddVehicle] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState(null);
  const [createdVehicle, setCreatedVehicle] = useState(null);
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);

  // Load vehicle reference data when component mounts
  useEffect(() => {
    if (addVehicle) {
      loadMakes();
    }
  }, [addVehicle]);

  // Load models when make changes
  useEffect(() => {
    if (vehicleData.make && addVehicle) {
      loadModels(vehicleData.make);
      setVehicleData(prev => ({ ...prev, model: '', year: '' }));
      setYears([]);
    }
  }, [vehicleData.make, addVehicle]);

  // Load years when model changes
  useEffect(() => {
    if (vehicleData.make && vehicleData.model && addVehicle) {
      loadYears(vehicleData.make, vehicleData.model);
      setVehicleData(prev => ({ ...prev, year: '' }));
    }
  }, [vehicleData.model, addVehicle]);

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

  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[`vehicle_${name}`]) {
      setErrors(prev => ({
        ...prev,
        [`vehicle_${name}`]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Customer validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Vehicle validation (if adding vehicle)
    if (addVehicle) {
      if (!vehicleData.year) {
        newErrors.vehicle_year = 'Year is required when adding a vehicle';
      }
      
      if (!vehicleData.make) {
        newErrors.vehicle_make = 'Make is required when adding a vehicle';
      }
      
      if (!vehicleData.model) {
        newErrors.vehicle_model = 'Model is required when adding a vehicle';
      }
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
      // First, create the customer
      const customerResponse = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!customerResponse.ok) {
        const error = await customerResponse.json();
        throw new Error('Error adding customer: ' + error.message);
      }

      const customerResult = await customerResponse.json();
      const customerId = customerResult.customer_id;
      
      // Store created customer info
      setCreatedCustomer({
        customer_id: customerId,
        name: `${formData.first_name} ${formData.last_name}`,
        phone: formData.phone
      });

      let vehicleMessage = '';
      let vehicleResult = null;
      
      // If adding a vehicle, create it now
      if (addVehicle) {
        try {
          const vehicleResponse = await fetch(`${API_BASE}/vehicles`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...vehicleData,
              customer_id: customerId,
              mileage: vehicleData.mileage ? parseInt(vehicleData.mileage) : null
            }),
          });

          if (vehicleResponse.ok) {
            vehicleResult = await vehicleResponse.json();
            setCreatedVehicle({
              vehicle_id: vehicleResult.vehicle_id,
              description: `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`
            });
            vehicleMessage = ` Vehicle added successfully! Vehicle ID: ${vehicleResult.vehicle_id}`;
          } else {
            const vehicleError = await vehicleResponse.json();
            vehicleMessage = ` Warning: Vehicle could not be added - ${vehicleError.message}`;
          }
        } catch (vehicleError) {
          console.error('Vehicle error:', vehicleError);
          vehicleMessage = ' Warning: Vehicle could not be added due to network error.';
        }
      }

      // Show success message and option to create work order
      const successMessage = `Customer added successfully! Customer ID: ${customerId}${vehicleMessage}\n\nWould you like to create a work order for this customer now?`;
      
      if (confirm(successMessage)) {
        setShowWorkOrderForm(true);
      } else {
        navigate('/customer/existing');
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Network error: Could not connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip_code: ''
    });
    setVehicleData({
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
    setAddVehicle(false);
    setMakes([]);
    setModels([]);
    setYears([]);
    setErrors({});
    setCreatedCustomer(null);
    setCreatedVehicle(null);
    setShowWorkOrderForm(false);
  };

  const handleWorkOrderCreated = (workOrderResult) => {
    alert(`Work order created successfully for ${createdCustomer.name}!\nWork Order ID: ${workOrderResult.work_order_id}`);
    navigate('/customer/existing');
  };

  const handleCancelWorkOrder = () => {
    setShowWorkOrderForm(false);
    navigate('/customer/existing');
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
        maxWidth: '600px',
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
          Add New Customer
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* First Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '5px',
                  border: errors.first_name ? '2px solid #ff4444' : '1px solid #666',
                  backgroundColor: '#444',
                  color: '#FFD329',
                  fontSize: '16px'
                }}
                placeholder="Enter first name"
              />
              {errors.first_name && (
                <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                  {errors.first_name}
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '5px',
                  border: errors.last_name ? '2px solid #ff4444' : '1px solid #666',
                  backgroundColor: '#444',
                  color: '#FFD329',
                  fontSize: '16px'
                }}
                placeholder="Enter last name"
              />
              {errors.last_name && (
                <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                  {errors.last_name}
                </div>
              )}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Phone */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '5px',
                  border: errors.phone ? '2px solid #ff4444' : '1px solid #666',
                  backgroundColor: '#444',
                  color: '#FFD329',
                  fontSize: '16px'
                }}
                placeholder="(555) 123-4567"
              />
              {errors.phone && (
                <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                  {errors.phone}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '5px',
                  border: errors.email ? '2px solid #ff4444' : '1px solid #666',
                  backgroundColor: '#444',
                  color: '#FFD329',
                  fontSize: '16px'
                }}
                placeholder="customer@example.com"
              />
              {errors.email && (
                <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                  {errors.email}
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
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
              placeholder="123 Main Street"
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {/* City */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
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
                placeholder="City"
              />
            </div>

            {/* State */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
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
                placeholder="FL"
                maxLength="2"
              />
            </div>

            {/* ZIP */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                ZIP Code
              </label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
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
                placeholder="12345"
              />
            </div>
          </div>

          {/* Add Vehicle Toggle */}
          <div style={{
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#444',
            borderRadius: '8px',
            border: '2px solid #666'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={addVehicle}
                onChange={(e) => setAddVehicle(e.target.checked)}
                style={{ 
                  transform: 'scale(1.5)',
                  accentColor: '#FFD329'
                }}
              />
              <span>Add a vehicle to this customer</span>
            </label>
            <div style={{ 
              fontSize: '14px', 
              color: '#ccc', 
              marginTop: '8px',
              marginLeft: '35px'
            }}>
              Check this box to register a vehicle for the new customer in the same form.
            </div>
          </div>

          {/* Vehicle Form Section */}
          {addVehicle && (
            <div style={{
              marginBottom: '30px',
              padding: '25px',
              backgroundColor: '#444',
              borderRadius: '8px',
              border: '2px solid #FFD329'
            }}>
              <h3 style={{ 
                marginTop: 0, 
                marginBottom: '20px', 
                color: '#FFD329',
                fontSize: '20px'
              }}>
                🚗 Vehicle Information
              </h3>

              {/* Make/Model/Year Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Make *
                  </label>
                  <select
                    name="make"
                    value={vehicleData.make}
                    onChange={handleVehicleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '5px',
                      border: errors.vehicle_make ? '2px solid #ff4444' : '1px solid #666',
                      backgroundColor: '#333',
                      color: '#FFD329',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">Select Make</option>
                    {makes.map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                  {errors.vehicle_make && (
                    <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                      {errors.vehicle_make}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Model *
                  </label>
                  <select
                    name="model"
                    value={vehicleData.model}
                    onChange={handleVehicleChange}
                    disabled={!vehicleData.make}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '5px',
                      border: errors.vehicle_model ? '2px solid #ff4444' : '1px solid #666',
                      backgroundColor: vehicleData.make ? '#333' : '#555',
                      color: vehicleData.make ? '#FFD329' : '#999',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">Select Model</option>
                    {models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  {errors.vehicle_model && (
                    <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                      {errors.vehicle_model}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Year *
                  </label>
                  <select
                    name="year"
                    value={vehicleData.year}
                    onChange={handleVehicleChange}
                    disabled={!vehicleData.model}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '5px',
                      border: errors.vehicle_year ? '2px solid #ff4444' : '1px solid #666',
                      backgroundColor: vehicleData.model ? '#333' : '#555',
                      color: vehicleData.model ? '#FFD329' : '#999',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.vehicle_year && (
                    <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                      {errors.vehicle_year}
                    </div>
                  )}
                </div>
              </div>

              {/* VIN and License Plate Row */}
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
                    value={vehicleData.vin}
                    onChange={handleVehicleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '5px',
                      border: '1px solid #666',
                      backgroundColor: '#333',
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
                    value={vehicleData.license_plate}
                    onChange={handleVehicleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '5px',
                      border: '1px solid #666',
                      backgroundColor: '#333',
                      color: '#FFD329',
                      fontSize: '16px'
                    }}
                    placeholder="ABC-1234"
                  />
                </div>
              </div>

              {/* Color and Mileage Row */}
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
                    value={vehicleData.color}
                    onChange={handleVehicleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '5px',
                      border: '1px solid #666',
                      backgroundColor: '#333',
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
                    value={vehicleData.mileage}
                    onChange={handleVehicleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '5px',
                      border: '1px solid #666',
                      backgroundColor: '#333',
                      color: '#FFD329',
                      fontSize: '16px'
                    }}
                    placeholder="Current mileage"
                  />
                </div>
              </div>

              {/* Engine Size and Transmission Row */}
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
                    value={vehicleData.engine_size}
                    onChange={handleVehicleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '5px',
                      border: '1px solid #666',
                      backgroundColor: '#333',
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
                    value={vehicleData.transmission}
                    onChange={handleVehicleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '5px',
                      border: '1px solid #666',
                      backgroundColor: '#333',
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

              {/* Vehicle Notes */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Vehicle Notes
                </label>
                <textarea
                  name="notes"
                  value={vehicleData.notes}
                  onChange={handleVehicleChange}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '5px',
                    border: '1px solid #666',
                    backgroundColor: '#333',
                    color: '#FFD329',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                  placeholder="Additional notes about the vehicle..."
                />
              </div>
            </div>
          )}

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
              {isSubmitting ? 'Adding Customer...' : 'Add Customer'}
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
          <strong>Note:</strong> Customer ID will be automatically generated upon successful submission.
          {addVehicle && ' Vehicle ID will also be automatically generated if you add a vehicle.'}
          <br />Fields marked with * are required.
          {addVehicle && (
            <>
              <br /><strong>Vehicle Info:</strong> Make/Model/Year selections are populated from the vehicle reference database (2011-2025 US models).
            </>
          )}
        </div>
      </div>
      
      {/* Work Order Form Section */}
      {showWorkOrderForm && createdCustomer && (
        <div style={{
          maxWidth: '800px',
          margin: '20px auto 0 auto'
        }}>
          <WorkOrderForm 
            customerId={createdCustomer.customer_id}
            vehicleId={createdVehicle?.vehicle_id || ''}
            customerData={{
              customer_id: createdCustomer.customer_id,
              first_name: formData.first_name,
              last_name: formData.last_name,
              phone: formData.phone,
              email: formData.email
            }}
            vehicleData={createdVehicle ? {
              vehicle_id: createdVehicle.vehicle_id,
              year: vehicleData.year,
              make: vehicleData.make,
              model: vehicleData.model,
              vin: vehicleData.vin,
              license_plate: vehicleData.license_plate
            } : null}
            onWorkOrderCreated={handleWorkOrderCreated}
            onCancel={handleCancelWorkOrder}
            title={`Create Work Order for ${createdCustomer.name}${createdVehicle ? ` (${createdVehicle.description})` : ''}`}
          />
        </div>
      )}
      
      </div>
    </div>
  );
}

export default AddCustomer;