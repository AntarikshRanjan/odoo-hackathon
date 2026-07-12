import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Load .env file manually to avoid external dependencies
def load_env_file(file_path):
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip()

# Load env variables from local and relative paths
db_dir = os.path.dirname(os.path.abspath(__file__))
load_env_file(os.path.join(db_dir, ".env"))
load_env_file(".env")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres") # local default
DB_NAME = os.getenv("DB_NAME", "transitops")

# Complete PostgreSQL DDL Schema
SCHEMA_SQL = """
-- Drop tables if they exist for clean initialization
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS fuel_logs CASCADE;
DROP TABLE IF EXISTS maintenance_logs CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (RBAC)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Operations Lead', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst')),
    attempts INT DEFAULT 0 CHECK (attempts >= 0),
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Vehicles Table
CREATE TABLE vehicles (
    id VARCHAR(50) PRIMARY KEY,
    reg_number VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity_kg INT NOT NULL CHECK (capacity_kg > 0),
    odometer_km INT NOT NULL CHECK (odometer_km >= 0) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'On Trip', 'In Shop', 'Retired')),
    region VARCHAR(50) NOT NULL,
    fuel_type VARCHAR(20) NOT NULL CHECK (fuel_type IN ('Diesel', 'Petrol', 'CNG', 'Electric', 'LPG')),
    last_service DATE NOT NULL,
    acq_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.0 CHECK (acq_cost >= 0.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for registration search
CREATE INDEX idx_vehicles_reg_number ON vehicles(reg_number);

-- 3. Drivers Table
CREATE TABLE drivers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_category VARCHAR(50) NOT NULL,
    license_expiry DATE NOT NULL,
    safety_score INT NOT NULL CHECK (safety_score BETWEEN 0 AND 100),
    status VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'On Trip', 'Off Duty', 'Suspended')),
    region VARCHAR(50) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for driver status/name
CREATE INDEX idx_drivers_status ON drivers(status);

-- 4. Trips Table
CREATE TABLE trips (
    id VARCHAR(50) PRIMARY KEY,
    origin VARCHAR(150) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    cargo_weight_kg INT NOT NULL CHECK (cargo_weight_kg > 0),
    vehicle_id VARCHAR(50) NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    driver_id VARCHAR(50) NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled')),
    departure_date TIMESTAMP WITH TIME ZONE NOT NULL,
    eta TIMESTAMP WITH TIME ZONE,
    region VARCHAR(50) NOT NULL,
    final_odometer INT CHECK (final_odometer >= 0),
    fuel_consumed NUMERIC(6, 2) CHECK (fuel_consumed >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for trip status
CREATE INDEX idx_trips_status ON trips(status);

-- 5. Maintenance Logs Table
CREATE TABLE maintenance_logs (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    cost NUMERIC(10, 2) NOT NULL CHECK (cost >= 0.0),
    opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Fuel Logs Table
CREATE TABLE fuel_logs (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    vehicle_id VARCHAR(50) NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    liters NUMERIC(6, 2) NOT NULL CHECK (liters >= 0.0),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0.0),
    odometer_reading INT CHECK (odometer_reading >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Expenses Table
CREATE TABLE expenses (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Fuel', 'Maintenance', 'Toll', 'Parking', 'Insurance', 'Permit', 'Other')),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0.0),
    vehicle_id VARCHAR(50) NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    trip_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for expense reporting
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_vehicle ON expenses(vehicle_id);
"""

# Complete Seed Insertion SQL
SEED_SQL = """
-- 1. Seed Users
INSERT INTO users (name, email, password_hash, role) VALUES
('Ava Singh', 'ops@transitops.io', 'pbkdf2:sha256:260000$demo123', 'Operations Lead'),
('Fleet Manager User', 'manager@transitops.io', 'pbkdf2:sha256:260000$demo123', 'Fleet Manager'),
('Dispatcher User', 'dispatch@transitops.io', 'pbkdf2:sha256:260000$demo123', 'Dispatcher'),
('Safety Officer User', 'safety@transitops.io', 'pbkdf2:sha256:260000$demo123', 'Safety Officer'),
('Financial Analyst User', 'finance@transitops.io', 'pbkdf2:sha256:260000$demo123', 'Financial Analyst');

-- 2. Seed Vehicles
INSERT INTO vehicles (id, reg_number, model, type, capacity_kg, odometer_km, status, region, fuel_type, last_service, acq_cost) VALUES
('VH-001', 'MH12-TR-1042', 'Ashok Leyland Dost+', 'Light Truck', 900, 84210, 'Available', 'West', 'Diesel', '2026-06-18', 750000.00),
('VH-002', 'DL01-TR-7740', 'Tata Ace EV', 'Mini Truck', 600, 41120, 'On Trip', 'North', 'Electric', '2026-05-30', 680000.00),
('VH-003', 'KA05-TR-8891', 'Mahindra Jeeto', 'Mini Truck', 500, 63140, 'In Shop', 'South', 'Diesel', '2026-07-09', 450000.00),
('VH-004', 'GJ18-TR-2204', 'Eicher Pro 2049', 'Heavy Truck', 3500, 128090, 'Available', 'West', 'Diesel', '2026-06-03', 1250000.00),
('VH-005', 'TN10-TR-5520', 'Force Traveller Cargo', 'Van', 1200, 92030, 'Available', 'South', 'Diesel', '2026-06-26', 980000.00),
('VH-006', 'RJ14-TR-6618', 'BharatBenz 1917R', 'Heavy Truck', 7000, 174420, 'Retired', 'North', 'Diesel', '2026-02-11', 2400000.00),
('VH-007', 'WB19-TR-7843', 'Piaggio Ape Xtra', 'Three-Wheeler', 350, 28310, 'Available', 'East', 'CNG', '2026-07-01', 320000.00),
('VH-008', 'UP32-TR-3121', 'Tata 407 Gold', 'Light Truck', 2500, 109870, 'On Trip', 'North', 'Diesel', '2026-06-09', 890000.00);

-- 3. Seed Drivers
INSERT INTO drivers (id, name, license_number, license_category, license_expiry, safety_score, status, region, contact_number) VALUES
('DR-001', 'Aarav Patel', 'DL-09281-4472', 'Light', '2026-08-04', 96, 'Available', 'West', '+91 98765 43220'),
('DR-002', 'Neha Singh', 'DL-20211-1103', 'Medium', '2026-07-24', 91, 'On Trip', 'North', '+91 98765 43221'),
('DR-003', 'Rohan Iyer', 'DL-99210-7718', 'Heavy', '2026-07-15', 88, 'Available', 'South', '+91 98765 43222'),
('DR-004', 'Zoya Khan', 'DL-18372-5501', 'Heavy', '2026-11-18', 98, 'Available', 'West', '+91 98765 43223'),
('DR-005', 'Kabir Sharma', 'DL-55671-4904', 'Heavy', '2026-06-30', 72, 'Suspended', 'East', '+91 98765 43224'),
('DR-006', 'Priya Nair', 'DL-11092-6814', 'Medium', '2026-09-09', 94, 'Available', 'South', '+91 98765 43225'),
('DR-007', 'Ishaan Verma', 'DL-78112-2307', 'Medium', '2026-10-02', 89, 'On Trip', 'North', '+91 98765 43226');

-- 4. Seed Trips
INSERT INTO trips (id, origin, destination, cargo_weight_kg, vehicle_id, driver_id, status, departure_date, eta, region, final_odometer, fuel_consumed) VALUES
('TR-2026-0102', 'Mumbai Hub', 'Pune Central', 420, 'VH-002', 'DR-002', 'Dispatched', '2026-07-12 08:10:00+05:30', '2026-07-12 16:30:00+05:30', 'West', NULL, NULL),
('TR-2026-0103', 'Lucknow Yard', 'Kanpur Dock', 1380, 'VH-008', 'DR-007', 'Dispatched', '2026-07-12 06:30:00+05:30', '2026-07-12 14:20:00+05:30', 'North', NULL, NULL),
('TR-2026-0098', 'Bengaluru South', 'Mysuru Node', 300, 'VH-007', 'DR-006', 'Completed', '2026-07-10 09:00:00+05:30', '2026-07-10 13:40:00+05:30', 'South', 28355, 4.2),
('TR-2026-0095', 'Ahmedabad Hub', 'Vadodara West', 780, 'VH-001', 'DR-001', 'Completed', '2026-07-09 07:20:00+05:30', '2026-07-09 11:35:00+05:30', 'West', 84310, 11.5),
('TR-2026-0094', 'Chennai Port', 'Coimbatore DC', 930, 'VH-005', 'DR-003', 'Cancelled', '2026-07-09 04:10:00+05:30', '2026-07-09 14:50:00+05:30', 'South', NULL, NULL);

-- 5. Seed Maintenance Logs
INSERT INTO maintenance_logs (id, vehicle_id, type, cost, opened_at, closed_at, status, notes) VALUES
('MT-103', 'VH-003', 'Brake Inspection', 340.00, '2026-07-09 10:00:00+05:30', NULL, 'Open', 'Rear brake pad wear detected.'),
('MT-101', 'VH-005', 'Oil Change', 140.00, '2026-06-28 11:15:00+05:30', '2026-06-28 14:00:00+05:30', 'Closed', 'Routine service completed.'),
('MT-099', 'VH-004', 'Tire Rotation', 210.00, '2026-06-17 09:20:00+05:30', '2026-06-17 11:45:00+05:30', 'Closed', 'Front-left tread wear normalized.');

-- 6. Seed Fuel Logs
INSERT INTO fuel_logs (id, date, vehicle_id, liters, amount, odometer_reading) VALUES
('FL-501', '2026-07-11', 'VH-001', 38.00, 49.00, 84150),
('FL-502', '2026-07-11', 'VH-004', 84.00, 111.00, 128000),
('FL-503', '2026-07-10', 'VH-005', 46.00, 60.00, 91980),
('FL-504', '2026-07-10', 'VH-008', 68.00, 89.00, 109800),
('FL-505', '2026-07-09', 'VH-002', 25.00, 32.00, 41080);

-- 7. Seed Expenses
INSERT INTO expenses (id, date, category, amount, vehicle_id, trip_id) VALUES
('EX-201', '2026-07-11', 'Maintenance', 340.00, 'VH-003', NULL),
('EX-202', '2026-07-10', 'Insurance', 210.00, 'VH-004', NULL),
('EX-203', '2026-07-09', 'Toll', 88.00, 'VH-002', 'TR-2026-0102'),
('EX-204', '2026-07-09', 'Maintenance', 140.00, 'VH-005', NULL),
('EX-205', '2026-07-08', 'Parking', 26.00, 'VH-001', NULL);
"""

def create_database():
    print("Connecting to PostgreSQL to check/create database...")
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Database '{DB_NAME}' does not exist. Creating...")
            cursor.execute(f"CREATE DATABASE {DB_NAME}")
            print(f"Database '{DB_NAME}' created successfully.")
        else:
            print(f"Database '{DB_NAME}' already exists.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error connecting/creating database: {e}")
        print("\nPlease make sure your PostgreSQL service is running and credentials are correct.")
        raise e

def initialize_schema_and_seed():
    print(f"Connecting to database '{DB_NAME}' to initialize schema & seed...")
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # 1. Run schema DDL
        print("Creating database schema...")
        cursor.execute(SCHEMA_SQL)
        print("Schema initialized successfully.")
        
        # 2. Run seed SQL
        print("Seeding database values...")
        cursor.execute(SEED_SQL)
        print("Seed data populated successfully.")
        
        cursor.close()
        conn.close()
        print("\nDatabase initialization complete!")
    except Exception as e:
        print(f"Error initializing schema: {e}")
        raise e

if __name__ == "__main__":
    print("--- TRANSITOPS POSTGRESQL INITIALIZER ---")
    try:
        create_database()
        initialize_schema_and_seed()
    except Exception as e:
        print("\nInitialization failed.")
