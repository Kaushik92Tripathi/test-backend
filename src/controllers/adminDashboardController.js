const pool = require('../db');

const adminDashboardController = {
  // Get dashboard data (appointments and doctors)
  getDashboardData: async (req, res) => {
    try {
      // Get appointments with stats
      const appointmentsQuery = `
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
        ORDER BY a.appointment_date DESC
      `;

      const appointmentsResult = await pool.query(appointmentsQuery);
      const appointments = appointmentsResult.rows.map(appointment => ({
        id: appointment.id,
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        appointmentDate: appointment.appointment_date,
        timeSlotId: appointment.time_slot_id,
        appointmentType: appointment.appointment_type,
        status: appointment.status,
        patientProblem: appointment.patient_problem,
        patientAge: appointment.patient_age,
        patientGender: appointment.patient_gender,
        doctor: {
          id: appointment.doctor_id,
          userId: appointment.doctor_id,
          degree: appointment.degree,
          experienceYears: appointment.experience_years,
          consultationFee: appointment.consultation_fee,
          user: {
            id: appointment.doctor_id,
            name: appointment.doctor_name,
            email: appointment.doctor_email
          },
          specialty: {
            id: appointment.specialty_id,
            name: appointment.specialty_name
          },
          location: {
            id: appointment.location_id,
            name: appointment.location_name,
            city: appointment.city,
            country: appointment.country
          }
        },
        patient: {
          id: appointment.patient_id,
          name: appointment.patient_name,
          email: appointment.patient_email
        },
        timeSlot: {
          id: appointment.time_slot_id,
          startTime: formatTime(appointment.start_time),
          endTime: formatTime(appointment.end_time)
        }
      }));

      // Calculate appointment stats
      const stats = {
        total: appointments.length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        pending: appointments.filter(a => a.status === 'pending').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length
      };

      // Get doctors with stats
      const doctorsQuery = `
        SELECT 
          d.*,
          u.name as doctor_name,
          u.email as doctor_email,
          s.id as specialty_id,
          s.name as specialty_name,
          l.id as location_id,
          l.name as location_name,
          l.city,
          l.country,
          COUNT(DISTINCT a.id) as total_patients
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN specialties s ON d.specialty_id = s.id
        LEFT JOIN locations l ON d.location_id = l.id
        LEFT JOIN appointments a ON d.id = a.doctor_id
        GROUP BY d.id, u.name, u.email, s.id, s.name, l.id, l.name, l.city, l.country
        ORDER BY d.id DESC
      `;

      const doctorsResult = await pool.query(doctorsQuery);
      const doctors = doctorsResult.rows.map(doctor => ({
        id: doctor.id,
        userId: doctor.user_id,
        specialtyId: doctor.specialty_id,
        degree: doctor.degree,
        experienceYears: doctor.experience_years,
        bio: doctor.bio,
        locationId: doctor.location_id,
        consultationFee: doctor.consultation_fee,
        isAvailable: doctor.is_available,
        avgRating: doctor.avg_rating,
        reviewCount: doctor.review_count,
        user: {
          id: doctor.user_id,
          name: doctor.doctor_name,
          email: doctor.doctor_email
        },
        specialty: {
          id: doctor.specialty_id,
          name: doctor.specialty_name
        },
        location: {
          id: doctor.location_id,
          name: doctor.location_name,
          city: doctor.city,
          country: doctor.country
        },
        totalPatients: parseInt(doctor.total_patients)
      }));

      res.json({
        appointments,
        stats,
        doctors
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

// Helper function to format time
function formatTime(time) {
  if (!time) return null;
  
  try {
    // If time is a string in HH:MM:SS format
    if (typeof time === 'string' && time.includes(':')) {
      const [hours, minutes] = time.split(':');
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    }
    
    // If time is a Date object or timestamp
    const date = time instanceof Date ? time : new Date(time);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', time);
      return null;
    }
    
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    
    return `${displayHour}:${minutes} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error, time);
    return null;
  }
}

module.exports = adminDashboardController; 