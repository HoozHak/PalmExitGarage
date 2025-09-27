const nodemailer = require('nodemailer');
const configStore = require('../utils/configStore');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
  }

  // Auto-load configuration on startup (if exists)
  async autoLoadConfiguration() {
    try {
      const savedConfig = await configStore.loadEmailConfig();
      if (savedConfig && savedConfig.email) {
        this.shopEmail = savedConfig.email;
        this.shopName = savedConfig.shopName || 'Palm Exit Garage';
        this.hasSavedConfig = true;
        
        // Try to load saved password
        const savedPassword = await configStore.getDecryptedPassword();
        if (savedPassword) {
          // Automatically configure with saved credentials
          const fullConfig = {
            email: savedConfig.email,
            password: savedPassword,
            shopName: savedConfig.shopName
          };
          
          const success = await this.configure(fullConfig, true); // Skip saving during auto-load
          if (success) {
            console.log(`✅ Email service auto-configured successfully for: ${savedConfig.email}`);
            return savedConfig;
          }
        }
        
        console.log(`Found saved email config for: ${savedConfig.email}`);
        console.log('Email service partially configured - password required for activation');
        return savedConfig;
      }
      return null;
    } catch (error) {
      console.error('Error auto-loading email configuration:', error);
      return null;
    }
  }

  // Configure Gmail SMTP
  async configure(emailConfig, skipSaving = false) {
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailConfig.email,
          pass: emailConfig.password // This should be an "App Password" for Gmail
        }
      });
      
      this.isConfigured = true;
      this.shopEmail = emailConfig.email;
      this.shopName = emailConfig.shopName || 'Palm Exit Garage';
      this.hasSavedConfig = true;
      
      // Save configuration to persistent storage (including encrypted password)
      if (!skipSaving) {
        await configStore.saveEmailConfig({
          email: emailConfig.email,
          password: emailConfig.password,
          shopName: emailConfig.shopName
        });
        console.log('Email service configured and saved successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to configure email service:', error);
      this.isConfigured = false;
      return false;
    }
  }

  // Clear email configuration
  async clearConfiguration() {
    try {
      // Clear the configuration file
      await configStore.clearEmailConfig();
      
      // Reset service state
      this.transporter = null;
      this.isConfigured = false;
      this.shopEmail = null;
      this.shopName = null;
      this.hasSavedConfig = false;
      
      console.log('Email service configuration cleared successfully');
      return true;
    } catch (error) {
      console.error('Failed to clear email service configuration:', error);
      return false;
    }
  }

  // Verify email configuration
  async verifyConnection() {
    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    try {
      await this.transporter.verify();
      console.log('Email service connection verified');
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      throw error;
    }
  }

  // Generate work order completion notification HTML template
  generateWorkOrderCompletionHTML(workOrderData) {
    const { workOrder, parts, labor, customer, vehicle } = workOrderData;
    
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    let partsHTML = '';
    if (parts && parts.length > 0) {
      partsHTML = `
        <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Parts Used:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Unit Price</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${parts.map(part => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  <strong>${part.brand} ${part.item}</strong><br>
                  <small style="color: #666;">Part #: ${part.part_number || 'N/A'}</small>
                </td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${part.quantity}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${formatCurrency(part.cost_cents)}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${formatCurrency(part.cost_cents * part.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    let laborHTML = '';
    if (labor && labor.length > 0) {
      laborHTML = `
        <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Labor Services:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Service</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Hours</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Rate</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${labor.map(laborItem => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  <strong>${laborItem.labor_name}</strong>
                  ${laborItem.description ? `<br><small style="color: #666;">${laborItem.description}</small>` : ''}
                </td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${laborItem.quantity}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${formatCurrency(laborItem.cost_cents)}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${formatCurrency(laborItem.cost_cents * laborItem.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Service Complete - Work Order #${workOrder.work_order_id}</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
              .header { background-color: #000; color: #FFD329; padding: 20px; text-align: center; margin-bottom: 30px; }
              .completion-banner { background-color: #4CAF50; color: white; padding: 20px; text-align: center; margin-bottom: 30px; border-radius: 10px; }
              .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .customer-info, .shop-info { flex: 1; }
              .customer-info { margin-right: 20px; }
              .totals { background-color: #f8f9fa; padding: 20px; margin-top: 30px; }
              .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
              .total-final { font-size: 1.2em; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
              .status-badge { padding: 5px 15px; border-radius: 15px; color: white; font-weight: bold; text-transform: uppercase; }
              .status-completed { background-color: #4CAF50; }
              .completion-info { margin-top: 40px; padding: 20px; background-color: #e8f5e8; border-left: 4px solid #4CAF50; border-radius: 5px; }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>${this.shopName}</h1>
              <p>Professional Auto Repair Services</p>
          </div>

          <div class="completion-banner">
              <h2 style="margin: 0; font-size: 24px;">🎉 Your Vehicle Repair is Complete! 🎉</h2>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Work Order #${workOrder.work_order_id} has been finished and your vehicle is ready for pickup!</p>
          </div>

          <div class="invoice-details">
              <div class="customer-info">
                  <h3>Customer Information:</h3>
                  <p><strong>${customer.first_name} ${customer.last_name}</strong><br>
                  Phone: ${customer.phone}<br>
                  ${customer.email ? `Email: ${customer.email}<br>` : ''}
                  ${customer.address ? `${customer.address}<br>` : ''}
                  ${customer.city ? `${customer.city}` : ''}${customer.state ? `, ${customer.state}` : ''} ${customer.zip_code || ''}</p>
              </div>
              <div class="shop-info">
                  <h3>Completion Date:</h3>
                  <p>${formatDate(new Date())}</p>
                  
                  <h3>Vehicle:</h3>
                  <p><strong>${vehicle.year} ${vehicle.make} ${vehicle.model}</strong><br>
                  ${vehicle.license_plate ? `License: ${vehicle.license_plate}<br>` : ''}
                  ${vehicle.vin ? `VIN: ${vehicle.vin}<br>` : ''}
                  ${vehicle.mileage ? `Mileage: ${vehicle.mileage.toLocaleString()} miles` : ''}</p>
              </div>
          </div>

          ${partsHTML}
          ${laborHTML}

          <div class="totals">
              <div class="total-row">
                  <span>Subtotal:</span>
                  <span>${formatCurrency(workOrder.subtotal_cents)}</span>
              </div>
              <div class="total-row">
                  <span>Tax (${(workOrder.tax_rate * 100).toFixed(2)}%):</span>
                  <span>${formatCurrency(workOrder.tax_cents)}</span>
              </div>
              <div class="total-row total-final">
                  <span>Total Amount:</span>
                  <span>${formatCurrency(workOrder.total_cents)}</span>
              </div>
          </div>

          ${workOrder.notes ? `
          <div style="margin-top: 30px;">
              <h3>Service Notes:</h3>
              <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">${workOrder.notes}</p>
          </div>
          ` : ''}

          <div class="completion-info">
              <h3 style="margin-top: 0; color: #2e7d32;">📋 Next Steps:</h3>
              <ul style="margin-bottom: 0;">
                  <li><strong>Vehicle Ready:</strong> Your vehicle is ready for pickup at your convenience</li>
                  <li><strong>Payment:</strong> Final payment of ${formatCurrency(workOrder.total_cents)} is due upon pickup</li>
                  <li><strong>Questions:</strong> Contact us at ${this.shopEmail} or call the shop</li>
                  <li><strong>Warranty:</strong> All work comes with our standard warranty</li>
              </ul>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
              <p><strong>Thank you for choosing ${this.shopName}!</strong></p>
              <p>We appreciate your business and look forward to serving you again.</p>
              <p>Contact us: ${this.shopEmail}</p>
              <small>This notification was sent automatically when your service was completed.</small>
          </div>
      </body>
      </html>
    `;
  }

  // Generate work order receipt HTML template
  generateWorkOrderReceiptHTML(workOrderData) {
    const { workOrder, parts, labor, customer, vehicle } = workOrderData;
    
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    let partsHTML = '';
    if (parts && parts.length > 0) {
      partsHTML = `
        <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Parts Used:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Unit Price</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${parts.map(part => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  <strong>${part.brand} ${part.item}</strong><br>
                  <small style="color: #666;">Part #: ${part.part_number || 'N/A'}</small>
                </td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${part.quantity}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${formatCurrency(part.cost_cents)}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${formatCurrency(part.cost_cents * part.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    let laborHTML = '';
    if (labor && labor.length > 0) {
      laborHTML = `
        <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Labor Services:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Service</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Hours</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Rate</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${labor.map(laborItem => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  <strong>${laborItem.labor_name}</strong>
                  ${laborItem.description ? `<br><small style="color: #666;">${laborItem.description}</small>` : ''}
                </td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${laborItem.quantity}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${formatCurrency(laborItem.cost_cents)}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${formatCurrency(laborItem.cost_cents * laborItem.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Work Order Receipt #${workOrder.work_order_id}</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
              .header { background-color: #000; color: #FFD329; padding: 20px; text-align: center; margin-bottom: 30px; }
              .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .customer-info, .shop-info { flex: 1; }
              .customer-info { margin-right: 20px; }
              .totals { background-color: #f8f9fa; padding: 20px; margin-top: 30px; }
              .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
              .total-final { font-size: 1.2em; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
              .status-badge { padding: 5px 15px; border-radius: 15px; color: white; font-weight: bold; text-transform: uppercase; }
              .status-completed { background-color: #2196F3; }
              .status-approved { background-color: #4CAF50; }
              .signature-section { margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #4CAF50; }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>${this.shopName}</h1>
              <p>Professional Auto Repair Services</p>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
              <h2>Work Order Receipt #${workOrder.work_order_id}</h2>
              <span class="status-badge ${workOrder.status === 'Complete' ? 'status-completed' : 'status-approved'}">${workOrder.status}</span>
          </div>

          <div class="invoice-details">
              <div class="customer-info">
                  <h3>Customer Information:</h3>
                  <p><strong>${customer.first_name} ${customer.last_name}</strong><br>
                  Phone: ${customer.phone}<br>
                  ${customer.email ? `Email: ${customer.email}<br>` : ''}
                  ${customer.address ? `${customer.address}<br>` : ''}
                  ${customer.city ? `${customer.city}` : ''}${customer.state ? `, ${customer.state}` : ''} ${customer.zip_code || ''}</p>
              </div>
              <div class="shop-info">
                  <h3>Service Date:</h3>
                  <p>${formatDate(workOrder.created_at)}</p>
                  
                  <h3>Vehicle:</h3>
                  <p><strong>${vehicle.year} ${vehicle.make} ${vehicle.model}</strong><br>
                  ${vehicle.license_plate ? `License: ${vehicle.license_plate}<br>` : ''}
                  ${vehicle.vin ? `VIN: ${vehicle.vin}<br>` : ''}
                  ${vehicle.mileage ? `Mileage: ${vehicle.mileage.toLocaleString()} miles` : ''}</p>
              </div>
          </div>

          ${partsHTML}
          ${laborHTML}

          <div class="totals">
              <div class="total-row">
                  <span>Subtotal:</span>
                  <span>${formatCurrency(workOrder.subtotal_cents)}</span>
              </div>
              <div class="total-row">
                  <span>Tax (${(workOrder.tax_rate * 100).toFixed(2)}%):</span>
                  <span>${formatCurrency(workOrder.tax_cents)}</span>
              </div>
              <div class="total-row total-final">
                  <span>Total Amount:</span>
                  <span>${formatCurrency(workOrder.total_cents)}</span>
              </div>
          </div>

          ${workOrder.notes ? `
          <div style="margin-top: 30px;">
              <h3>Service Notes:</h3>
              <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">${workOrder.notes}</p>
          </div>
          ` : ''}

          <div class="signature-section">
              <h3>✅ Work Order Completed & Approved</h3>
              <p><strong>Customer Signature:</strong> ${workOrder.customer_signature_name || 'Digital Signature Received'}</p>
              <p><strong>Signed Date:</strong> ${workOrder.signed_date ? formatDate(workOrder.signed_date) : formatDate(new Date())}</p>
              <p><strong>Signature Type:</strong> ${workOrder.signature_type || 'Digital'}</p>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
              <p>Thank you for choosing ${this.shopName}!</p>
              <p>For questions about this work order, please contact us at ${this.shopEmail}</p>
              <small>This is an electronic receipt generated automatically.</small>
          </div>
      </body>
      </html>
    `;
  }

  // Send work order completion notification
  async sendWorkOrderCompletion(workOrderData) {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    const { customer, workOrder } = workOrderData;
    
    if (!customer.email) {
      throw new Error('Customer email not provided');
    }

    const htmlContent = this.generateWorkOrderCompletionHTML(workOrderData);
    
    const mailOptions = {
      from: `"${this.shopName}" <${this.shopEmail}>`,
      to: customer.email,
      subject: `🎉 Your Vehicle Repair is Complete! - Work Order #${workOrder.work_order_id}`,
      html: htmlContent
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Completion email sent successfully to ${customer.email}:`, result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        email: customer.email,
        type: 'completion'
      };
    } catch (error) {
      console.error('Failed to send completion email:', error);
      throw error;
    }
  }

  // Send work order receipt email
  async sendWorkOrderReceipt(workOrderData) {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    const { customer, workOrder } = workOrderData;
    
    if (!customer.email) {
      throw new Error('Customer email not provided');
    }

    const htmlContent = this.generateWorkOrderReceiptHTML(workOrderData);
    
    const mailOptions = {
      from: `"${this.shopName}" <${this.shopEmail}>`,
      to: customer.email,
      subject: `Work Order Receipt #${workOrder.work_order_id} - ${this.shopName}`,
      html: htmlContent,
      // Optional: attach a PDF version later
      // attachments: [{ filename: `WorkOrder-${workOrder.work_order_id}.pdf`, content: pdfBuffer }]
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${customer.email}:`, result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        email: customer.email
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  // Test email configuration
  async sendTestEmail(recipientEmail) {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: `"${this.shopName}" <${this.shopEmail}>`,
      to: recipientEmail,
      subject: `Email Configuration Test - ${this.shopName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #000; color: #FFD329; padding: 20px; text-align: center;">
            <h1>${this.shopName}</h1>
            <p>Email Service Test</p>
          </div>
          <div style="padding: 20px; background-color: #f8f9fa; margin-top: 20px;">
            <h2>✅ Email Configuration Successful!</h2>
            <p>This is a test email to confirm that your Gmail SMTP configuration is working correctly.</p>
            <p><strong>Configured Email:</strong> ${this.shopEmail}</p>
            <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
            <p>You can now send work order receipts to customers automatically!</p>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Test email sent successfully to ${recipientEmail}:`, result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        email: recipientEmail
      };
    } catch (error) {
      console.error('Failed to send test email:', error);
      throw error;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;