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

def create_database():
    print("Connecting to PostgreSQL to check/create database...")
    try:
        # Connect to default postgres DB first to create database
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
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

def run_sql_file(cursor, file_path):
    print(f"Executing {file_path}...")
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"SQL file not found at: {file_path}")
        
    with open(file_path, "r", encoding="utf-8") as f:
        sql = f.read()
        
    try:
        cursor.execute(sql)
        print(f"Successfully executed {file_path}")
    except Exception as e:
        print(f"Error executing {file_path}: {e}")
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
        
        db_dir = os.path.dirname(os.path.abspath(__file__))
        schema_path = os.path.join(db_dir, "schema.sql")
        seed_path = os.path.join(db_dir, "seed.sql")
        
        # 1. Run schema DDL
        run_sql_file(cursor, schema_path)
        
        # 2. Run seed SQL
        run_sql_file(cursor, seed_path)
        
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
