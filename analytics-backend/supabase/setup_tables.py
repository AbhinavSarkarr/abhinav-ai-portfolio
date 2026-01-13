"""
Setup Supabase Tables
Run this once to create all tables in Supabase.
"""

import os
from pathlib import Path
import psycopg2
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / "functions" / ".env"
load_dotenv(env_path)

# Supabase config
SUPABASE_CONFIG = {
    "host": os.getenv("SUPABASE_HOST", "aws-1-ap-northeast-1.pooler.supabase.com"),
    "port": os.getenv("SUPABASE_PORT", "6543"),
    "database": os.getenv("SUPABASE_DATABASE", "postgres"),
    "user": os.getenv("SUPABASE_USER", "postgres.keutkhwgljfjqyiwxfbb"),
    "password": os.getenv("SUPABASE_PASSWORD"),
}


def main():
    print("Setting up Supabase tables...")
    print(f"Host: {SUPABASE_CONFIG['host']}")

    # Read schema file
    schema_path = Path(__file__).parent / "schema.sql"
    with open(schema_path, 'r') as f:
        schema_sql = f.read()

    # Connect to Supabase
    print("Connecting to Supabase...")
    conn = psycopg2.connect(
        host=SUPABASE_CONFIG["host"],
        port=SUPABASE_CONFIG["port"],
        database=SUPABASE_CONFIG["database"],
        user=SUPABASE_CONFIG["user"],
        password=SUPABASE_CONFIG["password"],
        sslmode="require"
    )

    # Execute schema
    print("Creating tables...")
    with conn.cursor() as cursor:
        cursor.execute(schema_sql)
        conn.commit()

    print("Tables created successfully!")

    # List tables
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """)
        tables = cursor.fetchall()

    print(f"\nCreated {len(tables)} tables:")
    for table in tables:
        print(f"  - {table[0]}")

    conn.close()
    print("\nDone!")


if __name__ == "__main__":
    main()
