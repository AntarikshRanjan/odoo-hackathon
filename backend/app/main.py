import os
import decimal
import datetime
from typing import Optional, Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

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
db_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_env_file(os.path.join(db_dir, "db", ".env"))
load_env_file(".env")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_NAME = os.getenv("DB_NAME", "transitops")

app = FastAPI(title="TransitOps API Engine", version="1.0.0")

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_conn():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )

# Helper to format decimals and dates to standard JSON types
def json_serial(obj):
    if isinstance(obj, (datetime.datetime, datetime.date)):
        return obj.isoformat()
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError(f"Type {type(obj)} not serializable")

# Startup Table Initializations
@app.on_event("startup")
def startup_db_check():
    print("Checking for settings and RBAC tables in PostgreSQL...")
    try:
        conn = get_db_conn()
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Create system_settings table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_settings (
                key VARCHAR(50) PRIMARY KEY,
                value JSONB NOT NULL
            );
        """)
        
        # Seed default settings
        cursor.execute("SELECT 1 FROM system_settings WHERE key = 'depot_settings'")
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO system_settings (key, value) VALUES (
                    'depot_settings',
                    '{"depotName": "Central Depot Mumbai", "currency": "₹", "distanceUnit": "km"}'::jsonb
                )
            """)
            
        # Seed default RBAC
        cursor.execute("SELECT 1 FROM system_settings WHERE key = 'rbac_matrix'")
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO system_settings (key, value) VALUES (
                    'rbac_matrix',
                    '{
                      "Operations Lead": {"fleet": "full", "drivers": "full", "trips": "full", "fuelExpenses": "full", "analytics": "full", "maintenance": "full"},
                      "Fleet Manager": {"fleet": "full", "drivers": "full", "trips": "none", "fuelExpenses": "none", "analytics": "view", "maintenance": "full"},
                      "Dispatcher": {"fleet": "view", "drivers": "none", "trips": "full", "fuelExpenses": "none", "analytics": "none", "maintenance": "none"},
                      "Safety Officer": {"fleet": "none", "drivers": "full", "trips": "view", "fuelExpenses": "none", "analytics": "none", "maintenance": "none"},
                      "Financial Analyst": {"fleet": "view", "drivers": "none", "trips": "none", "fuelExpenses": "full", "analytics": "full", "maintenance": "none"}
                    }'::jsonb
                )
            """)
            
        cursor.close()
        conn.close()
        print("System settings tables verified successfully.")
    except Exception as e:
        print(f"Startup database check failed: {e}")

# Pydantic Schemas
class VehicleCreate(BaseModel):
    id: str
    regNumber: str
    model: str
    type: str
    capacityKg: int
    odometerKm: int
    status: str = "Available"
    region: str
    fuelType: str
    lastService: str
    acqCost: float

class DriverCreate(BaseModel):
    id: str
    name: str
    licenseNumber: str
    licenseCategory: str
    licenseExpiry: str
    safetyScore: int
    status: str = "Available"
    region: str
    contactNumber: str

class TripCreate(BaseModel):
    id: str
    origin: str
    destination: str
    cargoWeightKg: int
    vehicleId: str
    driverId: str
    status: str = "Dispatched"
    departureDate: str
    eta: Optional[str] = None
    region: str

class MaintenanceCreate(BaseModel):
    id: str
    vehicleId: str
    type: str
    cost: float
    openedAt: str
    notes: Optional[str] = None

class FuelLogCreate(BaseModel):
    id: str
    date: str
    vehicleId: str
    liters: float
    amount: float
    odometer: int

class ExpenseCreate(BaseModel):
    id: str
    date: str
    category: str
    amount: float
    vehicleId: str
    tripId: Optional[str] = None

# --- REST ENDPOINTS ---

# 1. Vehicles
@app.get("/api/vehicles")
def get_vehicles():
    try:
        conn = get_db_conn()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id, reg_number, model, type, capacity_kg, odometer_km, status, region, fuel_type, last_service, acq_cost FROM vehicles ORDER BY id DESC")
        rows = cursor.fetchall()
        
        # Map snake_case to camelCase
        vehicles = []
        for r in rows:
            vehicles.append({
                "id": r["id"],
                "regNumber": r["reg_number"],
                "model": r["model"],
                "type": r["type"],
                "capacityKg": r["capacity_kg"],
                "odometerKm": r["odometer_km"],
                "status": r["status"],
                "region": r["region"],
                "fuelType": r["fuel_type"],
                "lastService": json_serial(r["last_service"]),
                "acqCost": json_serial(r["acq_cost"])
            })
            
        cursor.close()
        conn.close()
        return vehicles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vehicles")
def add_vehicle(payload: VehicleCreate):
    try:
        conn = get_db_conn()
        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO vehicles (id, reg_number, model, type, capacity_kg, odometer_km, status, region, fuel_type, last_service, acq_cost)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (payload.id, payload.regNumber, payload.model, payload.type, payload.capacityKg, payload.odometerKm, payload.status, payload.region, payload.fuelType, payload.lastService, payload.acqCost)
        )
        cursor.close()
        conn.close()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 2. Drivers
@app.get("/api/drivers")
def get_drivers():
    try:
        conn = get_db_conn()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id, name, license_number, license_category, license_expiry, safety_score, status, region, contact_number FROM drivers ORDER BY id DESC")
        rows = cursor.fetchall()
        
        drivers = []
        for r in rows:
            drivers.append({
                "id": r["id"],
                "name": r["name"],
                "licenseNumber": r["license_number"],
                "licenseCategory": r["license_category"],
                "licenseExpiry": json_serial(r["license_expiry"]),
                "safetyScore": r["safety_score"],
                "status": r["status"],
                "region": r["region"],
                "contactNumber": r["contact_number"]
            })
            
        cursor.close()
        conn.close()
        return drivers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/drivers")
def add_driver(payload: DriverCreate):
    try:
        conn = get_db_conn()
        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO drivers (id, name, license_number, license_category, license_expiry, safety_score, status, region, contact_number)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (payload.id, payload.name, payload.licenseNumber, payload.licenseCategory, payload.licenseExpiry, payload.safetyScore, payload.status, payload.region, payload.contactNumber)
        )
        cursor.close()
        conn.close()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 3. Trips
@app.get("/api/trips")
def get_trips():
    try:
        conn = get_db_conn()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id, origin, destination, cargo_weight_kg, vehicle_id, driver_id, status, departure_date, eta, region, final_odometer, fuel_consumed FROM trips ORDER BY departure_date DESC")
        rows = cursor.fetchall()
        
        trips = []
        for r in rows:
            trips.append({
                "id": r["id"],
                "origin": r["origin"],
                "destination": r["destination"],
                "cargoWeightKg": r["cargo_weight_kg"],
                "vehicleId": r["vehicle_id"],
                "driverId": r["driver_id"],
                "status": r["status"],
                "departureDate": json_serial(r["departure_date"]),
                "eta": json_serial(r["eta"]) if r["eta"] else None,
                "region": r["region"],
                "finalOdometer": r["final_odometer"],
                "fuelConsumed": json_serial(r["fuel_consumed"]) if r["fuel_consumed"] else None
            })
            
        cursor.close()
        conn.close()
        return trips
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/trips")
def dispatch_trip(payload: TripCreate):
    try:
        conn = get_db_conn()
        conn.autocommit = True
        cursor = conn.cursor()
        
        # 1. Insert Trip
        cursor.execute(
            """INSERT INTO trips (id, origin, destination, cargo_weight_kg, vehicle_id, driver_id, status, departure_date, eta, region)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (payload.id, payload.origin, payload.destination, payload.cargoWeightKg, payload.vehicleId, payload.driverId, payload.status, payload.departureDate, payload.eta, payload.region)
        )
        
        # 2. Update Vehicle and Driver Status to 'On Trip'
        cursor.execute("UPDATE vehicles SET status = 'On Trip' WHERE id = %s", (payload.vehicleId,))
        cursor.execute("UPDATE drivers SET status = 'On Trip' WHERE id = %s", (payload.driverId,))
        
        cursor.close()
        conn.close()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/trips/{id}/status")
def update_trip_status(id: str, status: str = Body(..., embed=True)):
    try:
        conn = get_db_conn()
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Fetch vehicle & driver associated with trip
        cursor.execute("SELECT vehicle_id, driver_id FROM trips WHERE id = %s", (id,))
        trip = cursor.fetchone()
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
            
        vehicle_id, driver_id = trip
        
        # Update trip status
        cursor.execute("UPDATE trips SET status = %s WHERE id = %s", (status, id))
        
        # Release vehicle & driver if trip is Completed or Cancelled
        if status in ["Completed", "Cancelled"]:
            cursor.execute("UPDATE vehicles SET status = 'Available' WHERE id = %s AND status = 'On Trip'", (vehicle_id,))
            cursor.execute("UPDATE drivers SET status = 'Available' WHERE id = %s AND status = 'On Trip'", (driver_id,))
            
        cursor.close()
        conn.close()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 4. Maintenance Logs
@app.get("/api/maintenance")
def get_maintenance():
    try:
        conn = get_db_conn()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id, vehicle_id, type, cost, opened_at, closed_at, status, notes FROM maintenance_logs ORDER BY opened_at DESC")
        rows = cursor.fetchall()
        
        maintenance = []
        for r in rows:
            maintenance.append({
                "id": r["id"],
                "vehicleId": r["vehicle_id"],
                "type": r["type"],
                "cost": json_serial(r["cost"]),
                "openedAt": json_serial(r["opened_at"]),
                "closedAt": json_serial(r["closed_at"]) if r["closed_at"] else None,
                "status": r["status"],
                "notes": r["notes"]
            })
            
        cursor.close()
        conn.close()
        return maintenance
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/maintenance")
def log_maintenance(payload: MaintenanceCreate):
    try:
        conn = get_db_conn()
        conn.autocommit = True
        cursor = conn.cursor()
        
        # 1. Insert Maintenance Log
        cursor.execute(
            """INSERT INTO maintenance_logs (id, vehicle_id, type, cost, opened_at, status, notes)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (payload.id, payload.vehicleId, payload.type, payload.cost, payload.openedAt, "Open", payload.notes)
        )
        
        # 2. Update Vehicle Status to 'In Shop'
        cursor.execute("UPDATE vehicles SET status = 'In Shop' WHERE id = %s", (payload.vehicleId,))
        
        # 3. Create General Expense
        ex_id = "EX-" + payload.id[3:]
        cursor.execute(
            """INSERT INTO expenses (id, date, category, amount, vehicle_id)
               VALUES (%s, %s, %s, %s, %s)""",
            (ex_id, payload.openedAt[:10], "Maintenance", payload.cost, payload.vehicleId)
        )
        
        cursor.close()
        conn.close()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/maintenance/{id}/resolve")
def resolve_maintenance(id: str):
    try:
        conn = get_db_conn()
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Fetch log to get vehicle_id
        cursor.execute("SELECT vehicle_id FROM maintenance_logs WHERE id = %s", (id,))
        log = cursor.fetchone()
        if not log:
            raise HTTPException(status_code=404, detail="Maintenance log not found")
            
        vehicle_id = log[0]
        
        # Update Maintenance log
        cursor.execute("UPDATE maintenance_logs SET status = 'Closed', closed_at = NOW() WHERE id = %s", (id,))
        
        # Release Vehicle
        cursor.execute("UPDATE vehicles SET status = 'Available' WHERE id = %s AND status = 'In Shop'", (vehicle_id,))
        
        cursor.close()
        conn.close()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 5. Fuel Logs
@app.get("/api/fuel-logs")
def get_fuel_logs():
    try:
        conn = get_db_conn()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id, date, vehicle_id, liters, amount, odometer_reading FROM fuel_logs ORDER BY date DESC")
        rows = cursor.fetchall()
        
        fuel = []
        for r in rows:
            fuel.append({
                "id": r["id"],
                "date": json_serial(r["date"]),
                "vehicleId": r["vehicle_id"],
                "liters": json_serial(r["liters"]),
                "amount": json_serial(r["amount"]),
                "odometer": r["odometer_reading"]
            })
            
        cursor.close()
        conn.close()
        return fuel
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/fuel-logs")
def add_fuel_log(payload: FuelLogCreate):
    try:
        conn = get_db_conn()
        conn.autocommit = True
        cursor = conn.cursor()
        
        # 1. Insert Fuel Log
        cursor.execute(
            """INSERT INTO fuel_logs (id, date, vehicle_id, liters, amount, odometer_reading)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (payload.id, payload.date, payload.vehicleId, payload.liters, payload.amount, payload.odometer)
        )
        
        # 2. Update Vehicle Odometer if provided and higher
        if payload.odometer > 0:
            cursor.execute(
                "UPDATE vehicles SET odometer_km = %s WHERE id = %s AND %s > odometer_km",
                (payload.odometer, payload.vehicleId, payload.odometer)
            )
            
        cursor.close()
        conn.close()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 6. Expenses
@app.get("/api/expenses")
def get_expenses():
    try:
        conn = get_db_conn()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id, date, category, amount, vehicle_id, trip_id FROM expenses ORDER BY date DESC")
        rows = cursor.fetchall()
        
        expenses = []
        for r in rows:
            expenses.append({
                "id": r["id"],
                "date": json_serial(r["date"]),
                "category": r["category"],
                "amount": json_serial(r["amount"]),
                "vehicleId": r["vehicle_id"],
                "tripId": r["trip_id"]
            })
            
        cursor.close()
        conn.close()
        return expenses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/expenses")
def add_expense(payload: ExpenseCreate):
    try:
        conn = get_db_conn()
        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO expenses (id, date, category, amount, vehicle_id, trip_id)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (payload.id, payload.date, payload.category, payload.amount, payload.vehicleId, payload.tripId)
        )
        cursor.close()
        conn.close()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 7. System Settings & RBAC Matrix
@app.get("/api/settings")
def get_settings():
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM system_settings WHERE key = 'depot_settings'")
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        if row:
            return row[0]
        return {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/settings")
def update_settings(payload: Dict[str, Any]):
    try:
        conn = get_db_conn()
        conn.autocommit = True
        cursor = conn.cursor()
        
        cursor.execute("SELECT value FROM system_settings WHERE key = 'depot_settings'")
        row = cursor.fetchone()
        if row:
            current = row[0]
            current.update(payload)
            import json
            cursor.execute("UPDATE system_settings SET value = %s WHERE key = 'depot_settings'", (json.dumps(current),))
        else:
            import json
            cursor.execute("INSERT INTO system_settings (key, value) VALUES ('depot_settings', %s)", (json.dumps(payload),))
            
        cursor.close()
        conn.close()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/rbac")
def get_rbac_matrix():
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM system_settings WHERE key = 'rbac_matrix'")
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        if row:
            return row[0]
        return {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rbac")
def update_rbac_matrix(payload: Dict[str, Any]):
    try:
        conn = get_db_conn()
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Full payload replacement for RBAC config
        import json
        cursor.execute("UPDATE system_settings SET value = %s WHERE key = 'rbac_matrix'", (json.dumps(payload),))
        
        cursor.close()
        conn.close()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
