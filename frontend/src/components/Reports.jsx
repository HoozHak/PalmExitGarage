import React, { useState, useEffect } from 'react';
import Navigation from './Navigation.jsx';

const API_BASE = 'http://localhost:5000/api';

function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  const [reportTypes, setReportTypes] = useState({
    partsProfit: false,
    laborProfit: false,
    caTaxInfo: false
  });
  
  const [emailAddress, setEmailAddress] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Set default date range to current month
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setDateRange({
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    });
  }, []);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReportTypeChange = (e) => {
    const { name, checked } = e.target;
    setReportTypes(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateForm = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      alert('Please select both start and end dates.');
      return false;
    }
    
    if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
      alert('Start date must be before end date.');
      return false;
    }
    
    if (!reportTypes.partsProfit && !reportTypes.laborProfit && !reportTypes.caTaxInfo) {
      alert('Please select at least one report type.');
      return false;
    }
    
    return true;
  };

  const generateReport = async () => {
    if (!validateForm()) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch(`${API_BASE}/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          reportTypes: reportTypes
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
        setShowPreview(true);
      } else {
        const error = await response.json();
        alert('Error generating report: ' + error.message);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Network error: Could not generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const printReport = () => {
    if (!reportData) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatePrintHTML(reportData));
    printWindow.document.close();
    printWindow.print();
  };

  const emailReport = async () => {
    if (!reportData || !emailAddress.trim()) {
      alert('Please enter an email address.');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      alert('Please enter a valid email address.');
      return;
    }
    
    try {
      setIsGenerating(true);
      const response = await fetch(`${API_BASE}/reports/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportData: reportData,
          emailAddress: emailAddress,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        })
      });
      
      if (response.ok) {
        alert(`Report successfully emailed to ${emailAddress}`);
      } else {
        const error = await response.json();
        alert('Error emailing report: ' + error.message);
      }
    } catch (error) {
      console.error('Error emailing report:', error);
      alert('Network error: Could not email report');
    } finally {
      setIsGenerating(false);
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
      month: 'long',
      day: 'numeric'
    });
  };

  const generatePrintHTML = (data) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Palm Exit Garage - Business Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.4; }
          .header { text-align: center; border-bottom: 3px solid #FFD329; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #000; margin: 0; font-size: 28px; }
          .section { margin-bottom: 30px; }
          .section h3 { color: #000; border-bottom: 2px solid #FFD329; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #FFD329; }
          .total-row { font-weight: bold; background-color: #f5f5f5; }
          .date-range { text-align: center; margin-bottom: 20px; font-size: 16px; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏁 PALM EXIT GARAGE</h1>
          <p>Professional Auto Repair Services</p>
        </div>
        
        <div class="date-range">
          <strong>Report Period: ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}</strong>
        </div>
        
        ${data.partsReport ? `
        <div class="section">
          <h3>Parts Profit Report</h3>
          <table>
            <tr>
              <th>Part</th>
              <th>Quantity Sold</th>
              <th>Total Revenue</th>
              <th>Total Cost</th>
              <th>Profit</th>
            </tr>
            ${data.partsReport.items.map(item => `
            <tr>
              <td>${item.brand} - ${item.item}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.total_revenue)}</td>
              <td>${formatCurrency(item.total_cost)}</td>
              <td>${formatCurrency(item.profit)}</td>
            </tr>
            `).join('')}
            <tr class="total-row">
              <td><strong>TOTALS</strong></td>
              <td><strong>${data.partsReport.summary.total_quantity}</strong></td>
              <td><strong>${formatCurrency(data.partsReport.summary.total_revenue)}</strong></td>
              <td><strong>${formatCurrency(data.partsReport.summary.total_cost)}</strong></td>
              <td><strong>${formatCurrency(data.partsReport.summary.total_profit)}</strong></td>
            </tr>
          </table>
        </div>
        ` : ''}
        
        ${data.laborReport ? `
        <div class="section">
          <h3>Labor Profit Report</h3>
          <table>
            <tr>
              <th>Labor Type</th>
              <th>Hours</th>
              <th>Total Revenue</th>
            </tr>
            ${data.laborReport.items.map(item => `
            <tr>
              <td>${item.labor_name}</td>
              <td>${item.total_hours.toFixed(2)}</td>
              <td>${formatCurrency(item.total_revenue)}</td>
            </tr>
            `).join('')}
            <tr class="total-row">
              <td><strong>TOTALS</strong></td>
              <td><strong>${data.laborReport.summary.total_hours.toFixed(2)}</strong></td>
              <td><strong>${formatCurrency(data.laborReport.summary.total_revenue)}</strong></td>
            </tr>
          </table>
        </div>
        ` : ''}
        
        ${data.taxReport ? `
        <div class="section">
          <h3>California Tax Information Report</h3>
          <table>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
            <tr>
              <td>Total Taxable Sales</td>
              <td>${formatCurrency(data.taxReport.total_taxable_sales)}</td>
            </tr>
            <tr>
              <td>Total Tax Collected</td>
              <td>${formatCurrency(data.taxReport.total_tax_collected)}</td>
            </tr>
            <tr>
              <td>Average Tax Rate</td>
              <td>${(data.taxReport.average_tax_rate * 100).toFixed(4)}%</td>
            </tr>
            <tr>
              <td>Number of Transactions</td>
              <td>${data.taxReport.transaction_count}</td>
            </tr>
          </table>
        </div>
        ` : ''}
        
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
          <p>Generated on ${new Date().toLocaleDateString('en-US')} - Palm Exit Garage Business Report</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div style={{
      backgroundColor: 'black',
      minHeight: '100vh',
      color: '#FFD329'
    }}>
      <Navigation />
      <div style={{ padding: '20px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '28px',
            color: '#FFD329',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            📊 Business Reports
          </h2>

          {!showPreview && (
            <div style={{
              backgroundColor: '#333',
              padding: '30px',
              borderRadius: '10px',
              marginBottom: '30px'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '25px', color: '#FFD329' }}>
                Generate Report
              </h3>

              {/* Date Range Selection */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '25px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    📅 Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '5px',
                      border: '1px solid #666',
                      backgroundColor: '#444',
                      color: '#FFD329',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    📅 End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '5px',
                      border: '1px solid #666',
                      backgroundColor: '#444',
                      color: '#FFD329',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              {/* Report Types */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', fontSize: '16px' }}>
                  📋 Select Report Types
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '15px'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '15px',
                    backgroundColor: '#444',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      name="partsProfit"
                      checked={reportTypes.partsProfit}
                      onChange={handleReportTypeChange}
                      style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>💰 Parts Profit Report</div>
                      <div style={{ fontSize: '14px', color: '#ccc', marginTop: '5px' }}>
                        Detailed profit analysis for all parts sold during the period
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '15px',
                    backgroundColor: '#444',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      name="laborProfit"
                      checked={reportTypes.laborProfit}
                      onChange={handleReportTypeChange}
                      style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>🔧 Labor Profit Report</div>
                      <div style={{ fontSize: '14px', color: '#ccc', marginTop: '5px' }}>
                        Summary of labor hours and revenue by service type
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '15px',
                    backgroundColor: '#444',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      name="caTaxInfo"
                      checked={reportTypes.caTaxInfo}
                      onChange={handleReportTypeChange}
                      style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>🏛️ California Tax Information</div>
                      <div style={{ fontSize: '14px', color: '#ccc', marginTop: '5px' }}>
                        Tax collection summary for California business reporting
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Generate Button */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={generateReport}
                  disabled={isGenerating}
                  style={{
                    backgroundColor: isGenerating ? '#666' : '#4CAF50',
                    color: 'white',
                    padding: '15px 30px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    minWidth: '200px'
                  }}
                >
                  {isGenerating ? '⏳ Generating...' : '📊 Generate Report'}
                </button>
              </div>
            </div>
          )}

          {/* Report Preview */}
          {showPreview && reportData && (
            <div style={{
              backgroundColor: '#333',
              padding: '30px',
              borderRadius: '10px',
              marginBottom: '30px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '25px'
              }}>
                <h3 style={{ margin: 0, color: '#FFD329' }}>
                  📋 Report Preview
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
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
                  ← Back to Options
                </button>
              </div>

              <div style={{
                backgroundColor: 'white',
                color: 'black',
                padding: '30px',
                borderRadius: '8px',
                marginBottom: '20px',
                maxHeight: '600px',
                overflowY: 'auto'
              }}>
                <div dangerouslySetInnerHTML={{ __html: generatePrintHTML(reportData) }} />
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={printReport}
                  style={{
                    backgroundColor: '#2196F3',
                    color: 'white',
                    padding: '12px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  🖨️ Print Report
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="Enter email address"
                    style={{
                      padding: '12px',
                      borderRadius: '5px',
                      border: '1px solid #666',
                      backgroundColor: '#444',
                      color: '#FFD329',
                      fontSize: '14px',
                      minWidth: '250px'
                    }}
                  />
                  <button
                    onClick={emailReport}
                    disabled={isGenerating || !emailAddress.trim()}
                    style={{
                      backgroundColor: isGenerating || !emailAddress.trim() ? '#666' : '#FF9800',
                      color: 'white',
                      padding: '12px 25px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isGenerating || !emailAddress.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isGenerating ? '⏳ Sending...' : '📧 Email Report'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;