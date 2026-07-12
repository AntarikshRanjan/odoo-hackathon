-- PostgreSQL DDL Schema for TransitOps

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
    trip_id VARCHAR(50), -- Optional reference to trip
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for expense reporting
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_vehicle ON expenses(vehicle_id);
