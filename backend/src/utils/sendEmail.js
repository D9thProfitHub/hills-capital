import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a transporter object using the default SMTP transport
let transporter;

// Force development mode for testing
const isDevelopment = true; // Force development mode

const initializeSMTP = () => {
  return new Promise(async (resolve) => {
    // In development, use a mock transporter that logs to console
    if (isDevelopment || process.env.NODE_ENV === 'development') {
      console.log('🚀 Development mode: Using mock email transporter');
      transporter = {
        sendMail: (mailOptions) => {
          console.log('📧 [Mock] Email would be sent:', {
            to: mailOptions.to,
            subject: mailOptions.subject,
            text: mailOptions.text || 'No text content',
            html: mailOptions.html ? '[HTML content]' : 'No HTML content'
          });
          return Promise.resolve({
            messageId: 'mock-message-id',
            envelope: {
              from: process.env.SMTP_EMAIL || 'no-reply@example.com',
              to: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to]
            },
            accepted: [mailOptions.to],
            rejected: [],
            pending: [],
            response: '250 Mock: OK'
          });
        },
        verify: () => Promise.resolve(true)
      };
      console.log('✅ Mock email transporter created');
      resolve(true);
      return;
    }

    // In production, try to set up a real SMTP connection
    if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL) {
      console.log('📧 SMTP not configured - email functionality disabled');
      resolve(false);
      return;
    }

    try {
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const isSecure = process.env.SMTP_SECURE === 'true';
      const isProduction = process.env.NODE_ENV === 'production';

      console.log('📧 Attempting to connect to SMTP server...');
      
      // Try multiple connection methods
      const connectionMethods = [
        // Method 1: Direct TLS (port 465)
        {
          name: 'Direct TLS (port 465)',
          config: {
            host: process.env.SMTP_HOST,
            port: 465,
            secure: true,
            requireTLS: false,
            tls: { rejectUnauthorized: false },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            debug: true,
            logger: true
          }
        },
        // Method 2: STARTTLS (port 587)
        {
          name: 'STARTTLS (port 587)',
          config: {
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false,
            requireTLS: true,
            tls: { rejectUnauthorized: false },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            debug: true,
            logger: true
          }
        },
        // Method 3: Fallback to non-secure (not recommended, only for testing)
        {
          name: 'Plain (port 25)',
          config: {
            host: process.env.SMTP_HOST,
            port: 25,
            secure: false,
            requireTLS: false,
            ignoreTLS: true,
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            debug: true,
            logger: true
          }
        }
      ];

      let lastError = null;
      
      // Try each connection method until one works
      for (const method of connectionMethods) {
        try {
          console.log(`🔌 Trying ${method.name}...`);
          const testTransporter = nodemailer.createTransport(method.config);
          
          // Test the connection using callback
          const connectionResult = await new Promise((innerResolve) => {
            testTransporter.verify((error, success) => {
              if (error) {
                console.error(`❌ ${method.name} failed:`, error.message);
                innerResolve({ success: false, error });
              } else {
                console.log(`✅ ${method.name} connection successful!`);
                innerResolve({ success: true, transporter: testTransporter });
              }
            });
          });
          
          if (connectionResult.success) {
            transporter = connectionResult.transporter;
            break; // Exit the loop on successful connection
          }
          
          lastError = connectionResult.error;
        } catch (err) {
          console.error(`❌ ${method.name} failed:`, err.message);
          lastError = err;
          // Continue to next method
        }
      }
      
      if (!transporter) {
        console.error('❌ All SMTP connection methods failed');
        throw lastError || new Error('Failed to connect to SMTP server');
      }
      
      // Set up the transporter with the working configuration
      const smtpConfig = {
        ...transporter.options,
        logger: process.env.NODE_ENV !== 'production',
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD
        },
        authMethod: 'PLAIN',
        greetingTimeout: 10000, // 10 seconds
        tls: {
          rejectUnauthorized: false
        },
        debug: process.env.NODE_ENV !== 'production',
        ignoreTLS: false,
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000, // 1 second
        rateLimit: 5, // Max 5 messages per rateDelta
        socketTimeout: 30000, // 30 seconds
      };

      // Log the configuration (without sensitive data)
      console.log('📧 SMTP Configuration:', {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        requireTLS: smtpConfig.requireTLS,
        auth: smtpConfig.auth ? 'configured' : 'not configured',
        tls: {
          rejectUnauthorized: smtpConfig.tls.rejectUnauthorized
        }
      });

      console.log('📧 Initializing SMTP with config:', {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        requireTLS: smtpConfig.requireTLS,
        ignoreTLS: smtpConfig.ignoreTLS,
        auth: smtpConfig.auth ? 'enabled' : 'disabled'
      });

      // Create test account if in development
      if (!isProduction && process.env.NODE_ENV !== 'production') {
        console.log('📧 Using test email account for development');
        transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix',
          buffer: true
        });
        resolve(true);
        return;
      }

      // Create real transporter
      transporter = nodemailer.createTransport(smtpConfig);
      
      // Test the connection with a timeout
      const connectionTimeout = setTimeout(() => {
        console.warn('⚠️  SMTP connection test timed out');
        resolve(false);
      }, 30000); // 30 second timeout

      // Use async IIFE to handle async/await
      (async () => {
        try {
          await new Promise((resolveVerify, rejectVerify) => {
          transporter.verify((error, success) => {
            clearTimeout(connectionTimeout);
            if (error) {
              console.warn('⚠️  SMTP connection error:', error.message);
              console.warn('Error details:', {
                code: error.code,
                command: error.command,
                response: error.response,
                responseCode: error.responseCode
              });
              rejectVerify(error);
            } else {
              console.log('✅ SMTP server is ready to take our messages');
              resolveVerify(true);
            }
          });
          });
          resolve(true);
        } catch (verifyError) {
          console.warn('📧 Email functionality will be disabled due to connection error');
          resolve(false);
        }
      })();
    } catch (error) {
      console.error('❌ Failed to initialize SMTP:', error);
      resolve(false);
    }
  });
};

// Initialize SMTP on startup
let isEmailEnabled = false;

// Initialize SMTP and set up the transporter
initializeSMTP()
  .then(enabled => {
    isEmailEnabled = enabled;
    if (!enabled && !transporter) {
      console.log('📧 Creating fallback test transporter');
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }
  })
  .catch(error => {
    console.error('❌ Failed to initialize email service:', error);
    console.log('📧 Creating fallback test transporter due to error');
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  });

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} [options.template] - Pug template name (without extension)
 * @param {Object} [options.templateVars] - Variables to pass to the template
 * @param {string} [options.html] - HTML content (alternative to template)
 * @param {string} [options.text] - Plain text content (alternative to HTML)
 * @returns {Promise<Object>} - Result of the email sending
 */
async function sendEmail({
  email,
  subject,
  template,
  templateVars = {},
  html,
  text,
}) {
  // If no SMTP configuration, log the email and resolve
  if (!isEmailEnabled) {
    console.log('📧 Email not sent - SMTP not configured or not ready');
    console.log('To:', email);
    console.log('Subject:', subject);
    return { message: 'Email not sent - SMTP not configured or not ready' };
  }

  try {
    // If template is provided, render it
    if (template) {
      const templatePath = path.join(
        __dirname,
        '..',
        'views',
        'emails',
        `${template}.pug`
      );
      
      // Add app URL to template variables
      templateVars.appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      // Render the template
      html = pug.renderFile(templatePath, templateVars);
      
      // Generate plain text version if not provided
      if (!text) {
        text = htmlToText(html, {
          wordwrap: 130,
        });
      }
    }

    // Prepare email options
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Hills Capital Trade'}" <${process.env.EMAIL_FROM || process.env.SMTP_EMAIL}>`,
      to: email,
      subject,
      text: text || '',
      html: html || text || '',
      // Add headers for better email deliverability
      headers: {
        'X-Mailer': 'Hills Capital Trade Platform',
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      },
      // Add message configuration
      dsn: {
        id: `${Date.now()}.${Math.random().toString(36).substr(2, 9)}`,
        return: 'headers',
        notify: ['success', 'failure', 'delay'],
        recipient: process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL
      }
    };

    // Add reply-to if specified
    if (process.env.EMAIL_REPLY_TO) {
      mailOptions.replyTo = process.env.EMAIL_REPLY_TO;
    }

    // Send the email
    console.log(`📧 Sending email to ${email} with subject: ${subject}`);
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope,
      accepted: info.accepted,
      rejected: info.rejected,
      pending: info.pending,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Try to get more detailed error information
    if (error.response) {
      console.error('SMTP Error Response:', error.response);
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Named exports
export { initializeSMTP };

// Default export
export default sendEmail;
