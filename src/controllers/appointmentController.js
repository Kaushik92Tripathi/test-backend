const pool = require('../db');
const { sendEmail } = require('../utils/sendgrid');
const { getAppointmentStatusEmailTemplate } = require('../utils/emailTemplates');

const appointmentController = {
  // Get all appointments with related data
  getAllAppointments: async (req, res) => {

    try {
      const query = `
        SELECT 
          a.*,
          u1.name as patient_name,
          u1.email as patient_email,
          u2.name as doctor_name,
          u2.email as doctor_email,
          s.name as specialty_name,
          l.name as location_name,
          l.address as location_address,
          ts.start_time,
          ts.end_time
        FROM appointments a
        LEFT JOIN users u1 ON a.patient_id = u1.id
        LEFT JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN users u2 ON d.user_id = u2.id
        LEFT JOIN specialties s ON d.specialty_id = s.id
        LEFT JOIN locations l ON d.location_id = l.id
        LEFT JOIN time_slots ts ON a.time_slot_id = ts.id
        ORDER BY a.appointment_date DESC, ts.start_time
      `;
  
      
      const result = await pool.query(query);
      const appointments = result.rows;

      // Calculate stats
      const stats = {
        total: appointments.length,
        confirmed: appointments.filter(app => app.status === 'confirmed').length,
        pending: appointments.filter(app => app.status === 'pending').length,
        cancelled: appointments.filter(app => app.status === 'cancelled').length,
        completed: appointments.filter(app => app.status === 'completed').length,
      };

      res.json({ appointments, stats });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single appointment by ID
  getAppointmentById: async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);

      if (isNaN(appointmentId)) {
        return res.status(400).json({ error: 'Invalid appointment ID' });
      }

      const query = `
        SELECT 
          a.*,
          u1.name as patient_name,
          u1.email as patient_email,
          u2.name as doctor_name,
          u2.email as doctor_email,
          s.name as specialty_name,
          l.name as location_name,
          l.address as location_address,
          ts.start_time,
          ts.end_time
        FROM appointments a
        LEFT JOIN users u1 ON a.patient_id = u1.id
        LEFT JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN users u2 ON d.user_id = u2.id
        LEFT JOIN specialties s ON d.specialty_id = s.id
        LEFT JOIN locations l ON d.location_id = l.id
        LEFT JOIN time_slots ts ON a.time_slot_id = ts.id
        WHERE a.id = $1
      `;

      const result = await pool.query(query, [appointmentId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Format the response to match the frontend interface
      const appointment = result.rows[0];
      res.json({
        appointment: {
          id: appointment.id,
          appointment_date: appointment.appointment_date,
          status: appointment.status,
          appointment_type: appointment.appointment_type,
          patient_problem: appointment.patient_problem,
          patient_age: appointment.patient_age,
          patient_gender: appointment.patient_gender,
          patient: {
            name: appointment.patient_name,
            email: appointment.patient_email
          },
          doctor: {
            id: appointment.doctor_id,
            name: appointment.doctor_name,
            email: appointment.doctor_email,
            degree: appointment.degree,
            experience_years: appointment.experience_years,
            consultation_fee: appointment.consultation_fee,
            specialty: {
              name: appointment.specialty_name
            },
            location: {
              name: appointment.location_name,
              address: appointment.location_address
            }
          },
          time_slot: {
            start_time: appointment.start_time,
            end_time: appointment.end_time
          }
        }
      });
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create a new appointment
  createAppointment: async (req, res) => {
    try {
      const {
        doctorId,
        date,
        timeSlotId,
        appointmentType,
        patientProblem,
        patientAge,
        patientGender
      } = req.body;

      // Convert date to a JavaScript Date object
      const dateObj = new Date(date);
      const formattedDate = dateObj.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday

      // Check if the doctor is available for this time slot and day
      const availabilityQuery = `
        SELECT * FROM doctor_availability
        WHERE doctor_id = $1
        AND day_of_week = $2
        AND time_slot_id = $3
        AND is_available = true
      `;
      const availabilityResult = await pool.query(availabilityQuery, [
        doctorId,
        dayOfWeek,
        timeSlotId
      ]);

      if (availabilityResult.rows.length === 0) {
        return res.status(400).json({ error: 'This time slot is not available' });
      }

      // Check if the time slot is already booked for this date
      const bookingQuery = `
        SELECT COUNT(*) FROM appointments
        WHERE doctor_id = $1
        AND appointment_date = $2
        AND time_slot_id = $3
        AND status NOT IN ('cancelled', 'rejected')
      `;
      const bookingResult = await pool.query(bookingQuery, [
        doctorId,
        formattedDate,
        timeSlotId
      ]);

      if (bookingResult.rows[0].count > 0) {
        return res.status(400).json({ error: 'This time slot is already booked' });
      }

      // Book the appointment
      const insertQuery = `
        INSERT INTO appointments (
          patient_id, doctor_id, appointment_date, time_slot_id,
          appointment_type, status, patient_problem, patient_age,
          patient_gender
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const insertResult = await pool.query(insertQuery, [
        req.user.id, // Assuming user ID is available from auth middleware
        doctorId,
        formattedDate,
        timeSlotId,
        appointmentType,
        'pending',
        patientProblem,
        patientAge,
        patientGender
      ]);

      // Fetch the complete appointment data with related information
      const appointmentQuery = `
        SELECT 
          a.*,
          u1.name as patient_name,
          u1.email as patient_email,
          u2.name as doctor_name,
          u2.email as doctor_email,
          s.name as specialty_name,
          l.name as location_name,
          l.address as location_address,
          ts.start_time,
          ts.end_time
        FROM appointments a
        LEFT JOIN users u1 ON a.patient_id = u1.id
        LEFT JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN users u2 ON d.user_id = u2.id
        LEFT JOIN specialties s ON d.specialty_id = s.id
        LEFT JOIN locations l ON d.location_id = l.id
        LEFT JOIN time_slots ts ON a.time_slot_id = ts.id
        WHERE a.id = $1
      `;
      const appointmentResult = await pool.query(appointmentQuery, [insertResult.rows[0].id]);

      res.json({ appointment: appointmentResult.rows[0] });
    } catch (error) {
      console.error('Error booking appointment:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    try {
      // Validate status
      if (!['confirmed', 'cancelled', 'pending', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      // Start a transaction
      const client = await pool.connect();
      let emailError = null;
      
      try {
        await client.query('BEGIN');
        
        // Get current appointment status
        const currentStatusQuery = `
          SELECT status FROM appointments WHERE id = $1
        `;
        const currentStatusResult = await client.query(currentStatusQuery, [id]);
        
        if (currentStatusResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ message: 'Appointment not found' });
        }

        const currentStatus = currentStatusResult.rows[0].status;

        // Validate status transition
        if (status === 'completed' && currentStatus !== 'confirmed') {
          await client.query('ROLLBACK');
          return res.status(400).json({ 
            message: 'Only confirmed appointments can be marked as completed' 
          });
        }

        // Update appointment status
        const result = await client.query(
          `UPDATE appointments 
           SET status = $1, 
               updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2 
           RETURNING *`,
          [status, id]
        );

        if (result.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ message: 'Appointment not found' });
        }

        // Get full appointment details for email
        const appointmentDetails = await client.query(
          `SELECT 
            a.*,
            u1.name as patient_name,
            u1.email as patient_email,
            u2.name as doctor_name,
            s.name as specialty_name,
            l.name as location_name,
            l.address as location_address,
            ts.start_time,
            ts.end_time
           FROM appointments a
           LEFT JOIN users u1 ON a.patient_id = u1.id
           LEFT JOIN doctors d ON a.doctor_id = d.id
           LEFT JOIN users u2 ON d.user_id = u2.id
           LEFT JOIN specialties s ON d.specialty_id = s.id
           LEFT JOIN locations l ON d.location_id = l.id
           LEFT JOIN time_slots ts ON a.time_slot_id = ts.id
           WHERE a.id = $1`,
          [id]
        );

        const appointment = appointmentDetails.rows[0];

        // Log appointment details before sending email
        console.log('Preparing to send email for appointment:', {
          appointmentId: id,
          status,
          patientEmail: appointment.patient_email,
          patientName: appointment.patient_name,
          doctorName: appointment.doctor_name
        });

        // Send email notification
        try {
          if (!appointment.patient_email) {
            throw new Error('Patient email is missing');
          }

          const { subject, html } = getAppointmentStatusEmailTemplate(appointment, status);
          
          // Log email template
          console.log('Email template generated:', {
            subject,
            hasHtml: !!html
          });

          await sendEmail({
            to: appointment.patient_email,
            subject,
            html
          });
        } catch (error) {
          emailError = error;
          console.error('Error sending appointment email:', {
            error: error.message,
            appointmentId: id,
            status,
            patientEmail: appointment.patient_email
          });
        }

        await client.query('COMMIT');

        // Send response with email status
        res.json({ 
          message: 'Appointment status updated successfully',
          appointment: appointmentDetails.rows[0],
          emailStatus: emailError ? 'failed' : 'sent',
          emailError: emailError ? emailError.message : null
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating appointment status:', error.stack || error.message);
      res.status(500).json({ 
        message: 'Error updating appointment status',
        error: error.message 
      });
    }
  },
  
  cancelAppointment: async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
  
      // Update appointment status to cancelled
      const updateQuery = `
        UPDATE appointments
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const updateResult = await pool.query(updateQuery, [appointmentId]);
  
      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
  
      // Fetch the complete appointment data with related information
      const appointmentQuery = `
        SELECT 
          a.*,
          u1.name as patient_name,
          u1.email as patient_email,
          u2.name as doctor_name,
          u2.email as doctor_email,
          s.name as specialty_name,
          l.name as location_name,
          l.address as location_address,
          ts.start_time,
          ts.end_time
        FROM appointments a
        LEFT JOIN users u1 ON a.patient_id = u1.id
        LEFT JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN users u2 ON d.user_id = u2.id
        LEFT JOIN specialties s ON d.specialty_id = s.id
        LEFT JOIN locations l ON d.location_id = l.id
        LEFT JOIN time_slots ts ON a.time_slot_id = ts.id
        WHERE a.id = $1
      `;
      const appointmentResult = await pool.query(appointmentQuery, [appointmentId]);
  
      res.json({
        success: true,
        message: 'Appointment cancelled successfully',
        appointment: appointmentResult.rows[0]
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      res.status(500).json({ error: error.message || 'Failed to cancel appointment' });
    }
  },
  
  // Get appointments for a specific doctor and user
  getDoctorAppointmentsForUser: async (req, res) => {
    try {
      const doctorId = req.params.doctorId;
      const { status } = req.query;
      const userId = req.user.id; // Get the authenticated user's ID

      if (!doctorId) {
        return res.status(400).json({ error: 'Doctor ID is required' });
      }

      let query = `
        SELECT 
          a.id,
          a.appointment_date,
          a.status,
          a.appointment_type,
          a.patient_problem,
          a.patient_age,
          a.patient_gender,
          a.patient_id as user_id,
          u.name as patient_name,
          u.email as patient_email,
          ts.start_time,
          ts.end_time
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        JOIN time_slots ts ON a.time_slot_id = ts.id
        WHERE a.doctor_id = $1 AND a.patient_id = $2
      `;

      const queryParams = [doctorId, userId];

      if (status) {
        query += ` AND a.status = $3`;
        queryParams.push(status);
      }

      query += ` ORDER BY a.appointment_date DESC`;

      const result = await pool.query(query, queryParams);

      res.json({
        appointments: result.rows.map(appointment => ({
          id: appointment.id,
          appointmentDate: appointment.appointment_date,
          status: appointment.status,
          appointmentType: appointment.appointment_type,
          patientProblem: appointment.patient_problem,
          patientAge: appointment.patient_age,
          patientGender: appointment.patient_gender,
          userId: appointment.user_id,
          patient: {
            name: appointment.patient_name,
            email: appointment.patient_email
          },
          timeSlot: {
            startTime: appointment.start_time,
            endTime: appointment.end_time
          }
        }))
      });
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = appointmentController; 