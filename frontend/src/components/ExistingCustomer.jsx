import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation.jsx';
import WorkOrderForm from './WorkOrderForm.jsx';
import WorkOrderDetail from './WorkOrderDetail.jsx';

const API_BASE = 'http://localhost:5000/api';

function ExistingCustomer() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showFullWorkOrderDetail, setShowFullWorkOrderDetail] = useState(false);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = customers.filter(customer =>
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_id.toString().includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
    }
  }, [searchTerm, customers]);

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

  const loadCustomerHistory = async (customerId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/customers/${customerId}/history`);
      if (response.ok) {
        const data = await response.json();
        setCustomerHistory(data);
        setSelectedCustomer(data.customer);
      } else {
        alert('Error loading customer history');
      }
    } catch (error) {
      console.error('Error loading customer history:', error);
      alert('Network error: Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCustomer = () => {
    setEditingCustomer({ ...selectedCustomer });
    setEditMode(true);
  };

  const handleSaveCustomer = async () => {
    // Client-side validation
    if (!editingCustomer.first_name || !editingCustomer.first_name.trim()) {
      alert('First name is required');
      return;
    }
    
    if (!editingCustomer.last_name || !editingCustomer.last_name.trim()) {
      alert('Last name is required');
      return;
    }
    
    if (!editingCustomer.email || !editingCustomer.email.trim()) {
      alert('Email address is required');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingCustomer.email.trim())) {
      alert('Please enter a valid email address');
      return;
    }
    
    if (!editingCustomer.phone || !editingCustomer.phone.trim()) {
      alert('Phone number is required');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/customers/${editingCustomer.customer_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingCustomer),
      });

      if (response.ok) {
        setSelectedCustomer(editingCustomer);
        setCustomerHistory(prev => ({
          ...prev,
          customer: editingCustomer
        }));
        setEditMode(false);
        alert('Customer updated successfully!');
        loadCustomers(); // Refresh the customer list
      } else {
        const error = await response.json();
        alert('Error updating customer: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: Could not connect to server');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    const customerName = `${selectedCustomer.first_name} ${selectedCustomer.last_name}`;
    const vehicleCount = customerHistory?.vehicles?.length || 0;
    const workOrderCount = customerHistory?.workOrders?.length || 0;

    // Show confirmation dialog with details about what will be deleted
    let confirmMessage = `Are you sure you want to delete customer "${customerName}"?\n\n`;
    confirmMessage += 'This action cannot be undone and will permanently delete:\n';
    confirmMessage += `• Customer: ${customerName}\n`;
    if (vehicleCount > 0) {
      confirmMessage += `• ${vehicleCount} vehicle(s)\n`;
    }
    if (workOrderCount > 0) {
      confirmMessage += `• ${workOrderCount} work order(s)\n`;
    }
    confirmMessage += '\nType "DELETE" to confirm:';

    const userInput = prompt(confirmMessage);
    
    if (userInput !== 'DELETE') {
      if (userInput !== null) { // user didn't cancel
        alert('Customer deletion cancelled. You must type "DELETE" exactly to confirm.');
      }
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/customers/${selectedCustomer.customer_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Customer deleted successfully!\n\n` +
              `Deleted: ${result.deletedCustomer}\n` +
              `Vehicles removed: ${result.vehiclesDeleted}\n` +
              `Work orders removed: ${result.workOrdersDeleted}`);
        
        // Clear the current selection and refresh the customer list
        setSelectedCustomer(null);
        setCustomerHistory(null);
        setSearchTerm('');
        loadCustomers();
      } else {
        const error = await response.json();
        alert('Error deleting customer: ' + error.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: Could not connect to server');
    }
  };

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Estimate': return '#FFD329';
      case 'Approved': return '#4CAF50';
      case 'Started': return '#FF9800';
      case 'Complete': return '#2196F3';
      case 'Cancelled': return '#f44336';
      default: return '#ccc';
    }
  };

  const handleCreateWorkOrder = (vehicle = null) => {
    setSelectedVehicle(vehicle);
    setShowWorkOrderForm(true);
  };

  const handleWorkOrderCreated = (workOrderResult) => {
    alert(`Work order created successfully!\nWork Order ID: ${workOrderResult.work_order_id}`);
    setShowWorkOrderForm(false);
    setSelectedVehicle(null);
    // Refresh customer history to show new work order
    loadCustomerHistory(selectedCustomer.customer_id);
  };

  const handleCancelWorkOrder = () => {
    setShowWorkOrderForm(false);
    setSelectedVehicle(null);
  };

  const handleViewWorkOrder = (workOrderId) => {
    setSelectedWorkOrderId(workOrderId);
    setShowFullWorkOrderDetail(true);
  };

  const handleWorkOrderDeleted = (workOrderId) => {
    // Refresh customer history to reflect the deletion
    if (selectedCustomer) {
      loadCustomerHistory(selectedCustomer.customer_id);
    }
  };

  const handleCloseFullWorkOrderDetail = () => {
    setShowFullWorkOrderDetail(false);
    setSelectedWorkOrderId(null);
    // Refresh customer history to show updated work order status
    if (selectedCustomer) {
      loadCustomerHistory(selectedCustomer.customer_id);
    }
  };

  const handleStatusChanged = (workOrderId, newStatus) => {
    // Update the work order status in the local state immediately
    if (customerHistory) {
      const updatedWorkOrders = customerHistory.workOrders.map(wo => 
        wo.work_order_id === workOrderId 
          ? { ...wo, status: newStatus }
          : wo
      );
      setCustomerHistory({
        ...customerHistory,
        workOrders: updatedWorkOrders
      });
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
            Existing Customers
          </h2>
        </div>

        {/* Search Bar */}
        <div style={{
          backgroundColor: '#333',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Search Customers</h3>
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
            placeholder="Search by name, phone, email, or customer ID..."
          />
          
          {/* Search Results */}
          {filteredCustomers.length > 0 && (
            <div style={{
              marginTop: '15px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {filteredCustomers.map(customer => (
                <div
                  key={customer.customer_id}
                  onClick={() => loadCustomerHistory(customer.customer_id)}
                  style={{
                    padding: '15px',
                    backgroundColor: '#444',
                    border: '1px solid #666',
                    borderRadius: '5px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#555'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#444'}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    gap: '15px',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div style={{ color: '#ccc', fontSize: '14px' }}>
                        ID: {customer.customer_id}
                      </div>
                    </div>
                    <div style={{ color: '#ccc' }}>
                      {customer.phone}
                    </div>
                    <div style={{ color: '#ccc' }}>
                      {customer.email || 'No email'}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '12px' }}>
                      {customer.city && customer.state ? `${customer.city}, ${customer.state}` : 'No address'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Details */}
        {isLoading && (
          <div style={{
            textAlign: 'center',
            fontSize: '18px',
            color: '#FFD329',
            padding: '50px'
          }}>
            Loading customer information...
          </div>
        )}

        {customerHistory && !isLoading && (
          <div>
            {/* Customer Information */}
            <div style={{
              backgroundColor: '#333',
              padding: '25px',
              borderRadius: '10px',
              marginBottom: '30px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: 0, color: '#FFD329' }}>Customer Information</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {!editMode ? (
                    <>
                      <button
                        onClick={() => handleCreateWorkOrder()}
                        style={{
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          marginRight: '5px'
                        }}
                      >
                        🔧 Create Work Order
                      </button>
                      <button
                        onClick={handleEditCustomer}
                        style={{
                          backgroundColor: '#FFD329',
                          color: 'black',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          marginRight: '5px'
                        }}
                      >
                        ✏️ Edit Customer
                      </button>
                      <button
                        onClick={handleDeleteCustomer}
                        style={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#d32f2f'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#f44336'}
                      >
                        🗑️ Delete Customer
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveCustomer}
                        style={{
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setEditingCustomer(null);
                        }}
                        style={{
                          backgroundColor: '#666',
                          color: '#FFD329',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          border: '1px solid #888',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {!editMode ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px'
                }}>
                  <div>
                    <p><strong>Customer ID:</strong> {selectedCustomer.customer_id}</p>
                    <p><strong>Name:</strong> {selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                    <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                    <p><strong>Email:</strong> {selectedCustomer.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p><strong>Address:</strong></p>
                    <p style={{ marginLeft: '15px', color: '#ccc' }}>
                      {selectedCustomer.address || 'No address provided'}<br />
                      {selectedCustomer.city && selectedCustomer.state && (
                        `${selectedCustomer.city}, ${selectedCustomer.state} ${selectedCustomer.zip_code || ''}`
                      )}
                    </p>
                    <p><strong>Customer Since:</strong> {formatDate(selectedCustomer.created_at)}</p>
                  </div>
                </div>
              ) : (
                <form style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>First Name *</label>
                    <input
                      type="text"
                      value={editingCustomer.first_name}
                      onChange={(e) => setEditingCustomer(prev => ({...prev, first_name: e.target.value}))}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #666',
                        backgroundColor: '#444',
                        color: '#FFD329',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Last Name *</label>
                    <input
                      type="text"
                      value={editingCustomer.last_name}
                      onChange={(e) => setEditingCustomer(prev => ({...prev, last_name: e.target.value}))}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #666',
                        backgroundColor: '#444',
                        color: '#FFD329',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone *</label>
                    <input
                      type="tel"
                      value={editingCustomer.phone}
                      onChange={(e) => setEditingCustomer(prev => ({...prev, phone: e.target.value}))}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #666',
                        backgroundColor: '#444',
                        color: '#FFD329',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email *</label>
                    <input
                      type="email"
                      value={editingCustomer.email || ''}
                      onChange={(e) => setEditingCustomer(prev => ({...prev, email: e.target.value}))}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #666',
                        backgroundColor: '#444',
                        color: '#FFD329',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Address</label>
                    <input
                      type="text"
                      value={editingCustomer.address || ''}
                      onChange={(e) => setEditingCustomer(prev => ({...prev, address: e.target.value}))}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #666',
                        backgroundColor: '#444',
                        color: '#FFD329',
                        fontSize: '14px'
                      }}
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>City</label>
                    <input
                      type="text"
                      value={editingCustomer.city || ''}
                      onChange={(e) => setEditingCustomer(prev => ({...prev, city: e.target.value}))}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #666',
                        backgroundColor: '#444',
                        color: '#FFD329',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>State</label>
                      <input
                        type="text"
                        value={editingCustomer.state || ''}
                        onChange={(e) => setEditingCustomer(prev => ({...prev, state: e.target.value}))}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '5px',
                          border: '1px solid #666',
                          backgroundColor: '#444',
                          color: '#FFD329',
                          fontSize: '14px'
                        }}
                        maxLength="2"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ZIP</label>
                      <input
                        type="text"
                        value={editingCustomer.zip_code || ''}
                        onChange={(e) => setEditingCustomer(prev => ({...prev, zip_code: e.target.value}))}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '5px',
                          border: '1px solid #666',
                          backgroundColor: '#444',
                          color: '#FFD329',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Vehicles */}
            <div style={{
              backgroundColor: '#333',
              padding: '25px',
              borderRadius: '10px',
              marginBottom: '30px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: 0, color: '#FFD329' }}>Vehicles</h3>
                <button
                  onClick={() => navigate('/customer/add-vehicle', { 
                    state: { 
                      customerId: selectedCustomer.customer_id, 
                      customerName: `${selectedCustomer.first_name} ${selectedCustomer.last_name}` 
                    } 
                  })}
                  style={{
                    backgroundColor: '#FFD329',
                    color: 'black',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Add Vehicle
                </button>
              </div>

              {customerHistory.vehicles.length === 0 ? (
                <p style={{ color: '#ccc', fontStyle: 'italic' }}>No vehicles registered for this customer.</p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {customerHistory.vehicles.map(vehicle => (
                    <div
                      key={vehicle.vehicle_id}
                      style={{
                        backgroundColor: '#444',
                        padding: '15px',
                        borderRadius: '5px',
                        border: '1px solid #666'
                      }}
                    >
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        gap: '15px',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div style={{ color: '#ccc', fontSize: '14px' }}>
                            Vehicle ID: {vehicle.vehicle_id}
                          </div>
                        </div>
                        <div style={{ color: '#ccc' }}>
                          {vehicle.color && `${vehicle.color}`}
                          {vehicle.license_plate && <br />}
                          {vehicle.license_plate && `Plate: ${vehicle.license_plate}`}
                        </div>
                        <div style={{ color: '#ccc' }}>
                          {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : 'Mileage: N/A'}
                          {vehicle.vin && <br />}
                          {vehicle.vin && `VIN: ${vehicle.vin.slice(-4)}`}
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            onClick={() => handleCreateWorkOrder(vehicle)}
                            style={{
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            🔧 Work Order
                          </button>
                          <button
                            style={{
                              backgroundColor: '#666',
                              color: '#FFD329',
                              padding: '6px 12px',
                              fontSize: '12px',
                              border: '1px solid #888',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Repair History */}
            <div style={{
              backgroundColor: '#333',
              padding: '25px',
              borderRadius: '10px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: 0, color: '#FFD329' }}>Repair History</h3>
                {customerHistory.workOrders.length > 0 && (
                  <div style={{
                    color: '#ccc',
                    fontSize: '14px',
                    fontStyle: 'italic'
                  }}>
                    💡 Click on a work order to view details
                  </div>
                )}
              </div>
              
              {customerHistory.workOrders.length === 0 ? (
                <p style={{ color: '#ccc', fontStyle: 'italic' }}>No repair history for this customer.</p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {customerHistory.workOrders.map(order => (
                    <div
                      key={order.work_order_id}
                      onClick={() => handleViewWorkOrder(order.work_order_id)}
                      style={{
                        backgroundColor: '#444',
                        padding: '20px',
                        borderRadius: '5px',
                        border: '1px solid #666',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#555'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = '#444'}
                    >
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        gap: '20px',
                        alignItems: 'flex-start'
                      }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
                            Work Order #{order.work_order_id}
                          </div>
                          <div style={{ color: '#ccc', marginBottom: '5px' }}>
                            Vehicle: {order.vehicle_desc}
                          </div>
                          <div style={{ color: '#ccc', fontSize: '14px' }}>
                            Date: {formatDate(order.created_at)}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            backgroundColor: getStatusColor(order.status),
                            color: order.status === 'Estimate' ? 'black' : 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            width: 'fit-content'
                          }}>
                            {order.status}
                          </div>
                        </div>
                        <div style={{ color: '#ccc' }}>
                          Parts: {order.part_count || 0}<br />
                          Labor: {order.labor_count || 0}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFD329' }}>
                            {formatCurrency(order.total_cents)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#ccc' }}>
                            Tax: {formatCurrency(order.tax_cents)}
                          </div>
                        </div>
                      </div>
                      {order.notes && (
                        <div style={{
                          marginTop: '15px',
                          padding: '10px',
                          backgroundColor: '#555',
                          borderRadius: '4px',
                          color: '#ccc',
                          fontSize: '14px'
                        }}>
                          <strong>Notes:</strong> {order.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        
        {/* Full Work Order Detail Modal */}
        {showFullWorkOrderDetail && selectedWorkOrderId && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px'
          }}>
            <div style={{
              maxWidth: '1000px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <WorkOrderDetail
                workOrderId={selectedWorkOrderId}
                onClose={handleCloseFullWorkOrderDetail}
                onDeleted={handleWorkOrderDeleted}
                onStatusChanged={handleStatusChanged}
              />
            </div>
          </div>
        )}
        
        {/* Work Order Form */}
        {showWorkOrderForm && selectedCustomer && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            overflowY: 'auto'
          }}>
            <div style={{
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <WorkOrderForm 
                customerId={selectedCustomer.customer_id}
                vehicleId={selectedVehicle?.vehicle_id || ''}
                customerData={{
                  customer_id: selectedCustomer.customer_id,
                  first_name: selectedCustomer.first_name,
                  last_name: selectedCustomer.last_name,
                  phone: selectedCustomer.phone,
                  email: selectedCustomer.email
                }}
                vehicleData={selectedVehicle ? {
                  vehicle_id: selectedVehicle.vehicle_id,
                  year: selectedVehicle.year,
                  make: selectedVehicle.make,
                  model: selectedVehicle.model,
                  vin: selectedVehicle.vin,
                  license_plate: selectedVehicle.license_plate
                } : null}
                onWorkOrderCreated={handleWorkOrderCreated}
                onCancel={handleCancelWorkOrder}
                title={`Create Work Order for ${selectedCustomer.first_name} ${selectedCustomer.last_name}${selectedVehicle ? ` (${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model})` : ''}`}
              />
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default ExistingCustomer;