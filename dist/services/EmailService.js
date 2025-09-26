"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            this.transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            console.log('📧 Using Gmail SMTP for real email delivery');
        }
        else {
            this.transporter = nodemailer_1.default.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: 'ethereal.user@ethereal.email',
                    pass: 'ethereal.pass'
                }
            });
            console.log('📧 Using Ethereal test service - emails will not be delivered to real inboxes');
            console.log('📧 To enable real email delivery, set EMAIL_USER and EMAIL_PASS environment variables');
        }
    }
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: '"Smart Desk Solutions" <noreply@smartdesk.solutions>',
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html
            };
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            console.log('Preview URL:', nodemailer_1.default.getTestMessageUrl(info));
            return true;
        }
        catch (error) {
            console.error('Failed to send email:', error);
            return false;
        }
    }
    async sendServiceRequestApprovalEmail(clientName, clientEmail, requestTitle, requestDescription) {
        const subject = `✅ Service Request Approved - ${requestTitle}`;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Request Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .success-icon { font-size: 48px; color: #10b981; text-align: center; margin: 20px 0; }
          .request-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Smart Desk Solutions</h1>
            <p>Administrative Excellence</p>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            <h2>Great News! Your Service Request Has Been Approved</h2>
            <p>Dear ${clientName},</p>
            <p>We're excited to inform you that your service request has been approved and we're ready to get started!</p>
            
            <div class="request-details">
              <h3>Request Details:</h3>
              <p><strong>Title:</strong> ${requestTitle}</p>
              <p><strong>Description:</strong> ${requestDescription}</p>
              <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">APPROVED</span></p>
            </div>

            <p>Our team will be in touch with you within 24 hours to discuss the next steps and get your project started.</p>
            
            <p>If you have any questions or need immediate assistance, please don't hesitate to contact us.</p>
            
            <div style="text-align: center;">
              <a href="mailto:info@smartdesk.solutions" class="button">Contact Us</a>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for choosing Smart Desk Solutions!</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const text = `
      Service Request Approved - ${requestTitle}
      
      Dear ${clientName},
      
      Great news! Your service request has been approved and we're ready to get started!
      
      Request Details:
      - Title: ${requestTitle}
      - Description: ${requestDescription}
      - Status: APPROVED
      
      Our team will be in touch with you within 24 hours to discuss the next steps.
      
      If you have any questions, please contact us at info@smartdesk.solutions
      
      Thank you for choosing Smart Desk Solutions!
    `;
        return await this.sendEmail({
            to: clientEmail,
            subject,
            html,
            text
        });
    }
    async sendServiceRequestStatusUpdateEmail(clientName, clientEmail, requestTitle, requestDescription, status, reason) {
        const statusInfo = {
            'in-progress': {
                subject: '🔄 Service Request Update - Work In Progress',
                icon: '🔄',
                color: '#3b82f6',
                message: 'Great news! We\'ve started working on your request and it\'s now in progress.',
                nextSteps: 'Our team is actively working on your project. We\'ll keep you updated on our progress.'
            },
            'review': {
                subject: '👀 Service Request Update - Under Review',
                icon: '👀',
                color: '#f59e0b',
                message: 'Your request is currently under review by our team.',
                nextSteps: 'We\'re carefully reviewing your project details and will provide feedback soon.'
            },
            'completed': {
                subject: '✅ Service Request Completed - Project Delivered',
                icon: '✅',
                color: '#10b981',
                message: 'Excellent! Your service request has been completed successfully.',
                nextSteps: 'Your project is ready for delivery. Please check your deliverables and let us know if you need any adjustments.'
            },
            'cancelled': {
                subject: '❌ Service Request Cancelled',
                icon: '❌',
                color: '#ef4444',
                message: 'Your service request has been cancelled.',
                nextSteps: 'If you\'d like to discuss this further or submit a new request, please don\'t hesitate to contact us.'
            }
        };
        const info = statusInfo[status];
        if (!info) {
            return false;
        }
        const subject = info.subject;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Request Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${info.color}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .status-icon { font-size: 48px; color: ${info.color}; text-align: center; margin: 20px 0; }
          .request-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${info.color}; }
          .button { display: inline-block; background: ${info.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Smart Desk Solutions</h1>
            <p>Administrative Excellence</p>
          </div>
          <div class="content">
            <div class="status-icon">${info.icon}</div>
            <h2>Service Request Status Update</h2>
            <p>Dear ${clientName},</p>
            <p>${info.message}</p>
            
            <div class="request-details">
              <h3>Request Details:</h3>
              <p><strong>Title:</strong> ${requestTitle}</p>
              <p><strong>Description:</strong> ${requestDescription}</p>
              <p><strong>Status:</strong> <span style="color: ${info.color}; font-weight: bold;">${status.toUpperCase().replace('-', ' ')}</span></p>
              ${reason ? `<p><strong>Note:</strong> ${reason}</p>` : ''}
            </div>

            <p>${info.nextSteps}</p>
            
            <div style="text-align: center;">
              <a href="mailto:info@smartdesk.solutions" class="button">Contact Us</a>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for choosing Smart Desk Solutions!</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const text = `
      Service Request Status Update - ${requestTitle}
      
      Dear ${clientName},
      
      ${info.message}
      
      Request Details:
      - Title: ${requestTitle}
      - Description: ${requestDescription}
      - Status: ${status.toUpperCase().replace('-', ' ')}
      ${reason ? `- Note: ${reason}` : ''}
      
      ${info.nextSteps}
      
      Contact us at info@smartdesk.solutions
      
      Thank you for choosing Smart Desk Solutions!
    `;
        return await this.sendEmail({
            to: clientEmail,
            subject,
            html,
            text
        });
    }
    async sendServiceRequestRejectionEmail(clientName, clientEmail, requestTitle, requestDescription, reason) {
        const subject = `❌ Service Request Update - ${requestTitle}`;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Request Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-icon { font-size: 48px; color: #dc2626; text-align: center; margin: 20px 0; }
          .request-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Smart Desk Solutions</h1>
            <p>Administrative Excellence</p>
          </div>
          <div class="content">
            <div class="info-icon">❌</div>
            <h2>Service Request Update</h2>
            <p>Dear ${clientName},</p>
            <p>Thank you for your interest in our services. After careful consideration, we're unable to proceed with your current request at this time.</p>
            
            <div class="request-details">
              <h3>Request Details:</h3>
              <p><strong>Title:</strong> ${requestTitle}</p>
              <p><strong>Description:</strong> ${requestDescription}</p>
              <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">NOT APPROVED</span></p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>

            <p>This doesn't mean we can't help you in the future! We encourage you to:</p>
            <ul>
              <li>Submit a new request with different requirements</li>
              <li>Contact us directly to discuss your needs</li>
              <li>Explore our other available services</li>
            </ul>
            
            <p>We're here to help you find the right solution for your business needs.</p>
            
            <div style="text-align: center;">
              <a href="mailto:info@smartdesk.solutions" class="button">Contact Us</a>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for considering Smart Desk Solutions!</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const text = `
      Service Request Update - ${requestTitle}
      
      Dear ${clientName},
      
      Thank you for your interest in our services. After careful consideration, we're unable to proceed with your current request at this time.
      
      Request Details:
      - Title: ${requestTitle}
      - Description: ${requestDescription}
      - Status: NOT APPROVED
      ${reason ? `- Reason: ${reason}` : ''}
      
      This doesn't mean we can't help you in the future! We encourage you to submit a new request or contact us directly.
      
      Contact us at info@smartdesk.solutions
      
      Thank you for considering Smart Desk Solutions!
    `;
        return await this.sendEmail({
            to: clientEmail,
            subject,
            html,
            text
        });
    }
    async sendWelcomeEmail(clientName, clientEmail, clientRole) {
        const subject = `🎉 Welcome to Smart Desk Solutions!`;
        const portalUrl = clientRole === 'admin'
            ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin`
            : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Smart Desk Solutions</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .welcome-icon { font-size: 48px; color: #10b981; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-item { display: flex; align-items: center; margin: 10px 0; }
          .feature-icon { margin-right: 10px; font-size: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Smart Desk Solutions</h1>
            <p>Administrative Excellence</p>
          </div>
          <div class="content">
            <div class="welcome-icon">🎉</div>
            <h2>Welcome to Smart Desk Solutions!</h2>
            <p>Dear ${clientName},</p>
            <p>Congratulations! Your account has been successfully created. We're excited to have you join our community of clients who trust us with their administrative needs.</p>
            
            <div class="features">
              <h3>What you can do now:</h3>
              <div class="feature-item">
                <span class="feature-icon">🏠</span>
                <span>Access your personal dashboard</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📋</span>
                <span>Submit service requests</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">💬</span>
                <span>Communicate with our team</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📊</span>
                <span>Track your project progress</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">⚙️</span>
                <span>Manage your profile settings</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${portalUrl}" class="button">Access Your Account</a>
            </div>
            
            <p>If you have any questions or need assistance getting started, our support team is here to help. Don't hesitate to reach out!</p>
            
            <div style="text-align: center;">
              <a href="mailto:info@smartdesk.solutions" class="button" style="background: #10b981;">Contact Support</a>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for choosing Smart Desk Solutions!</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        const text = `
      Welcome to Smart Desk Solutions!
      
      Dear ${clientName},
      
      Congratulations! Your account has been successfully created. We're excited to have you join our community of clients who trust us with their administrative needs.
      
      What you can do now:
      - Access your personal dashboard
      - Submit service requests
      - Communicate with our team
      - Track your project progress
      - Manage your profile settings
      
      Access your account: ${portalUrl}
      
      If you have any questions or need assistance getting started, our support team is here to help. Don't hesitate to reach out!
      
      Contact us at: info@smartdesk.solutions
      
      Thank you for choosing Smart Desk Solutions!
    `;
        return await this.sendEmail({
            to: clientEmail,
            subject,
            html,
            text
        });
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=EmailService.js.map