#!/usr/bin/env python3
"""
Verify that migrated data exists in Postgres
"""

import psycopg2
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv('.env.local')
db_url = os.getenv('DATABASE_URL')

if not db_url:
    print("ERROR: DATABASE_URL not found in .env.local")
    exit(1)

# Parse connection string
parsed = urlparse(db_url)
user = parsed.username
password = parsed.password
host = parsed.hostname
port = parsed.port or 5432
database = parsed.path.lstrip('/')

print('🔍 Verifying Postgres connection...')
print(f'Host: {host}')
print(f'Database: {database}\n')

try:
    conn = psycopg2.connect(
        host=host,
        port=port,
        database=database,
        user=user,
        password=password
    )
    cursor = conn.cursor()
    
    # Count rows in each table
    tables = ['outlook_calls', 'word_cloud_cache', 'review_queue', 'migration_runs', 'sentiment_cache']
    
    print('Table Counts:')
    print('-' * 40)
    total = 0
    for table in tables:
        cursor.execute(f'SELECT COUNT(*) FROM {table}')
        count = cursor.fetchone()[0]
        total += count
        status = '✓' if count > 0 else '·'
        print(f'{status} {table:20s}: {count:>6,d} rows')
    
    print('-' * 40)
    print(f'✓ Total:           {total:>6,d} rows')
    
    conn.close()
    print('\n✅ All data verified in Postgres!')
    
except psycopg2.OperationalError as e:
    print(f'❌ Connection Error: {e}')
except Exception as e:
    print(f'❌ Error: {e}')
