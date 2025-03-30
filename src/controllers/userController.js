const pool = require('../db');

// Helper function to format time
function formatTime(time) {
  if (!time) return null;
  
  // Handle PostgreSQL TIME type which comes as a string in format "HH:MM:SS"
  if (typeof time === 'string') {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  // Handle Date objects
  if (time instanceof Date) {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  console.error('Invalid time format:', time);
  return null;
}

const userController = {
  // Get user profile information
  getUserProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      const query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          up.phone,
          up.address,
          up.city,
          up.state,
          up.country,
          up.date_of_birth,
          up.gender,
          up.blood_group,
          up.medical_history
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = $1
      `;

      const result = await pool.query(query, [userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: {
            phoneNumber: user.phone,
            address: user.address,
            city: user.city,
            state: user.state,
            country: user.country,
            dateOfBirth: user.date_of_birth,
            gender: user.gender,
            bloodGroup: user.blood_group,
            medicalHistory: user.medical_history
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get user appointments
  getUserAppointments: async (req, res) => {
    try {
      const userId = req.user.id;

      const query = `
        SELECT 
          a.*,
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
          l.address as location_address,
          ts.id as time_slot_id,
          ts.start_time,
          ts.end_time
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users du ON d.user_id = du.id
        LEFT JOIN specialties s ON d.specialty_id = s.id
        LEFT JOIN locations l ON d.location_id = l.id
        JOIN time_slots ts ON a.time_slot_id = ts.id
        WHERE a.patient_id = $1
        ORDER BY a.appointment_date DESC
      `;

      const result = await pool.query(query, [userId]);

      const appointments = result.rows.map(appointment => ({
        id: appointment.id,
        appointment_date: appointment.appointment_date,
        status: appointment.status,
        appointment_type: appointment.appointment_type,
        patient_problem: appointment.patient_problem,
        patient_age: appointment.patient_age,
        patient_gender: appointment.patient_gender,
        doctor: {
          id: appointment.doctor_id,
          name: appointment.doctor_name,
          email: appointment.doctor_email,
          degree: appointment.degree,
          experience_years: appointment.experience_years,
          consultation_fee: appointment.consultation_fee,
          specialty: {
            id: appointment.specialty_id,
            name: appointment.specialty_name
          },
          location: {
            name: appointment.location_name,
            address: appointment.location_address
          }
        },
        time_slot: {
          id: appointment.time_slot_id,
          start_time: formatTime(appointment.start_time),
          end_time: formatTime(appointment.end_time)
        }
      }));

      res.json({ appointments });
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update user profile
  updateUserProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        name,
        phoneNumber,
        address,
        city,
        state,
        country,
        dateOfBirth,
        gender,
        bloodGroup,
        medicalHistory
      } = req.body;

      // Start a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Update user name
        if (name) {
          await client.query(
            'UPDATE users SET name = $1 WHERE id = $2',
            [name, userId]
          );
        }

        // Update user profile
        const profileResult = await client.query(
          `UPDATE user_profiles 
           SET phone = $2,
               address = $3,
               city = $4,
               state = $5,
               country = $6,
               date_of_birth = $7,
               gender = $8,
               blood_group = $9,
               medical_history = $10
           WHERE user_id = $1
           RETURNING *`,
          [
            userId,
            phoneNumber || null,
            address || null,
            city || null,
            state || null,
            country || null,
            dateOfBirth || null,
            gender || null,
            bloodGroup || null,
            medicalHistory || null
          ]
        );

        await client.query('COMMIT');

        res.json({
          message: 'Profile updated successfully',
          profile: profileResult.rows[0]
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController; 