import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

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
