const pool = require('../db');

const locationController = {
  // Get locations for a specific doctor
  getDoctorLocations: async (req, res) => {
    try {
      const doctorId = parseInt(req.query.doctorId);
      
      if (!doctorId || isNaN(doctorId)) {
        return res.status(400).json({ error: 'Valid doctor ID is required' });
      }

      const query = `
        SELECT 
          l.id,
          l.name,
          l.address,
          l.city
        FROM locations l
        JOIN doctors d ON d.location_id = l.id
        WHERE d.id = $1
      `;

      const result = await pool.query(query, [doctorId]);

      if (result.rows.length === 0) {
        return res.json({ locations: [] });
      }

      const locations = result.rows.map(location => ({
        id: location.id,
        name: location.name,
        address: location.address,
        city: location.city,
        fullAddress: `${location.name}, ${location.address}, ${location.city}`
      }));

      res.json({ locations });
    } catch (error) {
      console.error('Error fetching doctor locations:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = locationController; 