-- Clear existing data
TRUNCATE TABLE appointments, reviews, doctor_availability, time_slots, doctors, locations, specialties, users CASCADE;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE specialties_id_seq RESTART WITH 1;
ALTER SEQUENCE locations_id_seq RESTART WITH 1;
ALTER SEQUENCE doctors_id_seq RESTART WITH 1;
ALTER SEQUENCE time_slots_id_seq RESTART WITH 1;
ALTER SEQUENCE appointments_id_seq RESTART WITH 1;
ALTER SEQUENCE reviews_id_seq RESTART WITH 1;

-- Insert specialties
INSERT INTO specialties (name) VALUES
('Cardiology'),
('Dermatology'),
('Neurology'),
('Pediatrics'),
('Orthopedics'),
('Ophthalmology'),
('ENT'),
('General Medicine');

-- Insert users (doctors and patients)
INSERT INTO users (name, email, password, role, profile_picture) VALUES
-- Doctors
('Dr. John Smith', 'john.smith@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'https://example.com/doctor1.jpg'),
('Dr. Sarah Johnson', 'sarah.johnson@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'https://example.com/doctor2.jpg'),
('Dr. Michael Brown', 'michael.brown@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'https://example.com/doctor3.jpg'),
('Dr. Emily Davis', 'emily.davis@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'https://example.com/doctor4.jpg'),
-- Patients
('Alice Wilson', 'alice.wilson@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'https://example.com/patient1.jpg'),
('Bob Thompson', 'bob.thompson@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'https://example.com/patient2.jpg'),
('Carol Martinez', 'carol.martinez@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'https://example.com/patient3.jpg');

-- Insert locations
INSERT INTO locations (name, address, city, state) VALUES
('City Hospital', '123 Main St', 'New York', 'NY'),
('Medical Center', '456 Health Ave', 'Los Angeles', 'CA'),
('Community Clinic', '789 Care Blvd', 'Chicago', 'IL'),
('Health Complex', '321 Wellness Rd', 'Houston', 'TX');

-- Insert doctors
INSERT INTO doctors (user_id, specialty_id, degree, experience_years, bio, consultation_fee, location_id, is_available) VALUES
(1, 1, 'MD', 10, 'Experienced cardiologist with expertise in preventive care', 150.00, 1, true),
(2, 2, 'MD', 8, 'Board-certified dermatologist specializing in skin conditions', 120.00, 2, true),
(3, 3, 'MD', 12, 'Neurologist with focus on movement disorders', 180.00, 3, true),
(4, 4, 'MD', 6, 'Pediatrician dedicated to children''s health', 130.00, 4, true);

-- Insert time slots
INSERT INTO time_slots (start_time, end_time) VALUES
('09:00', '09:30'),
('09:30', '10:00'),
('10:00', '10:30'),
('10:30', '11:00'),
('11:00', '11:30'),
('11:30', '12:00'),
('12:00', '12:30'),
('12:30', '13:00'),
('13:00', '13:30'),
('13:30', '14:00'),
('14:00', '14:30'),
('14:30', '15:00'),
('15:00', '15:30'),
('15:30', '16:00'),
('16:00', '16:30'),
('16:30', '17:00');

-- Insert doctor availability
INSERT INTO doctor_availability (doctor_id, time_slot_id, day_of_week, is_available) VALUES
-- Dr. John Smith (Cardiologist) - Monday, Wednesday, Friday
(1, 1, 1, true), (1, 2, 1, true), (1, 3, 1, true), (1, 4, 1, true),
(1, 5, 1, true), (1, 6, 1, true), (1, 7, 1, true), (1, 8, 1, true),
(1, 9, 1, true), (1, 10, 1, true), (1, 11, 1, true), (1, 12, 1, true),
(1, 13, 1, true), (1, 14, 1, true), (1, 15, 1, true), (1, 16, 1, true),
(1, 1, 3, true), (1, 2, 3, true), (1, 3, 3, true), (1, 4, 3, true),
(1, 5, 3, true), (1, 6, 3, true), (1, 7, 3, true), (1, 8, 3, true),
(1, 9, 3, true), (1, 10, 3, true), (1, 11, 3, true), (1, 12, 3, true),
(1, 13, 3, true), (1, 14, 3, true), (1, 15, 3, true), (1, 16, 3, true),
(1, 1, 5, true), (1, 2, 5, true), (1, 3, 5, true), (1, 4, 5, true),
(1, 5, 5, true), (1, 6, 5, true), (1, 7, 5, true), (1, 8, 5, true),
(1, 9, 5, true), (1, 10, 5, true), (1, 11, 5, true), (1, 12, 5, true),
(1, 13, 5, true), (1, 14, 5, true), (1, 15, 5, true), (1, 16, 5, true),

-- Dr. Sarah Johnson (Dermatologist) - Tuesday, Thursday, Friday
(2, 1, 2, true), (2, 2, 2, true), (2, 3, 2, true), (2, 4, 2, true),
(2, 5, 2, true), (2, 6, 2, true), (2, 7, 2, true), (2, 8, 2, true),
(2, 9, 2, true), (2, 10, 2, true), (2, 11, 2, true), (2, 12, 2, true),
(2, 13, 2, true), (2, 14, 2, true), (2, 15, 2, true), (2, 16, 2, true),
(2, 1, 4, true), (2, 2, 4, true), (2, 3, 4, true), (2, 4, 4, true),
(2, 5, 4, true), (2, 6, 4, true), (2, 7, 4, true), (2, 8, 4, true),
(2, 9, 4, true), (2, 10, 4, true), (2, 11, 4, true), (2, 12, 4, true),
(2, 13, 4, true), (2, 14, 4, true), (2, 15, 4, true), (2, 16, 4, true),
(2, 1, 5, true), (2, 2, 5, true), (2, 3, 5, true), (2, 4, 5, true),
(2, 5, 5, true), (2, 6, 5, true), (2, 7, 5, true), (2, 8, 5, true),
(2, 9, 5, true), (2, 10, 5, true), (2, 11, 5, true), (2, 12, 5, true),
(2, 13, 5, true), (2, 14, 5, true), (2, 15, 5, true), (2, 16, 5, true);

-- Insert appointments
INSERT INTO appointments (doctor_id, patient_id, appointment_date, time_slot_id, status, appointment_type) VALUES
(1, 5, CURRENT_DATE + INTERVAL '1 day', 1, 'scheduled', 'video'),
(2, 6, CURRENT_DATE + INTERVAL '2 days', 5, 'scheduled', 'hospital'),
(3, 7, CURRENT_DATE + INTERVAL '3 days', 9, 'scheduled', 'video'),
(4, 5, CURRENT_DATE + INTERVAL '4 days', 13, 'scheduled', 'hospital');

-- Insert reviews
INSERT INTO reviews (doctor_id, patient_id, rating, comment) VALUES
(1, 5, 5, 'Excellent doctor, very professional and caring'),
(2, 6, 4, 'Great dermatologist, helped with my skin condition'),
(3, 7, 5, 'Very knowledgeable and thorough in diagnosis'),
(4, 5, 4, 'Great with children, my kids love her');

-- Update doctor ratings
UPDATE doctors 
SET avg_rating = (
  SELECT AVG(rating)::numeric(3,2)
  FROM reviews 
  WHERE doctor_id = doctors.id
),
review_count = (
  SELECT COUNT(*) 
  FROM reviews 
  WHERE doctor_id = doctors.id
); 