import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from './SignaturePad.jsx';

const API_BASE = 'http://localhost:5000/api';

function WorkOrderSignature({ workOrderData, customerData, vehicleData }) {
  const [signature, setSignature] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    // Pre-fill customer name
    if (customerData) {
      setCustomerName(`${customerData.first_name} ${customerData.last_name}`);
    }
  }, [customerData]);

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSignatureChange = (signatureData) => {
    setSignature(signatureData);
  };

  const handleSubmitSignedWorkOrder = async () => {
    if (!signature) {
      alert('Please provide your signature before submitting.');
      return;
    }

    if (!customerName.trim()) {
      alert('Please enter your printed name.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update the work order with signature data
      const response = await fetch(`${API_BASE}/work-orders/${workOrderData.work_order_id}/signature`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature_data: signature,
          customer_signature_name: customerName.trim(),
          status: 'approved',
          signed_date: new Date().toISOString()
        }),
      });

      if (response.ok) {
        alert('Work order signed successfully! You will receive a copy for your records.');
        // Close the window
        window.close();
      } else {
        const error = await response.json();
        alert('Error saving signature: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: Could not save signature');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      backgroundColor: 'white',
      color: 'black',
      padding: '30px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.4'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        borderBottom: '3px solid #FFD329',
        paddingBottom: '20px'
      }}>
        <h1 style={{ 
          color: '#000', 
          margin: '0 0 10px 0',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          🏁 PALM EXIT GARAGE
        </h1>
        <p style={{ 
          margin: 0, 
          fontSize: '16px',
          color: '#333'
        }}>
          Professional Auto Repair Services
        </p>
      </div>

      {/* Work Order Details */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          color: '#000', 
          borderBottom: '2px solid #FFD329',
          paddingBottom: '10px',
          marginBottom: '20px'
        }}>
          Work Order #{workOrderData.work_order_id}
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          marginBottom: '20px'
        }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Customer Information</h3>
            <p><strong>Name:</strong> {customerData?.first_name} {customerData?.last_name}</p>
            <p><strong>Phone:</strong> {customerData?.phone}</p>
            <p><strong>Email:</strong> {customerData?.email || 'Not provided'}</p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Vehicle Information</h3>
            <p><strong>Vehicle:</strong> {vehicleData?.year} {vehicleData?.make} {vehicleData?.model}</p>
            <p><strong>VIN:</strong> {vehicleData?.vin || 'Not provided'}</p>
            <p><strong>License Plate:</strong> {vehicleData?.license_plate || 'Not provided'}</p>
          </div>
        </div>
        
        <p><strong>Date:</strong> {formatDate()}</p>
      </div>

      {/* Work Order Items */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          color: '#333',
          borderBottom: '1px solid #ccc',
          paddingBottom: '10px'
        }}>
          Services & Parts
        </h3>
        
        {workOrderData.parts && workOrderData.parts.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#666', margin: '10px 0' }}>Parts:</h4>
            {workOrderData.parts.map((part, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '5px 0',
                borderBottom: '1px solid #eee'
              }}>
                <span>{part.brand} - {part.item} (Qty: {part.quantity})</span>
                <span>{formatCurrency(part.cost_cents * part.quantity)}</span>
              </div>
            ))}
          </div>
        )}

        {workOrderData.labor && workOrderData.labor.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#666', margin: '10px 0' }}>Labor:</h4>
            {workOrderData.labor.map((laborItem, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '5px 0',
                borderBottom: '1px solid #eee'
              }}>
                <span>{laborItem.labor_name} ({laborItem.quantity} hrs)</span>
                <span>{formatCurrency(laborItem.cost_cents * laborItem.quantity)}</span>
              </div>
            ))}
          </div>
        )}

        {workOrderData.notes && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#666', margin: '10px 0' }}>Notes:</h4>
            <p style={{
              backgroundColor: '#f9f9f9',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
              {workOrderData.notes}
            </p>
          </div>
        )}

        {/* Cost Summary */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
          border: '1px solid #ddd'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Subtotal:</span>
            <strong>{formatCurrency(workOrderData.subtotal_cents)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Tax:</span>
            <strong>{formatCurrency(workOrderData.tax_cents)}</strong>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '18px',
            fontWeight: 'bold',
            paddingTop: '10px',
            borderTop: '2px solid #FFD329'
          }}>
            <span>TOTAL:</span>
            <span>{formatCurrency(workOrderData.total_cents)}</span>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div style={{
        backgroundColor: '#fff9e6',
        border: '2px solid #FFD329',
        padding: '20px',
        marginBottom: '30px',
        borderRadius: '8px'
      }}>
        <h3 style={{
          color: '#000',
          marginTop: 0,
          marginBottom: '15px',
          textAlign: 'center',
          fontSize: '18px'
        }}>
          Work Order Acknowledgment & Liability Release
        </h3>
        
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p>By signing this Work Order, I acknowledge and agree to the following:</p>
          
          <p>• I authorize Palm Exit Garage and its technicians to perform the repairs and/or services listed on this Work Order.</p>
          
          <p>• I accept full responsibility for all parts, labor, fees, and related charges associated with these repairs and agree to pay in full upon completion of service.</p>
          
          <p>• I understand that Palm Exit Garage has made no guarantee, express or implied, regarding the future performance, reliability, or longevity of the repaired vehicle, parts, or related systems.</p>
          
          <p>• I acknowledge that Palm Exit Garage and its employees shall not be held liable for any subsequent mechanical, electrical, or structural issues that arise after the completion of the authorized repairs.</p>
          
          <p>• I release Palm Exit Garage and its employees from any claims, damages, or liabilities that may arise after the vehicle is returned to me, whether related or unrelated to the services performed.</p>
          
          <p>• I understand that additional repairs or services not listed here will require separate authorization and may involve additional charges.</p>
          
          <p style={{ fontWeight: 'bold', marginTop: '15px' }}>
            By signing below, I confirm that I have read, understood, and agree to the terms stated above.
          </p>
        </div>
      </div>

      {/* Signature Section */}
      <div style={{
        backgroundColor: '#f9f9f9',
        border: '2px solid #333',
        padding: '25px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3 style={{ 
          marginTop: 0, 
          marginBottom: '20px',
          textAlign: 'center',
          color: '#000'
        }}>
          Customer Signature Required
        </h3>
        
        {/* Printed Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            📌 Printed Name:
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '2px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
            placeholder="Please enter your full name"
          />
        </div>

        {/* Signature Pad */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '15px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            📌 Signature:
          </label>
          <div style={{ display: 'inline-block' }}>
            <SignaturePad
              ref={signaturePadRef}
              onSignatureChange={handleSignatureChange}
              width={500}
              height={150}
              penColor="#000"
              penWidth={2}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          marginTop: '20px'
        }}>
          <button
            onClick={handlePrint}
            style={{
              backgroundColor: '#666',
              color: 'white',
              padding: '12px 25px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🖨️ Print Work Order
          </button>
          
          <button
            onClick={handleSubmitSignedWorkOrder}
            disabled={isSubmitting || !signature || !customerName.trim()}
            style={{
              backgroundColor: isSubmitting || !signature || !customerName.trim() ? '#ccc' : '#4CAF50',
              color: 'white',
              padding: '12px 25px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '5px',
              cursor: isSubmitting || !signature || !customerName.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? '⏳ Submitting...' : '✅ Submit Signed Work Order'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: '#666',
        borderTop: '1px solid #ddd',
        paddingTop: '15px'
      }}>
        <p>Palm Exit Garage - Professional Auto Repair Services</p>
        <p>Thank you for choosing our services!</p>
      </div>
    </div>
  );
}

export default WorkOrderSignature;