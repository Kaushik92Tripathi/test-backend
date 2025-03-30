const pool = require('../db');

const adminAppointmentController = {
  // Search and filter appointments
  searchAppointments: async (req, res) => {
    try {
      const {
        search,
        status,
        date,
        doctorId,
        page = 1,
        limit = 10,
        sortBy = 'appointment_date',
        sortOrder = 'desc'
      } = req.query;

      // Build the base query
      let query = `
        SELECT 
          a.*,
          u.name as patient_name,
          u.email as patient_email,
          d.id as doctor_id,
          d.degree,
          d.experience_years,
          d.consultation_fee,
          du.name as doctor_name,
          du.email as doctor_email,
          s.id as specialty_id,
          s.name as specialty_name,
          l.id as location_id,
          l.name as location_name,
          l.city,
          l.country,
          ts.id as time_slot_id,
          ts.start_time,
          ts.end_time
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users du ON d.user_id = du.id
        LEFT JOIN specialties s ON d.specialty_id = s.id
        LEFT JOIN locations l ON d.location_id = l.id
        JOIN time_slots ts ON a.time_slot_id = ts.id
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 1;

      // Add search condition
      if (search) {
        query += ` AND (
          u.name ILIKE $${paramCount} OR
          du.name ILIKE $${paramCount} OR
          a.appointment_type ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
        paramCount++;
      }

      // Add status filter
      if (status && status !== 'all') {
        query += ` AND a.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      // Add date filter
      if (date) {
        query += ` AND DATE(a.appointment_date) = $${paramCount}`;
        params.push(date);
        paramCount++;
      }

      // Add doctor filter
      if (doctorId) {
        query += ` AND a.doctor_id = $${paramCount}`;
        params.push(doctorId);
        paramCount++;
      }

      // Add sorting
      const validSortColumns = ['appointment_date', 'status', 'appointment_type'];
      const validSortOrders = ['asc', 'desc'];
      
      const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'appointment_date';
      const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder : 'desc';
      
      query += ` ORDER BY a.${finalSortBy} ${finalSortOrder}`;

      // Add pagination
      const offset = (page - 1) * limit;
      query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, offset);

      // Get total count
      const countQuery = query.replace(/SELECT .*? FROM/, 'SELECT COUNT(*) FROM').split('ORDER BY')[0];
      const countResult = await pool.query(countQuery, params.slice(0, -2));
      const total = parseInt(countResult.rows[0].count);

      // Execute main query
      const result = await pool.query(query, params);

      // Format the response
      const appointments = result.rows.map(row => ({
        id: row.id,
        patientId: row.patient_id,
        doctorId: row.doctor_id,
        appointmentDate: row.appointment_date,
        timeSlotId: row.time_slot_id,
        appointmentType: row.appointment_type,
        status: row.status,
        patientProblem: row.patient_problem,
        patientAge: row.patient_age,
        patientGender: row.patient_gender,
        doctor: {
          id: row.doctor_id,
          userId: row.doctor_id,
          degree: row.degree,
          experienceYears: row.experience_years,
          consultationFee: row.consultation_fee,
          user: {
            id: row.doctor_id,
            name: row.doctor_name,
            email: row.doctor_email
          },
          specialty: {
            id: row.specialty_id,
            name: row.specialty_name
          },
          location: {
            id: row.location_id,
            name: row.location_name,
            city: row.city,
            country: row.country
          }
        },
        patient: {
          id: row.patient_id,
          name: row.patient_name,
          email: row.patient_email
        },
        timeSlot: {
          id: row.time_slot_id,
          startTime: row.start_time,
          endTime: row.end_time
        }
      }));

      res.json({
        appointments,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Error searching appointments:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;

      if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const query = `
        UPDATE appointments
        SET status = $1
        WHERE id = $2
        RETURNING id
      `;

      const result = await pool.query(query, [status, appointmentId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      res.json({ message: 'Appointment status updated successfully' });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = adminAppointmentController; 