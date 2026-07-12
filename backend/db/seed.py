import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

DB_HOST = "localhost"
DB_PORT = "5432"
DB_USER = "postgres"
DB_PASSWORD = "lmao"
DB_NAME = "transitops"

SEED_SQL = """
-- Vehicles (10 records)
INSERT INTO vehicles (id, reg_number, model, type, capacity_kg, odometer_km, status, region, fuel_type, last_service, acq_cost) VALUES
('VH-001', 'MH12-TR-1042', 'Ashok Leyland Dost+', 'Light Truck', 900, 84210, 'Available', 'West', 'Diesel', '2026-06-18', 750000.00),
('VH-002', 'DL01-TR-7740', 'Tata Ace EV', 'Mini Truck', 600, 41120, 'On Trip', 'North', 'Electric', '2026-05-30', 680000.00),
('VH-003', 'KA05-TR-8891', 'Mahindra Jeeto', 'Mini Truck', 500, 63140, 'In Shop', 'South', 'Diesel', '2026-07-09', 450000.00),
('VH-004', 'GJ18-TR-2204', 'Eicher Pro 2049', 'Heavy Truck', 3500, 128090, 'Available', 'West', 'Diesel', '2026-06-03', 1250000.00),
('VH-005', 'TN10-TR-5520', 'Force Traveller Cargo', 'Van', 1200, 92030, 'Available', 'South', 'Diesel', '2026-06-26', 980000.00),
('VH-006', 'RJ14-TR-6618', 'BharatBenz 1917R', 'Heavy Truck', 7000, 174420, 'Retired', 'North', 'Diesel', '2026-02-11', 2400000.00),
('VH-007', 'WB19-TR-7843', 'Piaggio Ape Xtra', 'Three-Wheeler', 350, 28310, 'Available', 'East', 'CNG', '2026-07-01', 320000.00),
('VH-008', 'UP32-TR-3121', 'Tata 407 Gold', 'Light Truck', 2500, 109870, 'On Trip', 'North', 'Diesel', '2026-06-09', 890000.00),
('VH-009', 'MH14-TR-5501', 'Tata Ultra', 'Light Truck', 1500, 55400, 'Available', 'West', 'Diesel', '2026-07-05', 720000.00),
('VH-010', 'DL04-TR-9922', 'Eicher Pro 1110', 'Heavy Truck', 5000, 142300, 'Available', 'North', 'Diesel', '2026-06-20', 1650000.00);

-- Drivers (10 records)
INSERT INTO drivers (id, name, license_number, license_category, license_expiry, safety_score, status, region, contact_number) VALUES
('DR-001', 'Aarav Patel', 'DL-09281-4472', 'Light', '2026-08-04', 96, 'Available', 'West', '+91 98765 43220'),
('DR-002', 'Neha Singh', 'DL-20211-1103', 'Medium', '2026-07-24', 91, 'On Trip', 'North', '+91 98765 43221'),
('DR-003', 'Rohan Iyer', 'DL-99210-7718', 'Heavy', '2026-07-15', 88, 'Available', 'South', '+91 98765 43222'),
('DR-004', 'Zoya Khan', 'DL-18372-5501', 'Heavy', '2026-11-18', 98, 'Available', 'West', '+91 98765 43223'),
('DR-005', 'Kabir Sharma', 'DL-55671-4904', 'Heavy', '2026-06-30', 72, 'Suspended', 'East', '+91 98765 43224'),
('DR-006', 'Priya Nair', 'DL-11092-6814', 'Medium', '2026-09-09', 94, 'Available', 'South', '+91 98765 43225'),
('DR-007', 'Ishaan Verma', 'DL-78112-2307', 'Medium', '2026-10-02', 89, 'On Trip', 'North', '+91 98765 43226'),
('DR-008', 'Meera Joshi', 'DL-33218-8890', 'Light', '2026-07-20', 85, 'Available', 'West', '+91 98765 43227'),
('DR-009', 'Arjun Reddy', 'DL-44521-3316', 'Heavy', '2026-08-15', 92, 'Available', 'South', '+91 98765 43228'),
('DR-010', 'Sneha Gupta', 'DL-66734-5502', 'Medium', '2026-07-12', 78, 'Available', 'North', '+91 98765 43229');

-- Trips (15 records with various statuses)
INSERT INTO trips (id, origin, destination, cargo_weight_kg, vehicle_id, driver_id, status, departure_date, eta, region, final_odometer, fuel_consumed) VALUES
('TR-2026-0102', 'Mumbai Hub', 'Pune Central', 420, 'VH-002', 'DR-002', 'Dispatched', '2026-07-12 08:10:00+05:30', '2026-07-12 16:30:00+05:30', 'West', NULL, NULL),
('TR-2026-0103', 'Lucknow Yard', 'Kanpur Dock', 1380, 'VH-008', 'DR-007', 'Dispatched', '2026-07-12 06:30:00+05:30', '2026-07-12 14:20:00+05:30', 'North', NULL, NULL),
('TR-2026-0098', 'Bengaluru South', 'Mysuru Node', 300, 'VH-007', 'DR-006', 'Completed', '2026-07-10 09:00:00+05:30', '2026-07-10 13:40:00+05:30', 'South', 28355, 4.2),
('TR-2026-0095', 'Ahmedabad Hub', 'Vadodara West', 780, 'VH-001', 'DR-001', 'Completed', '2026-07-09 07:20:00+05:30', '2026-07-09 11:35:00+05:30', 'West', 84310, 11.5),
('TR-2026-0094', 'Chennai Port', 'Coimbatore DC', 930, 'VH-005', 'DR-003', 'Cancelled', '2026-07-09 04:10:00+05:30', '2026-07-09 14:50:00+05:30', 'South', NULL, NULL),
('TR-2026-0090', 'Mumbai Hub', 'Nagpur Hub', 2200, 'VH-009', 'DR-008', 'Completed', '2026-07-08 05:00:00+05:30', '2026-07-08 18:00:00+05:30', 'West', 55890, 32.5),
('TR-2026-0088', 'Delhi Noida', 'Jaipur DC', 1800, 'VH-010', 'DR-004', 'Completed', '2026-07-07 06:00:00+05:30', '2026-07-07 15:30:00+05:30', 'North', 142800, 28.0),
('TR-2026-0085', 'Pune City', 'Mumbai Port', 550, 'VH-009', 'DR-001', 'Completed', '2026-07-06 08:00:00+05:30', '2026-07-06 14:00:00+05:30', 'West', 55600, 18.3),
('TR-2026-0082', 'Hyderabad Hub', 'Vizag Port', 3200, 'VH-004', 'DR-009', 'Dispatched', '2026-07-11 04:30:00+05:30', '2026-07-11 18:00:00+05:30', 'South', NULL, NULL),
('TR-2026-0080', 'Kolkata Dock', 'Patna Hub', 1100, 'VH-007', 'DR-010', 'Completed', '2026-07-05 07:00:00+05:30', '2026-07-05 16:00:00+05:30', 'East', 28500, 5.8),
('TR-2026-0078', 'Chennai Port', 'Bengaluru DC', 800, 'VH-005', 'DR-003', 'Completed', '2026-07-04 05:30:00+05:30', '2026-07-04 12:30:00+05:30', 'South', 92450, 14.2),
('TR-2026-0075', 'Ahmedabad Hub', 'Rajkot DC', 650, 'VH-001', 'DR-004', 'Completed', '2026-07-03 06:00:00+05:30', '2026-07-03 11:00:00+05:30', 'West', 84100, 9.8),
('TR-2026-0072', 'Delhi Noida', 'Chandigarh Hub', 1500, 'VH-008', 'DR-007', 'Completed', '2026-07-02 04:00:00+05:30', '2026-07-02 12:00:00+05:30', 'North', 110200, 22.1),
('TR-2026-0070', 'Mumbai Hub', 'Goa Hub', 400, 'VH-009', 'DR-008', 'Cancelled', '2026-07-01 09:00:00+05:30', '2026-07-01 18:00:00+05:30', 'West', NULL, NULL),
('TR-2026-0068', 'Hyderabad Hub', 'Bengaluru DC', 2800, 'VH-004', 'DR-009', 'Completed', '2026-06-30 05:00:00+05:30', '2026-06-30 14:00:00+05:30', 'South', 128500, 35.0);

-- Maintenance (10 records)
INSERT INTO maintenance_logs (id, vehicle_id, type, cost, opened_at, closed_at, status, notes) VALUES
('MT-103', 'VH-003', 'Brake Inspection', 340.00, '2026-07-09 10:00:00+05:30', NULL, 'Open', 'Rear brake pad wear detected.'),
('MT-101', 'VH-005', 'Oil Change', 140.00, '2026-06-28 11:15:00+05:30', '2026-06-28 14:00:00+05:30', 'Closed', 'Routine service completed.'),
('MT-099', 'VH-004', 'Tire Rotation', 210.00, '2026-06-17 09:20:00+05:30', '2026-06-17 11:45:00+05:30', 'Closed', 'Front-left tread wear normalized.'),
('MT-098', 'VH-001', 'Engine Service', 850.00, '2026-06-10 08:00:00+05:30', '2026-06-11 17:00:00+05:30', 'Closed', 'Full engine overhaul completed.'),
('MT-097', 'VH-008', 'Clutch Replacement', 1200.00, '2026-06-05 09:00:00+05:30', '2026-06-07 16:00:00+05:30', 'Closed', 'Clutch plate and bearing replaced.'),
('MT-096', 'VH-002', 'Battery Check', 180.00, '2026-06-20 10:00:00+05:30', '2026-06-20 12:00:00+05:30', 'Closed', 'EV battery health at 94%.'),
('MT-095', 'VH-010', 'Suspension Repair', 650.00, '2026-07-01 08:30:00+05:30', '2026-07-02 14:00:00+05:30', 'Closed', 'Front suspension arm replaced.'),
('MT-094', 'VH-009', 'AC Compressor', 420.00, '2026-06-25 11:00:00+05:30', '2026-06-26 15:00:00+05:30', 'Closed', 'AC compressor and gas refill.'),
('MT-093', 'VH-006', 'Major Overhaul', 3500.00, '2026-02-01 08:00:00+05:30', '2026-02-11 18:00:00+05:30', 'Closed', 'Full vehicle overhaul before retirement.'),
('MT-092', 'VH-007', 'Electrical Fix', 275.00, '2026-06-22 09:00:00+05:30', '2026-06-22 13:30:00+05:30', 'Closed', 'Wiring harness repair for headlamp.');

-- Fuel Logs (12 records)
INSERT INTO fuel_logs (id, date, vehicle_id, liters, amount, odometer_reading) VALUES
('FL-501', '2026-07-11', 'VH-001', 38.00, 49.00, 84150),
('FL-502', '2026-07-11', 'VH-004', 84.00, 111.00, 128000),
('FL-503', '2026-07-10', 'VH-005', 46.00, 60.00, 91980),
('FL-504', '2026-07-10', 'VH-008', 68.00, 89.00, 109800),
('FL-505', '2026-07-09', 'VH-002', 25.00, 32.00, 41080),
('FL-506', '2026-07-08', 'VH-009', 42.00, 55.00, 55700),
('FL-507', '2026-07-07', 'VH-010', 72.00, 94.00, 142500),
('FL-508', '2026-07-06', 'VH-009', 38.00, 50.00, 55450),
('FL-509', '2026-07-05', 'VH-007', 12.00, 16.00, 28400),
('FL-510', '2026-07-04', 'VH-005', 44.00, 58.00, 92200),
('FL-511', '2026-07-03', 'VH-001', 35.00, 46.00, 84050),
('FL-512', '2026-07-02', 'VH-008', 58.00, 76.00, 110000);

-- Expenses (10 records)
INSERT INTO expenses (id, date, category, amount, vehicle_id, trip_id) VALUES
('EX-201', '2026-07-11', 'Maintenance', 340.00, 'VH-003', NULL),
('EX-202', '2026-07-10', 'Insurance', 210.00, 'VH-004', NULL),
('EX-203', '2026-07-09', 'Toll', 88.00, 'VH-002', 'TR-2026-0102'),
('EX-204', '2026-07-09', 'Maintenance', 140.00, 'VH-005', NULL),
('EX-205', '2026-07-08', 'Parking', 26.00, 'VH-001', NULL),
('EX-206', '2026-07-08', 'Toll', 120.00, 'VH-009', 'TR-2026-0090'),
('EX-207', '2026-07-07', 'Toll', 145.00, 'VH-010', 'TR-2026-0088'),
('EX-208', '2026-07-06', 'Permit', 350.00, 'VH-009', 'TR-2026-0085'),
('EX-209', '2026-07-05', 'Parking', 35.00, 'VH-007', 'TR-2026-0080'),
('EX-210', '2026-07-04', 'Toll', 95.00, 'VH-005', 'TR-2026-0078');
"""

def seed_more_data():
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, user=DB_USER,
            password=DB_PASSWORD, database=DB_NAME
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Clear existing data
        cursor.execute("DELETE FROM expenses")
        cursor.execute("DELETE FROM fuel_logs")
        cursor.execute("DELETE FROM maintenance_logs")
        cursor.execute("DELETE FROM trips")
        cursor.execute("DELETE FROM drivers")
        cursor.execute("DELETE FROM vehicles")
        
        # Insert fresh seed data
        cursor.execute(SEED_SQL)
        print("Seed data inserted successfully!")
        
        # Verify counts
        for table in ['vehicles', 'drivers', 'trips', 'maintenance_logs', 'fuel_logs', 'expenses']:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"  {table}: {count} records")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
        raise

if __name__ == "__main__":
    seed_more_data()
