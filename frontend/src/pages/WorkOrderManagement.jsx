import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';
import WorkOrderDetail from '../components/WorkOrderDetail.jsx';

const API_BASE = 'http://localhost:5000/api';

function WorkOrderManagement() {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCompletionEmailPrompt, setShowCompletionEmailPrompt] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    loadWorkOrders();
  }, []);

  useEffect(() => {
    let filtered = workOrders;

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(wo => wo.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm.length >= 2) {
      filtered = filtered.filter(wo =>
        wo.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.vehicle_desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.work_order_id.toString().includes(searchTerm)
      );
    }

    setFilteredWorkOrders(filtered);
  }, [searchTerm, statusFilter, workOrders]);

  const loadWorkOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/work-orders`);
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data);
        setFilteredWorkOrders(data);
      } else {
        setError('Failed to load work orders');
      }
    } catch (error) {
      console.error('Error loading work orders:', error);
      setError('Network error: Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkOrderDeleted = (workOrderId) => {
    setWorkOrders(workOrders.filter(wo => wo.work_order_id !== workOrderId));
    setSelectedWorkOrder(null);
  };

  const handleStatusUpdate = async (workOrderId, newStatus) => {
    // Special handling for Complete status - show email choice dialog
    if (newStatus === 'Complete') {
      const workOrder = workOrders.find(wo => wo.work_order_id === workOrderId);
      
      // Check if work order has customer email - if so, show email choice
      if (workOrder && workOrder.customer_name) {
        setPendingStatusChange({ workOrderId, newStatus, workOrder });
        setShowCompletionEmailPrompt(true);
        return;
      }
    }
    
    // For other statuses, update normally
    await updateWorkOrderStatusOnly(workOrderId, newStatus);
  };
  
  const updateWorkOrderStatusOnly = async (workOrderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/work-orders/${workOrderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update the work order in the list
        setWorkOrders(workOrders.map(wo => 
          wo.work_order_id === workOrderId 
            ? { ...wo, status: newStatus }
            : wo
        ));
        
        alert(`Work order status updated to: ${newStatus}`);
        return true;
      } else {
        const error = await response.json();
        alert('Error updating status: ' + (error.error || error.message));
        return false;
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Network error: Could not update status');
      return false;
    }
  };
  
  const handleSendCompletionEmail = async () => {
    if (!pendingStatusChange) return;
    
    setIsSendingEmail(true);
    setShowCompletionEmailPrompt(false);
    
    try {
      // First update the status
      const statusUpdated = await updateWorkOrderStatusOnly(pendingStatusChange.workOrderId, pendingStatusChange.newStatus);
      
      if (statusUpdated) {
        // Then send completion email
        const response = await fetch(`${API_BASE}/email/send-completion/${pendingStatusChange.workOrderId}`, {
          method: 'POST'
        });
        
        if (response.ok) {
          const result = await response.json();
          alert(
            `✅ Work Order #${pendingStatusChange.workOrderId} marked as Complete!\n\n` +
            `📧 Pickup notification email sent successfully!\n\n` +
            `The customer has been notified that their vehicle is ready for pickup.`
          );
        } else {
          const error = await response.json();
          alert(
            `✅ Work Order #${pendingStatusChange.workOrderId} marked as Complete!\n\n` +
            `⚠️ Email failed to send: ${error.error}\n\n` +
            `You may want to contact the customer directly about pickup.`
          );
        }
      }
    } catch (error) {
      console.error('Error sending completion email:', error);
      alert(
        `✅ Work Order #${pendingStatusChange.workOrderId} marked as Complete!\n\n` +
        `⚠️ Network error sending email.\n\n` +
        `You may want to contact the customer directly about pickup.`
      );
    } finally {
      setIsSendingEmail(false);
      setPendingStatusChange(null);
    }
  };
  
  const handleSkipCompletionEmail = async () => {
    if (!pendingStatusChange) return;
    
    setShowCompletionEmailPrompt(false);
    // Just update status without sending email
    const statusUpdated = await updateWorkOrderStatusOnly(pendingStatusChange.workOrderId, pendingStatusChange.newStatus);
    
    if (statusUpdated) {
      alert(
        `✅ Work Order #${pendingStatusChange.workOrderId} marked as Complete!\n\n` +
        `💬 No email sent - you may want to contact the customer directly about pickup.`
      );
    }
    
    setPendingStatusChange(null);
  };

  const handleDeleteWorkOrder = async (workOrderId) => {
    if (!confirm('Are you sure you want to delete this work order? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/work-orders/${workOrderId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setWorkOrders(workOrders.filter(wo => wo.work_order_id !== workOrderId));
        alert('Work order deleted successfully!');
      } else {
        const error = await response.json();
        alert('Error deleting work order: ' + error.message);
      }
    } catch (error) {
      console.error('Error deleting work order:', error);
      alert('Network error: Could not delete work order');
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

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: 'black',
        minHeight: '100vh',
        color: '#FFD329'
      }}>
        <Navigation />
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontSize: '18px'
        }}>
          Loading work orders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: 'black',
        minHeight: '100vh',
        color: '#FFD329'
      }}>
        <Navigation />
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#f44336'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '20px' }}>{error}</div>
          <button
            onClick={loadWorkOrders}
            style={{
              backgroundColor: '#666',
              color: '#FFD329',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'black',
      minHeight: '100vh',
      color: '#FFD329'
    }}>
      <Navigation />
      <div style={{ padding: '20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
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
              Work Order Management
            </h2>
            <button
              onClick={() => navigate('/estimate')}
              style={{
                backgroundColor: '#FFD329',
                color: 'black',
                padding: '10px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              + Create New Estimate
            </button>
          </div>

          {/* Filters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '20px',
            backgroundColor: '#333',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Search Work Orders
              </label>
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
                placeholder="Search by customer name, vehicle, or work order ID..."
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
                <option value="">All Statuses</option>
                <option value="Estimate">Estimate</option>
                <option value="Approved">Approved</option>
                <option value="Started">Started</option>
                <option value="Complete">Complete</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Work Orders List */}
          <div style={{
            backgroundColor: '#333',
            padding: '25px',
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#FFD329' }}>
              Work Orders ({filteredWorkOrders.length} {filteredWorkOrders.length === 1 ? 'order' : 'orders'})
            </h3>
            
            {filteredWorkOrders.length === 0 ? (
              <p style={{ color: '#ccc', fontStyle: 'italic', textAlign: 'center', padding: '40px' }}>
                {searchTerm || statusFilter ? 'No work orders found matching your criteria.' : 'No work orders found.'}
              </p>
            ) : (
              <div>
                {/* Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 2fr 1fr 1fr 1fr 1fr 200px',
                  gap: '15px',
                  padding: '15px',
                  backgroundColor: '#444',
                  borderRadius: '5px',
                  marginBottom: '15px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: '#FFD329'
                }}>
                  <div>ID</div>
                  <div>CUSTOMER & VEHICLE</div>
                  <div>STATUS</div>
                  <div>CREATED</div>
                  <div>TOTAL</div>
                  <div>QUICK STATUS</div>
                  <div>ACTIONS</div>
                </div>

                {/* Work Orders List */}
                <div style={{ display: 'grid', gap: '10px' }}>
                  {filteredWorkOrders.map(workOrder => (
                    <div
                      key={workOrder.work_order_id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 2fr 1fr 1fr 1fr 1fr 200px',
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
                      <div style={{ fontWeight: 'bold', color: '#FFD329' }}>
                        #{workOrder.work_order_id}
                      </div>
                      
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                          {workOrder.customer_name}
                        </div>
                        <div style={{ color: '#ccc', fontSize: '14px' }}>
                          {workOrder.vehicle_desc}
                        </div>
                      </div>
                      
                      <div>
                        <span style={{
                          backgroundColor: getStatusColor(workOrder.status),
                          color: workOrder.status === 'Estimate' ? 'black' : 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {workOrder.status}
                        </span>
                      </div>
                      
                      <div style={{ color: '#ccc', fontSize: '14px' }}>
                        {formatDate(workOrder.created_at)}
                      </div>
                      
                      <div style={{ fontWeight: 'bold', color: '#FFD329' }}>
                        {formatCurrency(workOrder.total_cents)}
                      </div>
                      
                      <div>
                        <select
                          value={workOrder.status}
                          onChange={(e) => handleStatusUpdate(workOrder.work_order_id, e.target.value)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: '1px solid #666',
                            backgroundColor: '#555',
                            color: '#FFD329',
                            fontSize: '12px',
                            width: '100%'
                          }}
                        >
                          <option value="Estimate">Estimate</option>
                          <option value="Approved">Approved</option>
                          <option value="Started">Started</option>
                          <option value="Complete">Complete</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedWorkOrder(workOrder.work_order_id)}
                          style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            padding: '6px 12px',
                            fontSize: '12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#45a049'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = '#4CAF50'}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteWorkOrder(workOrder.work_order_id)}
                          style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            padding: '6px 12px',
                            fontSize: '12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#da190b'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = '#f44336'}
                        >
                          Delete
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
            <strong>Note:</strong> Use the status dropdown for quick status changes, or click "View" for detailed work order management including full status change history and detailed editing options.
          </div>
        </div>
      </div>

      {/* Completion Email Prompt Modal */}
      {showCompletionEmailPrompt && pendingStatusChange && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#222',
            borderRadius: '10px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            border: '2px solid #FFD329'
          }}>
            <h3 style={{
              color: '#FFD329',
              marginTop: 0,
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Work Order Complete
            </h3>
            
            <div style={{
              color: '#fff',
              marginBottom: '25px',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              <p style={{ margin: '0 0 10px 0' }}>
                Work Order <strong>#{pendingStatusChange.workOrderId}</strong> for <strong>{pendingStatusChange.workOrder?.customer_name}</strong> is ready to be marked as Complete.
              </p>
              <p style={{ margin: '10px 0 0 0', color: '#ccc' }}>
                Would you like to send a pickup notification email to the customer?
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleSendCompletionEmail}
                disabled={isSendingEmail}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSendingEmail ? 'wait' : 'pointer',
                  opacity: isSendingEmail ? 0.7 : 1,
                  minWidth: '140px'
                }}
              >
                {isSendingEmail ? '📧 Sending...' : '📧 Send Email'}
              </button>
              
              <button
                onClick={handleSkipCompletionEmail}
                disabled={isSendingEmail}
                style={{
                  backgroundColor: '#666',
                  color: 'white',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSendingEmail ? 'wait' : 'pointer',
                  opacity: isSendingEmail ? 0.7 : 1,
                  minWidth: '140px'
                }}
              >
                Skip Email
              </button>
            </div>
            
            <div style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#333',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#ccc',
              textAlign: 'center'
            }}>
              💡 Tip: The email will notify the customer that their vehicle is ready for pickup and include shop contact information.
            </div>
          </div>
        </div>
      )}

      {/* Work Order Detail Modal */}
      {selectedWorkOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#222',
            borderRadius: '10px',
            padding: '20px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <WorkOrderDetail
              workOrderId={selectedWorkOrder}
              onClose={() => setSelectedWorkOrder(null)}
              onDeleted={handleWorkOrderDeleted}
              onStatusChanged={(workOrderId, newStatus) => {
                // Update the work order status in the list immediately
                setWorkOrders(workOrders.map(wo => 
                  wo.work_order_id === workOrderId 
                    ? { ...wo, status: newStatus }
                    : wo
                ));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkOrderManagement;