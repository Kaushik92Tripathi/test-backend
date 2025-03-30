const { format } = require('date-fns');

const getAppointmentStatusEmailTemplate = (appointment, status) => {
  const { patient_name, doctor_name, appointment_date, start_time, end_time, specialty_name } = appointment;
  const formattedDate = new Date(appointment_date).toLocaleDateString();
  const formattedTime = `${start_time} - ${end_time}`;

  const templates = {
    pending: {
      subject: 'Appointment Booking Confirmation - Pending',
      html: `
        <h2>Appointment Booking Confirmation</h2>
        <p>Dear ${patient_name},</p>
        <p>Your appointment with Dr. ${doctor_name} (${specialty_name}) has been booked and is pending confirmation.</p>
        <p><strong>Appointment Details:</strong></p>
        <ul>
          <li>Date: ${formattedDate}</li>
          <li>Time: ${formattedTime}</li>
          <li>Doctor: Dr. ${doctor_name}</li>
          <li>Specialty: ${specialty_name}</li>
        </ul>
        <p>We will notify you once the appointment is confirmed.</p>
      `
    },
    confirmed: {
      subject: 'Appointment Confirmed',
      html: `
        <h2>Appointment Confirmed</h2>
        <p>Dear ${patient_name},</p>
        <p>Your appointment with Dr. ${doctor_name} (${specialty_name}) has been confirmed.</p>
        <p><strong>Appointment Details:</strong></p>
        <ul>
          <li>Date: ${formattedDate}</li>
          <li>Time: ${formattedTime}</li>
          <li>Doctor: Dr. ${doctor_name}</li>
          <li>Specialty: ${specialty_name}</li>
        </ul>
        <p>Please arrive 15 minutes before your scheduled appointment time.</p>
      `
    },
    completed: {
      subject: 'Appointment Completed - Share Your Experience',
      html: `
        <h2>Appointment Completed</h2>
        <p>Dear ${patient_name},</p>
        <p>Your appointment with Dr. ${doctor_name} (${specialty_name}) has been marked as completed.</p>
        <p><strong>Appointment Details:</strong></p>
        <ul>
          <li>Date: ${formattedDate}</li>
          <li>Time: ${formattedTime}</li>
          <li>Doctor: Dr. ${doctor_name}</li>
          <li>Specialty: ${specialty_name}</li>
        </ul>
        <p>We value your feedback! Please take a moment to rate your experience with Dr. ${doctor_name}.</p>
        <p>You can leave a review by visiting the doctor's profile page.</p>
      `
    },
    cancelled: {
      subject: 'Appointment Cancelled',
      html: `
        <h2>Appointment Cancelled</h2>
        <p>Dear ${patient_name},</p>
        <p>Your appointment with Dr. ${doctor_name} (${specialty_name}) has been cancelled.</p>
        <p><strong>Cancelled Appointment Details:</strong></p>
        <ul>
          <li>Date: ${formattedDate}</li>
          <li>Time: ${formattedTime}</li>
          <li>Doctor: Dr. ${doctor_name}</li>
          <li>Specialty: ${specialty_name}</li>
        </ul>
        <p>If you would like to reschedule, please visit our website to book a new appointment.</p>
      `
    }
  };

  return templates[status] || {
    subject: 'Appointment Status Update',
    html: `
      <h2>Appointment Status Update</h2>
      <p>Dear ${patient_name},</p>
      <p>The status of your appointment with Dr. ${doctor_name} has been updated to ${status}.</p>
      <p><strong>Appointment Details:</strong></p>
      <ul>
        <li>Date: ${formattedDate}</li>
        <li>Time: ${formattedTime}</li>
        <li>Doctor: Dr. ${doctor_name}</li>
        <li>Specialty: ${specialty_name}</li>
      </ul>
    `
  };
};

module.exports = {
  getAppointmentStatusEmailTemplate
}; 