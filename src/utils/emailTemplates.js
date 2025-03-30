const { format } = require('date-fns');

const getAppointmentStatusEmailTemplate = (appointment, type) => {
  const appointmentDate = format(new Date(appointment.appointment_date), 'MMMM dd, yyyy');
  // Safely handle time slot data
  const appointmentTime = appointment.start_time && appointment.end_time 
    ? `${appointment.start_time} - ${appointment.end_time}`
    : 'Time slot not specified';
  
  const getStatusSpecificContent = () => {
    switch (type) {
      case 'confirmed':
        return {
          subject: 'Appointment Confirmed',
          heading: 'Your Appointment Has Been Confirmed',
          message: 'Great news! Your appointment has been confirmed. Here are the details:',
          additionalInfo: `
            <p>Please arrive 15 minutes before your scheduled time.</p>
            <p>If you need to cancel or reschedule, please do so at least 24 hours in advance.</p>
          `
        };
      case 'cancelled':
        return {
          subject: 'Appointment Cancelled',
          heading: 'Your Appointment Has Been Cancelled',
          message: 'Your appointment has been cancelled. Here are the details of the cancelled appointment:',
          additionalInfo: `
            <p>If you would like to schedule a new appointment, please visit our website.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          `
        };
      case 'pending':
        return {
          subject: 'Appointment Request Received',
          heading: 'Your Appointment Request is Pending',
          message: 'We have received your appointment request. Here are the details:',
          additionalInfo: `
            <p>We will review your request and confirm your appointment shortly.</p>
            <p>You will receive another email once your appointment is confirmed.</p>
          `
        };
      default:
        return {
          subject: 'Appointment Update',
          heading: 'Your Appointment Has Been Updated',
          message: 'Your appointment details have been updated. Here are the current details:',
          additionalInfo: ''
        };
    }
  };

  const { subject, heading, message, additionalInfo } = getStatusSpecificContent();

  // Safely get values with fallbacks
  const patientName = appointment.patient_name || 'Patient';
  const doctorName = appointment.doctor_name || 'Doctor';
  const locationType = appointment.appointment_type || 'Not specified';
  const locationName = appointment.location_name || 'Not specified';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .details { background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${heading}</h2>
          </div>
          <div class="content">
            <p>${message}</p>
            <div class="details">
              <p><strong>Patient:</strong> ${patientName}</p>
              <p><strong>Doctor:</strong> ${doctorName}</p>
              <p><strong>Date:</strong> ${appointmentDate}</p>
              <p><strong>Time:</strong> ${appointmentTime}</p>
              <p><strong>Type:</strong> ${locationType}</p>
              <p><strong>Location:</strong> ${locationName}</p>
              <p><strong>Status:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
            </div>
            ${additionalInfo}
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    subject,
    html
  };
};

module.exports = {
  getAppointmentStatusEmailTemplate
}; 