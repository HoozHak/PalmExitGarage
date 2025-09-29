import React, { useState, useEffect } from 'react';
import { getWorkOrderTimestamp } from '../utils/timeSettings.js';

const API_BASE = 'http://localhost:5000/api';

function WorkOrderForm({ customerId, vehicleId, customerData, vehicleData, onWorkOrderCreated, onCancel, title = "Add Repair/Work Order" }) {
  const [parts, setParts] = useState([]);
  const [labor, setLabor] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [workOrder, setWorkOrder] = useState({
    customer_id: customerId || '',
    vehicle_id: vehicleId || '',
    parts: [], // { part_id, quantity, cost_cents }
    labor: [], // { labor_id, quantity, cost_cents }
    tax_rate: 0.0825, // Default, will be loaded from settings
    notes: ''
  });
  const [taxSettings, setTaxSettings] = useState(null);

  const [selectedParts, setSelectedParts] = useState([{ part_id: '', quantity: 1 }]);
  const [selectedLabor, setSelectedLabor] = useState([{ labor_id: '', quantity: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Load parts, labor, customer vehicles, and tax settings on component mount
  useEffect(() => {
    loadParts();
    loadLabor();
    loadTaxSettings();
    if (customerId && !vehicleId) {
      loadCustomerVehicles();
    }
  }, []);

  // Update work order when customer or vehicle changes
  useEffect(() => {
    setWorkOrder(prev => ({
      ...prev,
      customer_id: customerId || '',
      vehicle_id: vehicleId || ''
    }));
  }, [customerId, vehicleId]);
  
  // Listen for messages from signature window
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'WORK_ORDER_COMPLETED' && event.data.success) {
        // Work order was successfully created and signed
        if (onWorkOrderCreated) {
          onWorkOrderCreated({ work_order_id: event.data.workOrderId });
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onWorkOrderCreated]);

  const loadParts = async () => {
    try {
      const response = await fetch(`${API_BASE}/parts`);
      if (response.ok) {
        const data = await response.json();
        setParts(data.filter(part => part.in_stock)); // Only show in-stock parts
      }
    } catch (error) {
      console.error('Error loading parts:', error);
    }
  };

  const loadLabor = async () => {
    try {
      const response = await fetch(`${API_BASE}/labor`);
      if (response.ok) {
        const data = await response.json();
        setLabor(data);
      }
    } catch (error) {
      console.error('Error loading labor:', error);
    }
  };

  const loadTaxSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/settings/tax`);
      if (response.ok) {
        const data = await response.json();
        setTaxSettings(data);
        // Update work order with current tax rate
        setWorkOrder(prev => ({
          ...prev,
          tax_rate: data.tax_rate
        }));
      }
    } catch (error) {
      console.error('Error loading tax settings:', error);
      // Keep default tax rate if loading fails
    }
  };

  const loadCustomerVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE}/customers/${customerId}/vehicles`);
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error('Error loading customer vehicles:', error);
    }
  };

  const handleNotesChange = (e) => {
    setWorkOrder(prev => ({
      ...prev,
      notes: e.target.value
    }));
  };

  const handleTaxRateChange = (e) => {
    setWorkOrder(prev => ({
      ...prev,
      tax_rate: parseFloat(e.target.value) || 0
    }));
  };

  const handleVehicleChange = (e) => {
    setWorkOrder(prev => ({
      ...prev,
      vehicle_id: e.target.value
    }));
  };

  const addPartRow = () => {
    setSelectedParts([...selectedParts, { part_id: '', quantity: 1 }]);
  };

  const removePartRow = (index) => {
    setSelectedParts(selectedParts.filter((_, i) => i !== index));
  };

  const updatePartRow = (index, field, value) => {
    const updated = [...selectedParts];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedParts(updated);
  };

  const addLaborRow = () => {
    setSelectedLabor([...selectedLabor, { labor_id: '', quantity: 1 }]);
  };

  const removeLaborRow = (index) => {
    setSelectedLabor(selectedLabor.filter((_, i) => i !== index));
  };

  const updateLaborRow = (index, field, value) => {
    const updated = [...selectedLabor];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedLabor(updated);
  };

  const getPartById = (partId) => {
    return parts.find(p => p.part_id.toString() === partId.toString());
  };

  const getLaborById = (laborId) => {
    return labor.find(l => l.labor_id.toString() === laborId.toString());
  };

  const calculateTotals = () => {
    let partsTotal = 0;
    let laborTotal = 0;

    selectedParts.forEach(selectedPart => {
      if (selectedPart.part_id && selectedPart.quantity) {
        const part = getPartById(selectedPart.part_id);
        if (part) {
          partsTotal += part.cost_cents * parseInt(selectedPart.quantity);
        }
      }
    });

    selectedLabor.forEach(selectedLaborItem => {
      if (selectedLaborItem.labor_id && selectedLaborItem.quantity) {
        const laborItem = getLaborById(selectedLaborItem.labor_id);
        if (laborItem) {
          laborTotal += laborItem.labor_cost_cents * parseFloat(selectedLaborItem.quantity);
        }
      }
    });

    const subtotal = partsTotal + laborTotal;
    const tax = Math.round(subtotal * workOrder.tax_rate);
    const total = subtotal + tax;

    return {
      partsTotal,
      laborTotal,
      subtotal,
      tax,
      total
    };
  };

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!workOrder.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }

    if (!workOrder.vehicle_id) {
      newErrors.vehicle_id = 'Vehicle is required';
    }

    const validParts = selectedParts.filter(p => p.part_id && p.quantity);
    const validLabor = selectedLabor.filter(l => l.labor_id && l.quantity);

    if (validParts.length === 0 && validLabor.length === 0) {
      newErrors.items = 'At least one part or labor item is required';
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare parts data
      const partsData = selectedParts
        .filter(p => p.part_id && p.quantity)
        .map(p => {
          const part = getPartById(p.part_id);
          return {
            part_id: p.part_id,
            quantity: parseInt(p.quantity),
            cost_cents: part.cost_cents,
            brand: part.brand,
            item: part.item
          };
        });

      // Prepare labor data
      const laborData = selectedLabor
        .filter(l => l.labor_id && l.quantity)
        .map(l => {
          const laborItem = getLaborById(l.labor_id);
          return {
            labor_id: l.labor_id,
            quantity: parseFloat(l.quantity),
            cost_cents: laborItem.labor_cost_cents,
            labor_name: laborItem.labor_name
          };
        });

      // Calculate totals
      const totalsData = calculateTotals();
      
      // Get custom timestamp if time settings are configured
      const timeInfo = getWorkOrderTimestamp();
      
      // Prepare data for signature window (NO work order ID yet)
      const signatureData = {
        workOrderData: {
          work_order_id: null, // Will be set after signature
          customer_id: workOrder.customer_id,
          vehicle_id: workOrder.vehicle_id,
          parts: partsData,
          labor: laborData,
          tax_rate: workOrder.tax_rate,
          notes: workOrder.notes,
          custom_timestamp: timeInfo.timestamp,
          timezone_info: timeInfo.timezoneInfo,
          display_time: timeInfo.displayTime,
          subtotal_cents: totalsData.subtotal,
          tax_cents: totalsData.tax,
          total_cents: totalsData.total
        },
        customerData: customerData || {
          customer_id: workOrder.customer_id,
          first_name: 'Customer',
          last_name: '',
          phone: '',
          email: ''
        },
        vehicleData: vehicleData || (workOrder.vehicle_id ? {
          vehicle_id: workOrder.vehicle_id,
          year: '',
          make: '',
          model: ''
        } : null)
      };
      
      // Open signature window FIRST (before creating work order)
      openSignatureWindow(signatureData);
      
      // Reset form after signature window opens
      setSelectedParts([{ part_id: '', quantity: 1 }]);
      setSelectedLabor([{ labor_id: '', quantity: 1 }]);
      setWorkOrder(prev => ({ ...prev, notes: '' }));
      setErrors({});

    } catch (error) {
      console.error('Error:', error);
      alert('Error preparing work order: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSignatureWindow = (signatureData) => {
    // Encode signature data for URL parameter
    const encodedData = encodeURIComponent(JSON.stringify(signatureData));
    
    // Open the standalone signature page immediately (no delay to avoid popup blocker)
    const signatureWindow = window.open(
      `/work-order-signature.html?data=${encodedData}`,
      'WorkOrderSignature',
      'width=900,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,status=no'
    );
    
    // Focus the signature window
    if (signatureWindow) {
      signatureWindow.focus();
    } else {
      alert('Please allow pop-ups for this site to open the signature window.');
    }
  };

  const totals = calculateTotals();

  return (
    <div style={{
      padding: '25px',
      backgroundColor: '#444',
      borderRadius: '10px',
      border: '2px solid #FFD329',
      marginBottom: '20px'
    }}>
      <h3 style={{
        marginTop: 0,
        marginBottom: '25px',
        color: '#FFD329',
        fontSize: '22px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>🔧 {title}</span>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#666',
              color: '#FFD329',
              padding: '8px 15px',
              fontSize: '14px',
              border: '1px solid #888',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        )}
      </h3>

      {/* Error Messages */}
      {Object.keys(errors).length > 0 && (
        <div style={{
          backgroundColor: '#660000',
          color: '#ffcccc',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {Object.values(errors).map((error, index) => (
            <div key={index}>• {error}</div>
          ))}
        </div>
      )}

      {/* Vehicle Selection - Only show if no vehicle is pre-selected */}
      {!vehicleId && customerId && (
        <div style={{
          backgroundColor: '#333',
          padding: '20px',
          borderRadius: '10px',
          border: '2px solid #FFD329',
          marginBottom: '25px'
        }}>
          <h4 style={{ margin: 0, marginBottom: '15px', color: '#FFD329' }}>🚗 Select Vehicle</h4>
          <select
            value={workOrder.vehicle_id}
            onChange={handleVehicleChange}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '5px',
              border: errors.vehicle_id ? '2px solid #ff4444' : '1px solid #666',
              backgroundColor: '#444',
              color: '#FFD329',
              fontSize: '16px'
            }}
          >
            <option value="">Select a vehicle...</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                {vehicle.year} {vehicle.make} {vehicle.model}
                {vehicle.license_plate && ` (${vehicle.license_plate})`}
                {vehicle.vin && ` - VIN: ...${vehicle.vin.slice(-4)}`}
              </option>
            ))}
          </select>
          {errors.vehicle_id && (
            <div style={{
              color: '#ff4444',
              fontSize: '14px',
              marginTop: '8px',
              fontWeight: 'bold'
            }}>
              {errors.vehicle_id}
            </div>
          )}
          {vehicles.length === 0 && (
            <p style={{
              color: '#ccc',
              fontSize: '14px',
              marginTop: '10px',
              fontStyle: 'italic'
            }}>
              No vehicles found for this customer. Please add a vehicle first.
            </p>
          )}
        </div>
      )}

      {/* Parts Selection */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h4 style={{ margin: 0, color: '#FFD329' }}>Parts Needed</h4>
          <button
            onClick={addPartRow}
            style={{
              backgroundColor: '#FFD329',
              color: 'black',
              padding: '8px 15px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            + Add Part
          </button>
        </div>

        {selectedParts.map((selectedPart, index) => (
          <div key={index} style={{
            display: 'grid',
            gridTemplateColumns: '3fr 1fr 1fr 80px',
            gap: '15px',
            marginBottom: '10px',
            alignItems: 'center'
          }}>
            <select
              value={selectedPart.part_id}
              onChange={(e) => updatePartRow(index, 'part_id', e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #666',
                backgroundColor: '#333',
                color: '#FFD329',
                fontSize: '14px'
              }}
            >
              <option value="">Select Part...</option>
              {parts.map(part => (
                <option key={part.part_id} value={part.part_id}>
                  {part.brand} - {part.item} ({formatCurrency(part.cost_cents)})
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={selectedPart.quantity}
              onChange={(e) => updatePartRow(index, 'quantity', e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #666',
                backgroundColor: '#333',
                color: '#FFD329',
                fontSize: '14px'
              }}
              placeholder="Qty"
            />

            <div style={{
              padding: '10px',
              backgroundColor: '#555',
              borderRadius: '5px',
              textAlign: 'center',
              color: '#FFD329',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {selectedPart.part_id && selectedPart.quantity ? 
                formatCurrency(getPartById(selectedPart.part_id)?.cost_cents * parseInt(selectedPart.quantity) || 0) : 
                '$0.00'
              }
            </div>

            <button
              onClick={() => removePartRow(index)}
              disabled={selectedParts.length === 1}
              style={{
                backgroundColor: selectedParts.length === 1 ? '#555' : '#cc4444',
                color: selectedParts.length === 1 ? '#999' : 'white',
                padding: '10px',
                fontSize: '12px',
                border: 'none',
                borderRadius: '5px',
                cursor: selectedParts.length === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Labor Selection */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h4 style={{ margin: 0, color: '#FFD329' }}>Labor Required</h4>
          <button
            onClick={addLaborRow}
            style={{
              backgroundColor: '#FFD329',
              color: 'black',
              padding: '8px 15px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            + Add Labor
          </button>
        </div>

        {selectedLabor.map((selectedLaborItem, index) => (
          <div key={index} style={{
            display: 'grid',
            gridTemplateColumns: '3fr 1fr 1fr 80px',
            gap: '15px',
            marginBottom: '10px',
            alignItems: 'center'
          }}>
            <select
              value={selectedLaborItem.labor_id}
              onChange={(e) => updateLaborRow(index, 'labor_id', e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #666',
                backgroundColor: '#333',
                color: '#FFD329',
                fontSize: '14px'
              }}
            >
              <option value="">Select Labor...</option>
              {labor.map(laborItem => (
                <option key={laborItem.labor_id} value={laborItem.labor_id}>
                  {laborItem.labor_name} - {laborItem.category} ({formatCurrency(laborItem.labor_cost_cents)})
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0.25"
              step="0.25"
              value={selectedLaborItem.quantity}
              onChange={(e) => updateLaborRow(index, 'quantity', e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #666',
                backgroundColor: '#333',
                color: '#FFD329',
                fontSize: '14px'
              }}
              placeholder="Hours"
            />

            <div style={{
              padding: '10px',
              backgroundColor: '#555',
              borderRadius: '5px',
              textAlign: 'center',
              color: '#FFD329',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {selectedLaborItem.labor_id && selectedLaborItem.quantity ? 
                formatCurrency(getLaborById(selectedLaborItem.labor_id)?.labor_cost_cents * parseFloat(selectedLaborItem.quantity) || 0) : 
                '$0.00'
              }
            </div>

            <button
              onClick={() => removeLaborRow(index)}
              disabled={selectedLabor.length === 1}
              style={{
                backgroundColor: selectedLabor.length === 1 ? '#555' : '#cc4444',
                color: selectedLabor.length === 1 ? '#999' : 'white',
                padding: '10px',
                fontSize: '12px',
                border: 'none',
                borderRadius: '5px',
                cursor: selectedLabor.length === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Notes and Totals */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '25px',
        marginBottom: '25px'
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#FFD329'
          }}>
            Repair Notes
          </label>
          <textarea
            value={workOrder.notes}
            onChange={handleNotesChange}
            rows="6"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '5px',
              border: '1px solid #666',
              backgroundColor: '#333',
              color: '#FFD329',
              fontSize: '14px',
              resize: 'vertical'
            }}
            placeholder="Describe the repairs, diagnosis, customer concerns, etc..."
          />
        </div>

        <div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#FFD329'
            }}>
              Tax Rate
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              max="1"
              value={workOrder.tax_rate}
              onChange={handleTaxRateChange}
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

          <div style={{
            padding: '15px',
            backgroundColor: '#555',
            borderRadius: '5px',
            border: '1px solid #666'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              <span>Parts:</span>
              <strong>{formatCurrency(totals.partsTotal)}</strong>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              <span>Labor:</span>
              <strong>{formatCurrency(totals.laborTotal)}</strong>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '14px',
              paddingBottom: '8px',
              borderBottom: '1px solid #666'
            }}>
              <span>Subtotal:</span>
              <strong>{formatCurrency(totals.subtotal)}</strong>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              <span>Tax:</span>
              <strong>{formatCurrency(totals.tax)}</strong>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#FFD329',
              paddingTop: '8px',
              borderTop: '2px solid #FFD329'
            }}>
              <span>TOTAL:</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            backgroundColor: isSubmitting ? '#666' : '#FFD329',
            color: isSubmitting ? '#ccc' : 'black',
            padding: '15px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Creating Work Order...' : 'Submit Repair Order'}
        </button>
      </div>
    </div>
  );
}

export default WorkOrderForm;