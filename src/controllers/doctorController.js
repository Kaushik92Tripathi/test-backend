const pool = require('../db');
const { format, addDays, startOfDay, endOfDay } = require('date-fns');
const { formatTime } = require('../utils/timeUtils');

const doctorController = {
  // Get top doctors based on rating and review count
  getTopDoctors: async (req, res) => {
    try {
      const query = `
        SELECT 
          d.id,
          d.degree,
          d.experience_years,
          d.avg_rating,
          d.review_count,
          u.name as doctor_name,
          s.name as specialty_name
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN specialties s ON d.specialty_id = s.id
        WHERE d.is_available = true
        ORDER BY d.avg_rating DESC, d.review_count DESC
        LIMIT 6
      `;

      const result = await pool.query(query);
      
      const doctors = result.rows.map(doctor => ({
        id: doctor.id,
        degree: doctor.degree,
        experienceYears: doctor.experience_years,
        avgRating: doctor.avg_rating,
        name: doctor.doctor_name,
        specialtyName: doctor.specialty_name,
        profilePicture: doctor.profile_picture
      }));

      res.json({ doctors });
    } catch (error) {
      console.error('Error fetching top doctors:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all doctors with filters and pagination
  getAllDoctors: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 6,
        search = '',
        specialty,
        minRating = 0,
        minExperience = 0
      } = req.query;

      const offset = (page - 1) * limit;

      // Build the base query
      let query = `
        SELECT 
          d.id,
          d.degree,
          d.experience_years,
          d.bio,
          d.avg_rating,
          d.review_count,
          d.consultation_fee,
          u.id as user_id,
          u.name as doctor_name,
          s.id as specialty_id,
          s.name as specialty_name,
          l.id as location_id,
          l.name as location_name,
          l.city
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN specialties s ON d.specialty_id = s.id
        LEFT JOIN locations l ON d.location_id = l.id
        WHERE d.is_available = true
        AND d.avg_rating >= $1
        AND d.experience_years >= $2
      `;

      const queryParams = [minRating, minExperience];

      // Add search condition
      if (search) {
        query += ` AND (u.name ILIKE $${queryParams.length + 1} OR s.name ILIKE $${queryParams.length + 1})`;
        queryParams.push(`%${search}%`);
      }

      // Add specialty filter
      if (specialty) {
        query += ` AND s.name = $${queryParams.length + 1}`;
        queryParams.push(specialty);
      }

      // Get total count
      const countQuery = query.replace(/SELECT.*?FROM/s, 'SELECT COUNT(*) as total FROM');
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // If no doctors found, return empty array with specialties
      if (total === 0) {
        // Get all specialties for filters
        const specialtiesQuery = 'SELECT id, name FROM specialties ORDER BY name';
        const specialtiesResult = await pool.query(specialtiesQuery);

        return res.json({
          doctors: [],
          total: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          specialties: specialtiesResult.rows
        });
      }

      // Add ordering and pagination
      query += ` ORDER BY d.avg_rating DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(limit, offset);

      const result = await pool.query(query, queryParams);

      // Get all specialties for filters
      const specialtiesQuery = 'SELECT id, name FROM specialties ORDER BY name';
      const specialtiesResult = await pool.query(specialtiesQuery);

      const doctors = result.rows.map(doctor => ({
        id: doctor.id,
        userId: doctor.user_id,
        name: doctor.doctor_name,
        degree: doctor.degree,
        experienceYears: doctor.experience_years,
        bio: doctor.bio,
        avgRating: doctor.avg_rating,
        reviewCount: doctor.review_count,
        consultationFee: doctor.consultation_fee,
        specialty: {
          id: doctor.specialty_id,
          name: doctor.specialty_name
        },
        location: {
          id: doctor.location_id,
          name: doctor.location_name,
          city: doctor.city
        }
      }));

      res.json({
        doctors,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        specialties: specialtiesResult.rows
      });
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get doctor by ID with all related information
  getDoctorById: async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);

      if (isNaN(doctorId)) {
        return res.status(400).json({ error: 'Invalid doctor ID' });
      }

      const query = `
        SELECT 
          d.*,
          u.id as user_id,
          u.name as doctor_name,
          up.profile_picture,
          s.id as specialty_id,
          s.name as specialty_name,
          l.id as location_id,
          l.name as location_name,
          l.address,
          l.city,
          l.state
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN specialties s ON d.specialty_id = s.id
        LEFT JOIN locations l ON d.location_id = l.id
        WHERE d.id = $1
      `;

      const result = await pool.query(query, [doctorId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      const doctor = result.rows[0];

      // Get doctor's availability
      const availabilityQuery = `
        SELECT 
          da.day_of_week,
          ts.id as time_slot_id,
          ts.start_time,
          ts.end_time
        FROM doctor_availability da
        JOIN time_slots ts ON da.time_slot_id = ts.id
        WHERE da.doctor_id = $1 AND da.is_available = true
        ORDER BY da.day_of_week ASC, ts.start_time ASC
      `;

      const availabilityResult = await pool.query(availabilityQuery, [doctorId]);

      // Format the response
      res.json({
        doctor: {
          id: doctor.id,
          userId: doctor.user_id,
          specialtyId: doctor.specialty_id,
          degree: doctor.degree,
          experienceYears: doctor.experience_years,
          bio: doctor.bio,
          locationId: doctor.location_id,
          consultationFee: doctor.consultation_fee,
          isAvailable: doctor.is_available,
          avgRating: parseFloat(doctor.avg_rating || 0).toFixed(1),
          reviewCount: doctor.review_count || 0,
          user: {
            id: doctor.user_id,
            name: doctor.doctor_name,
            profilePicture: doctor.profile_picture
          },
          specialty: doctor.specialty_id ? {
            id: doctor.specialty_id,
            name: doctor.specialty_name
          } : null,
          location: doctor.location_id ? {
            id: doctor.location_id,
            name: doctor.location_name,
            address: doctor.address,
            city: doctor.city,
            state: doctor.state
          } : null
        },
        availability: availabilityResult.rows.map(a => ({
          dayOfWeek: a.day_of_week,
          timeSlotId: a.time_slot_id,
          startTime: formatTime(a.start_time),
          endTime: formatTime(a.end_time)
        }))
      });
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get doctor's availability for next 14 days
  getDoctorAvailability: async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const { date } = req.query;

      if (isNaN(doctorId)) {
        return res.status(400).json({ error: 'Invalid doctor ID' });
      }

      // Get the date to fetch availability for
      const startDate = startOfDay(date ? new Date(date) : new Date());
      const endDate = startOfDay(addDays(startDate, 14));

  

      // Get doctor's availability pattern
      const availabilityQuery = `
        SELECT 
          da.day_of_week,
          ts.id as time_slot_id,
          ts.start_time,
          ts.end_time
        FROM doctor_availability da
        JOIN time_slots ts ON da.time_slot_id = ts.id
        WHERE da.doctor_id = $1 AND da.is_available = true
        ORDER BY da.day_of_week ASC, ts.start_time ASC
      `;

      const availabilityResult = await pool.query(availabilityQuery, [doctorId]);
      console.log('Doctor availability pattern:', availabilityResult.rows);

      // Get booked appointments
      const bookedQuery = `
        SELECT 
          appointment_date,
          time_slot_id
        FROM appointments
        WHERE doctor_id = $1
        AND appointment_date >= $2
        AND appointment_date < $3
        AND status != 'cancelled'
      `;

      const bookedResult = await pool.query(bookedQuery, [doctorId, startDate, endDate]);
      console.log('Booked appointments:', bookedResult.rows);

      // Create a map of booked slots
      const bookedSlots = new Map();
      bookedResult.rows.forEach(appointment => {
        const dateKey = format(appointment.appointment_date, 'yyyy-MM-dd');
        if (!bookedSlots.has(dateKey)) {
          bookedSlots.set(dateKey, new Set());
        }
        bookedSlots.get(dateKey).add(appointment.time_slot_id);
      });

      // Group time slots by day
      const availabilityByDay = availabilityResult.rows.reduce((acc, slot) => {
        const day = slot.day_of_week;
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push({
          id: slot.time_slot_id,
          startTime: formatTime(slot.start_time),
          endTime: formatTime(slot.end_time),
          isAvailable: true
        });
        return acc;
      }, {});

      console.log('Availability by day:', availabilityByDay);

      // Generate dates with available slots
      const dates = [];
      let currentDate = startDate;
      while (currentDate <= endDate) {
        // Convert getDay() (0-6) to our database format (1-7)
        const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay();
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        const bookedSlotsForDate = bookedSlots.get(dateKey) || new Set();
        
        const timeSlots = (availabilityByDay[dayOfWeek] || []).map(slot => ({
          ...slot,
          isAvailable: !bookedSlotsForDate.has(slot.id)
        }));

        dates.push({
          date: format(currentDate, 'dd'),
          day: format(currentDate, 'EEE'),
          month: format(currentDate, 'MMM'),
          fullDate: format(currentDate, 'yyyy-MM-dd'),
          timeSlots
        });

        currentDate = addDays(currentDate, 1);
      }

      console.log('Final dates response:', dates);
      res.json({ dates });
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = doctorController; 


