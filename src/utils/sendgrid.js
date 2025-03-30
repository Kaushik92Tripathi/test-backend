const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

if (!SENDGRID_API_KEY) {
  console.error('SENDGRID_API_KEY is not set in environment variables');
}

if (!SENDGRID_FROM_EMAIL) {
  console.error('SENDGRID_FROM_EMAIL is not set in environment variables');
}

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Validate required fields
    if (!to || !subject || !html) {
      throw new Error('Missing required email fields: to, subject, and html are required');
    }

    // Log email attempt
    console.log('Attempting to send email:', {
      to,
      from: SENDGRID_FROM_EMAIL,
      subject,
      // Don't log html content for privacy/security
    });

    const msg = {
      to,
      from: SENDGRID_FROM_EMAIL,
      subject,
      html,
    };

    const response = await sgMail.send(msg);
    console.log('Email sent successfully:', {
      statusCode: response[0].statusCode,
      headers: response[0].headers,
      to,
      subject
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', {
      error: error.message,
      code: error.code,
      to,
      subject
    });
    
    if (error.response) {
      console.error('SendGrid API error details:', {
        statusCode: error.response.statusCode,
        body: error.response.body,
        headers: error.response.headers
      });
    }
    
    throw error;
  }
};

module.exports = { sendEmail }; 