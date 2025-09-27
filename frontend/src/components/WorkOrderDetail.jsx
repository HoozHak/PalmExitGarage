import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

function WorkOrderDetail({ workOrderId, onClose, onDeleted, onStatusChanged }) {
  const [workOrderData, setWorkOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showCompletionEmailPrompt, setShowCompletionEmailPrompt] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  useEffect(() => {
    if (workOrderId) {
      loadWorkOrderDetails();
    }
  }, [workOrderId]);

  const loadWorkOrderDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/work-orders/${workOrderId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkOrderData(data);
      } else {
        setError('Failed to load work order details');
      }
    } catch (error) {
      console.error('Error loading work order:', error);
      setError('Network error: Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/work-orders/${workOrderId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        onDeleted && onDeleted(workOrderId);
        onClose();
      } else {
        const error = await response.json();
        alert('Error deleting work order: ' + error.message);
      }
    } catch (error) {
      console.error('Error deleting work order:', error);
      alert('Network error: Could not delete work order');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSendReceipt = async () => {
    if (!workOrderData.workOrder.email) {
      alert('Customer email not found. Please add an email address to the customer record first.');
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch(`${API_BASE}/email/send-receipt/${workOrderId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Receipt sent successfully to ${result.email}!`);
      } else {
        const error = await response.json();
        alert('Failed to send receipt: ' + error.error);
      }
    } catch (error) {
      console.error('Error sending receipt:', error);
      alert('Network error: Could not send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    // If status is changing to Complete and customer has email, show completion email prompt
    if (newStatus === 'Complete' && (workOrderData?.workOrder?.email || workOrderData?.workOrder?.customer_email)) {
      setPendingStatus(newStatus);
      setShowCompletionEmailPrompt(true);
      return;
    }
    
    // Otherwise, update status normally (including Complete when no email)
    await updateWorkOrderStatus(newStatus);
  };
  
  const updateWorkOrderStatus = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`${API_BASE}/work-orders/${workOrderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Reload work order data to show updated status
        loadWorkOrderDetails();
        alert(`Work order status updated to: ${newStatus}`);
        // Notify parent component that status has changed
        if (onStatusChanged) {
          onStatusChanged(workOrderId, newStatus);
        }
      } else {
        const error = await response.json();
        alert('Error updating status: ' + error.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Network error: Could not update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  const handleSendCompletionEmail = async () => {
    setIsSendingEmail(true);
    setShowCompletionEmailPrompt(false);
    
    try {
      // Send completion email
      const response = await fetch(`${API_BASE}/email/send-completion/${workOrderId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        // Update status after email is sent
        await updateWorkOrderStatus(pendingStatus);
        alert(`Completion email sent to ${result.email} and status updated to Complete!`);
      } else {
        const error = await response.json();
        // Still update status even if email fails
        await updateWorkOrderStatus(pendingStatus);
        alert(`Status updated to Complete, but failed to send email: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending completion email:', error);
      // Still update status even if email fails
      await updateWorkOrderStatus(pendingStatus);
      alert('Status updated to Complete, but there was a network error sending the email.');
    } finally {
      setIsSendingEmail(false);
      setPendingStatus(null);
    }
  };
  
  const handleSkipCompletionEmail = async () => {
    setShowCompletionEmailPrompt(false);
    // Just update status without sending email
    await updateWorkOrderStatus(pendingStatus);
    setPendingStatus(null);
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

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: '#333',
        borderRadius: '10px',
        padding: '40px',
        textAlign: 'center',
        color: '#FFD329'
      }}>
        <div style={{ fontSize: '18px' }}>Loading work order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#333',
        borderRadius: '10px',
        padding: '40px',
        textAlign: 'center',
        color: '#f44336'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '20px' }}>{error}</div>
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#666',
            color: '#FFD329',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    );
  }

  if (!workOrderData) {
    return null;
  }

  const { workOrder, parts, labor } = workOrderData;

  return (
    <div style={{
      backgroundColor: '#333',
      borderRadius: '10px',
      padding: '30px',
      maxHeight: '80vh',
      overflowY: 'auto',
      color: '#FFD329'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '25px'
      }}>
        <div>
          <h2 style={{
            margin: '0 0 10px 0',
            color: '#FFD329',
            fontSize: '24px'
          }}>
            Work Order #{workOrder.work_order_id}
          </h2>
          <div style={{
            backgroundColor: getStatusColor(workOrder.status),
            color: workOrder.status === 'Estimate' ? 'black' : 'white',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            width: 'fit-content',
            marginBottom: '10px'
          }}>
            {workOrder.status}
          </div>
          <div style={{ color: '#ccc', fontSize: '14px' }}>
            Created: {formatDate(workOrder.created_at)}
          </div>
          
          {/* Status Selector */}
          <div style={{ marginTop: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontSize: '14px', 
              fontWeight: 'bold',
              color: '#FFD329'
            }}>
              Change Status:
            </label>
            <select
              value={workOrder.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdatingStatus}
              style={{
                padding: '8px 12px',
                borderRadius: '5px',
                border: '1px solid #666',
                backgroundColor: '#555',
                color: '#FFD329',
                fontSize: '14px',
                cursor: isUpdatingStatus ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="Estimate">Estimate</option>
              <option value="Approved">Approved</option>
              <option value="Started">Started</option>
              <option value="Complete">Complete</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {isUpdatingStatus && (
              <div style={{ fontSize: '12px', color: '#ccc', marginTop: '5px' }}>
                Updating status...
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSendReceipt}
            disabled={isSendingEmail || !workOrderData.workOrder.email}
            style={{
              backgroundColor: isSendingEmail ? '#666' : '#4CAF50',
              color: 'white',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '5px',
              cursor: (isSendingEmail || !workOrderData.workOrder.email) ? 'not-allowed' : 'pointer',
              opacity: !workOrderData.workOrder.email ? 0.6 : 1
            }}
            title={!workOrderData.workOrder.email ? 'Customer email required' : 'Send receipt to customer'}
          >
            {isSendingEmail ? 'Sending...' : '📧 Send Receipt'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : '🗑️ Delete'}
          </button>
          <button
            onClick={onClose}
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
            ✕ Close
          </button>
        </div>
      </div>

      {/* Customer & Vehicle Info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '25px',
        marginBottom: '25px'
      }}>
        <div style={{
          backgroundColor: '#444',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#FFD329' }}>Customer Information</h3>
          <p><strong>Name:</strong> {workOrder.customer_name}</p>
          <p><strong>Phone:</strong> {workOrder.customer_phone}</p>
          {workOrder.customer_email && (
            <p><strong>Email:</strong> {workOrder.customer_email}</p>
          )}
        </div>
        <div style={{
          backgroundColor: '#444',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#FFD329' }}>Vehicle Information</h3>
          <p><strong>Vehicle:</strong> {workOrder.vehicle_desc}</p>
          {workOrder.license_plate && (
            <p><strong>License Plate:</strong> {workOrder.license_plate}</p>
          )}
          {workOrder.vin && (
            <p><strong>VIN:</strong> {workOrder.vin}</p>
          )}
          {workOrder.mileage && (
            <p><strong>Mileage:</strong> {workOrder.mileage.toLocaleString()} miles</p>
          )}
        </div>
      </div>

      {/* Parts Section */}
      {parts && parts.length > 0 && (
        <div style={{
          backgroundColor: '#444',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '25px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#FFD329' }}>Parts ({parts.length})</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {parts.map((part, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#555',
                  padding: '15px',
                  borderRadius: '5px',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  gap: '15px',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {part.brand} {part.item}
                  </div>
                  <div style={{ color: '#ccc', fontSize: '12px' }}>
                    Part #: {part.part_number}
                  </div>
                  {part.description && (
                    <div style={{ color: '#ccc', fontSize: '12px' }}>
                      {part.description}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  Qty: {part.quantity}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {formatCurrency(part.cost_cents)} each
                </div>
                <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  {formatCurrency(part.cost_cents * part.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Labor Section */}
      {labor && labor.length > 0 && (
        <div style={{
          backgroundColor: '#444',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '25px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#FFD329' }}>Labor ({labor.length})</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {labor.map((laborItem, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#555',
                  padding: '15px',
                  borderRadius: '5px',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  gap: '15px',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {laborItem.labor_name}
                  </div>
                  {laborItem.description && (
                    <div style={{ color: '#ccc', fontSize: '12px' }}>
                      {laborItem.description}
                    </div>
                  )}
                  {laborItem.estimated_time_hours && (
                    <div style={{ color: '#ccc', fontSize: '12px' }}>
                      Est. Time: {laborItem.estimated_time_hours}h
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  Qty: {laborItem.quantity}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {formatCurrency(laborItem.cost_cents)} each
                </div>
                <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  {formatCurrency(laborItem.cost_cents * laborItem.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals */}
      <div style={{
        backgroundColor: '#444',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '25px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#FFD329' }}>Totals</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '10px',
          fontSize: '16px'
        }}>
          <div>Subtotal:</div>
          <div style={{ fontWeight: 'bold' }}>
            {formatCurrency(workOrder.subtotal_cents)}
          </div>
          <div>Tax ({(workOrder.tax_rate * 100).toFixed(2)}%):</div>
          <div style={{ fontWeight: 'bold' }}>
            {formatCurrency(workOrder.tax_cents)}
          </div>
          <div style={{ 
            borderTop: '1px solid #666', 
            paddingTop: '10px',
            fontSize: '18px',
            color: '#FFD329'
          }}>
            Total:
          </div>
          <div style={{ 
            borderTop: '1px solid #666',
            paddingTop: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#FFD329'
          }}>
            {formatCurrency(workOrder.total_cents)}
          </div>
        </div>
      </div>

      {/* Notes */}
      {workOrder.notes && (
        <div style={{
          backgroundColor: '#444',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '25px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#FFD329' }}>Notes</h3>
          <div style={{ color: '#ccc', lineHeight: 1.5 }}>
            {workOrder.notes}
          </div>
        </div>
      )}

      {/* Signature Information */}
      {workOrder.signature_data && (
        <div style={{
          backgroundColor: '#444',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#FFD329' }}>Customer Signature</h3>
          
          {/* Signature Image */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #666',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <img 
              src={workOrder.signature_data}
              alt="Customer Signature"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: '4px'
              }}
            />
          </div>
          
          {/* Signature Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '15px',
            fontSize: '14px'
          }}>
            <div>
              <strong>Signed by:</strong><br />
              <span style={{ color: '#ccc' }}>{workOrder.customer_signature_name}</span>
            </div>
            <div>
              <strong>Signature Type:</strong><br />
              <span style={{ color: '#ccc' }}>
                {workOrder.signature_type === 'typed' ? '📝 Electronic Signature' : '✍️ Hand Drawn'}
              </span>
            </div>
            <div>
              <strong>Signed Date:</strong><br />
              <span style={{ color: '#ccc' }}>
                {workOrder.signed_date ? formatDate(workOrder.signed_date) : 'Not signed'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Completion Email Prompt Modal */}
      {showCompletionEmailPrompt && (
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
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#333',
            padding: '30px',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '500px',
            border: '2px solid #4CAF50'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>🎉</div>
            <h3 style={{ color: '#4CAF50', marginTop: 0, fontSize: '20px' }}>
              Work Order Complete!
            </h3>
            <p style={{ color: '#FFD329', marginBottom: '20px', lineHeight: '1.5' }}>
              Would you like to send a completion notification email to the customer?
            </p>
            <div style={{
              backgroundColor: '#444',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '25px',
              textAlign: 'left'
            }}>
              <div style={{ color: '#ccc', fontSize: '14px', marginBottom: '5px' }}>Customer:</div>
              <div style={{ color: '#FFD329', fontWeight: 'bold' }}>
                {workOrderData?.workOrder?.customer_name}
              </div>
              <div style={{ color: '#ccc', fontSize: '14px', marginTop: '8px' }}>Email:</div>
              <div style={{ color: '#FFD329' }}>
                {workOrderData?.workOrder?.email || workOrderData?.workOrder?.customer_email}
              </div>
            </div>
            <div style={{
              backgroundColor: '#2c3e50',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '25px',
              fontSize: '14px',
              color: '#ccc'
            }}>
              📧 The email will include:
              <ul style={{ margin: '10px 0', paddingLeft: '20px', textAlign: 'left' }}>
                <li>Completion notification with celebration message</li>
                <li>Complete work order receipt with all parts and labor</li>
                <li>Pickup instructions and payment details</li>
                <li>Thank you message from your shop</li>
              </ul>
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={handleSendCompletionEmail}
                disabled={isSendingEmail}
                style={{
                  backgroundColor: isSendingEmail ? '#666' : '#4CAF50',
                  color: 'white',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isSendingEmail ? 'not-allowed' : 'pointer'
                }}
              >
                {isSendingEmail ? 'Sending...' : '📧 Yes, Send Email'}
              </button>
              <button
                onClick={handleSkipCompletionEmail}
                disabled={isSendingEmail}
                style={{
                  backgroundColor: '#666',
                  color: '#FFD329',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: '1px solid #888',
                  borderRadius: '5px',
                  cursor: isSendingEmail ? 'not-allowed' : 'pointer'
                }}
              >
                No, Skip Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#333',
            padding: '30px',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <h3 style={{ color: '#f44336', marginTop: 0 }}>Confirm Deletion</h3>
            <p style={{ color: '#FFD329', marginBottom: '25px' }}>
              Are you sure you want to delete Work Order #{workOrder.work_order_id}? 
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                style={{
                  backgroundColor: '#666',
                  color: '#FFD329',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: '1px solid #888',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkOrderDetail;