#!/usr/bin/env python3
"""
Migrate data from SQLite (prisma/dev.db) to PostgreSQL Azure.
Handles type conversions (Unix timestamps in ms -> ISO datetime, etc).
"""

import sqlite3
import psycopg2
from psycopg2.extras import execute_batch
from datetime import datetime
import os
import sys
from dotenv import load_dotenv

# Load .env.local
load_dotenv('.env.local')

# Database URLs
SQLITE_PATH = 'prisma/dev.db'
PG_URL = os.getenv('DATABASE_URL')

if not PG_URL:
    print("ERROR: DATABASE_URL not found in environment or .env.local")
    sys.exit(1)

# Remove Prisma-specific query params (psycopg2 doesn't understand schema=public, etc)
if '?' in PG_URL:
    PG_URL = PG_URL.split('?')[0]

if not os.path.exists(SQLITE_PATH):
    print(f"ERROR: SQLite file not found at {SQLITE_PATH}")
    sys.exit(1)

# Tables to migrate
TABLES = ['outlook_calls', 'review_queue', 'migration_runs', 'word_cloud_cache', 'sentiment_cache']

def convert_timestamp(val):
    """Convert Unix timestamp in milliseconds to ISO datetime string."""
    if val is None:
        return None
    try:
        # If it's a large number (likely ms), convert to seconds
        if isinstance(val, (int, float)) and val > 1e10:
            return datetime.fromtimestamp(val / 1000).isoformat()
        elif isinstance(val, (int, float)):
            return datetime.fromtimestamp(val).isoformat()
        elif isinstance(val, str) and val.isdigit():
            ts = int(val)
            if ts > 1e10:
                return datetime.fromtimestamp(ts / 1000).isoformat()
            else:
                return datetime.fromtimestamp(ts).isoformat()
        else:
            return val
    except (ValueError, OSError, OverflowError):
        return val

def convert_value(val, col_name, table_name):
    """Convert value type based on column name and table."""
    if val is None:
        return None
    
    # Boolean columns (SQLite stores 0/1, Postgres expects bool)
    bool_cols = {
        'sub_theme_generated', 'section_desc_generated', 'needs_review',
        'sub_theme_confidence', 'section_desc_confidence'
    }
    
    if col_name in bool_cols and isinstance(val, int):
        return bool(val)
    
    # Timestamp columns (Unix ms -> ISO datetime)
    datetime_cols = {'created_at', 'updated_at', 'reviewed_at', 'generated_at', 'started_at', 'completed_at'}
    if col_name in datetime_cols:
        return convert_timestamp(val)
    
    return val

def migrate_table(sqlite_conn, pg_conn, table_name):
    """Migrate single table from SQLite to Postgres."""
    print(f"\nMigrating table: {table_name}")
    
    # Read from SQLite
    sqlite_cursor = sqlite_conn.cursor()
    sqlite_cursor.execute(f"SELECT * FROM {table_name}")
    columns = [desc[0] for desc in sqlite_cursor.description]
    rows = sqlite_cursor.fetchall()
    
    print(f"  rows to migrate: {len(rows)}")
    
    if len(rows) == 0:
        print(f"  no rows, skipping")
        return
    
    # Convert rows (handle type conversions)
    converted_rows = []
    for row in rows:
        converted_row = []
        for i, val in enumerate(row):
            col = columns[i]
            # Apply type conversions
            converted_row.append(convert_value(val, col, table_name))
        converted_rows.append(tuple(converted_row))
    
    # Insert into Postgres
    pg_cursor = pg_conn.cursor()
    col_list = ', '.join([f'"{c}"' for c in columns])
    placeholders = ', '.join(['%s'] * len(columns))
    insert_sql = f"INSERT INTO \"{table_name}\" ({col_list}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"
    
    try:
        execute_batch(pg_cursor, insert_sql, converted_rows, page_size=500)
        pg_conn.commit()
        print(f"  migrated {len(converted_rows)} rows")
    except Exception as e:
        pg_conn.rollback()
        print(f"  error: {e}")
        raise

def main():
    print(f"Starting migration from SQLite to Postgres")
    print(f"SQLite: {SQLITE_PATH}")
    print(f"Postgres: (from DATABASE_URL)")
    
    try:
        # Connect to SQLite
        sqlite_conn = sqlite3.connect(SQLITE_PATH)
        
        # Connect to Postgres
        pg_conn = psycopg2.connect(PG_URL)
        
        # Migrate each table
        for table in TABLES:
            try:
                # Check if table exists in SQLite
                sqlite_cursor = sqlite_conn.cursor()
                sqlite_cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
                if not sqlite_cursor.fetchone():
                    print(f"\nSkipping {table} — not found in SQLite")
                    continue
                
                migrate_table(sqlite_conn, pg_conn, table)
            except Exception as e:
                print(f"  ERROR migrating {table}: {e}")
                continue
        
        sqlite_conn.close()
        pg_conn.close()
        print("\nMigration completed successfully!")
        
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
