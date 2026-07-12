-- PostgreSQL Seed Data for TransitOps

-- 1. Seed Users (passwords hashed/stubbed)
INSERT INTO users (name, email, password_hash, role) VALUES
('Ava Singh', 'ops@transitops.io', 'pbkdf2:sha256:260000$demo123', 'Operations Lead'),
('Fleet Manager User', 'manager@transitops.io', 'pbkdf2:sha256:260000$demo123', 'Fleet Manager'),
('Dispatcher User', 'dispatch@transitops.io', 'pbkdf2:sha256:260000$demo123', 'Dispatcher'),
('Safety Officer User', 'safety@transitops.io', 'pbkdf2:sha256:260000$demo123', 'Safety Officer'),
('Financial Analyst User', 'finance@transitops.io', 'pbkdf2:sha256:260000$demo123', 'Financial Analyst');

-- 2. Seed Vehicles (from initialVehicles)
INSERT INTO vehicles (id, reg_number, model, type, capacity_kg, odometer_km, status, region, fuel_type, last_service, acq_cost) VALUES
('VH-001', 'MH12-TR-1042', 'Ashok Leyland Dost+', 'Light Truck', 900, 84210, 'Available', 'West', 'Diesel', '2026-06-18', 750000.00),
('VH-002', 'DL01-TR-7740', 'Tata Ace EV', 'Mini Truck', 600, 41120, 'On Trip', 'North', 'Electric', '2026-05-30', 680000.00),
('VH-003', 'KA05-TR-8891', 'Mahindra Jeeto', 'Mini Truck', 500, 63140, 'In Shop', 'South', 'Diesel', '2026-07-09', 450000.00),
('VH-004', 'GJ18-TR-2204', 'Eicher Pro 2049', 'Heavy Truck', 3500, 128090, 'Available', 'West', 'Diesel', '2026-06-03', 1250000.00),
('VH-005', 'TN10-TR-5520', 'Force Traveller Cargo', 'Van', 1200, 92030, 'Available', 'South', 'Diesel', '2026-06-26', 980000.00),
('VH-006', 'RJ14-TR-6618', 'BharatBenz 1917R', 'Heavy Truck', 7000, 174420, 'Retired', 'North', 'Diesel', '2026-02-11', 2400000.00),
('VH-007', 'WB19-TR-7843', 'Piaggio Ape Xtra', 'Three-Wheeler', 350, 28310, 'Available', 'East', 'CNG', '2026-07-01', 320000.00),
('VH-008', 'UP32-TR-3121', 'Tata 407 Gold', 'Light Truck', 2500, 109870, 'On Trip', 'North', 'Diesel', '2026-06-09', 890000.00);

-- 3. Seed Drivers (from initialDrivers)
INSERT INTO drivers (id, name, license_number, license_category, license_expiry, safety_score, status, region, contact_number) VALUES
('DR-001', 'Aarav Patel', 'DL-09281-4472', 'Light', '2026-08-04', 96, 'Available', 'West', '+91 98765 43220'),
('DR-002', 'Neha Singh', 'DL-20211-1103', 'Medium', '2026-07-24', 91, 'On Trip', 'North', '+91 98765 43221'),
('DR-003', 'Rohan Iyer', 'DL-99210-7718', 'Heavy', '2026-07-15', 88, 'Available', 'South', '+91 98765 43222'),
('DR-004', 'Zoya Khan', 'DL-18372-5501', 'Heavy', '2026-11-18', 98, 'Available', 'West', '+91 98765 43223'),
('DR-005', 'Kabir Sharma', 'DL-55671-4904', 'Heavy', '2026-06-30', 72, 'Suspended', 'East', '+91 98765 43224'),
('DR-006', 'Priya Nair', 'DL-11092-6814', 'Medium', '2026-09-09', 94, 'Available', 'South', '+91 98765 43225'),
('DR-007', 'Ishaan Verma', 'DL-78112-2307', 'Medium', '2026-10-02', 89, 'On Trip', 'North', '+91 98765 43226');

-- 4. Seed Trips (from initialTrips)
INSERT INTO trips (id, origin, destination, cargo_weight_kg, vehicle_id, driver_id, status, departure_date, eta, region, final_odometer, fuel_consumed) VALUES
('TR-2026-0102', 'Mumbai Hub', 'Pune Central', 420, 'VH-002', 'DR-002', 'Dispatched', '2026-07-12 08:10:00+05:30', '2026-07-12 16:30:00+05:30', 'West', NULL, NULL),
('TR-2026-0103', 'Lucknow Yard', 'Kanpur Dock', 1380, 'VH-008', 'DR-007', 'Dispatched', '2026-07-12 06:30:00+05:30', '2026-07-12 14:20:00+05:30', 'North', NULL, NULL),
('TR-2026-0098', 'Bengaluru South', 'Mysuru Node', 300, 'VH-007', 'DR-006', 'Completed', '2026-07-10 09:00:00+05:30', '2026-07-10 13:40:00+05:30', 'South', 28355, 4.2),
('TR-2026-0095', 'Ahmedabad Hub', 'Vadodara West', 780, 'VH-001', 'DR-001', 'Completed', '2026-07-09 07:20:00+05:30', '2026-07-09 11:35:00+05:30', 'West', 84310, 11.5),
('TR-2026-0094', 'Chennai Port', 'Coimbatore DC', 930, 'VH-005', 'DR-003', 'Cancelled', '2026-07-09 04:10:00+05:30', '2026-07-09 14:50:00+05:30', 'South', NULL, NULL);

-- 5. Seed Maintenance Logs (from initialMaintenance)
INSERT INTO maintenance_logs (id, vehicle_id, type, cost, opened_at, closed_at, status, notes) VALUES
('MT-103', 'VH-003', 'Brake Inspection', 340.00, '2026-07-09 10:00:00+05:30', NULL, 'Open', 'Rear brake pad wear detected.'),
('MT-101', 'VH-005', 'Oil Change', 140.00, '2026-06-28 11:15:00+05:30', '2026-06-28 14:00:00+05:30', 'Closed', 'Routine service completed.'),
('MT-099', 'VH-004', 'Tire Rotation', 210.00, '2026-06-17 09:20:00+05:30', '2026-06-17 11:45:00+05:30', 'Closed', 'Front-left tread wear normalized.');

-- 6. Seed Fuel Logs (from initialFuelLogs)
INSERT INTO fuel_logs (id, date, vehicle_id, liters, amount, odometer_reading) VALUES
('FL-501', '2026-07-11', 'VH-001', 38.00, 49.00, 84150),
('FL-502', '2026-07-11', 'VH-004', 84.00, 111.00, 128000),
('FL-503', '2026-07-10', 'VH-005', 46.00, 60.00, 91980),
('FL-504', '2026-07-10', 'VH-008', 68.00, 89.00, 109800),
('FL-505', '2026-07-09', 'VH-002', 25.00, 32.00, 41080);

-- 7. Seed Expenses (from initialExpenses)
INSERT INTO expenses (id, date, category, amount, vehicle_id, trip_id) VALUES
('EX-201', '2026-07-11', 'Maintenance', 340.00, 'VH-003', NULL),
('EX-202', '2026-07-10', 'Insurance', 210.00, 'VH-004', NULL),
('EX-203', '2026-07-09', 'Toll', 88.00, 'VH-002', 'TR-2026-0102'),
('EX-204', '2026-07-09', 'Maintenance', 140.00, 'VH-005', NULL),
('EX-205', '2026-07-08', 'Parking', 26.00, 'VH-001', NULL);
