#!/usr/bin/env python3
"""
Export base case data from PostgreSQL to static JSON file.
This is a one-time migration script to make base case data editable without database access.
"""

import psycopg2
import json
import os
import sys
from dotenv import load_dotenv

# Load .env.local
load_dotenv('.env.local')

# Database URL
PG_URL = os.getenv('DATABASE_URL')

if not PG_URL:
    print("ERROR: DATABASE_URL not found in environment or .env.local")
    sys.exit(1)

# Remove Prisma-specific query params
if '?' in PG_URL:
    PG_URL = PG_URL.split('?')[0]

# Output file path
OUTPUT_FILE = 'lib/data/base-cases-by-year.json'

def export_base_cases():
    """Export base case data from PostgreSQL to JSON file."""
    print(f"Connecting to PostgreSQL...")
    
    try:
        # Connect to Postgres
        conn = psycopg2.connect(PG_URL)
        cursor = conn.cursor()
        
        # Query base cases (same logic as getBaseCasesByYear)
        query = '''
            SELECT DISTINCT ON (year) 
                year, 
                sub_theme, 
                section_description
            FROM outlook_calls
            WHERE theme = 'BASE CASE'
            ORDER BY year DESC
        '''
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        print(f"Found {len(rows)} base case records")
        
        # Transform to JSON structure
        base_cases = []
        for row in rows:
            year, sub_theme, section_desc = row
            base_cases.append({
                "year": year,
                "baseCase": sub_theme or "Market Outlook",
                "description": section_desc or ""
            })
        
        # Sort by year descending (most recent first)
        base_cases.sort(key=lambda x: x['year'], reverse=True)
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        
        # Write to JSON file
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(base_cases, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Successfully exported {len(base_cases)} base cases to {OUTPUT_FILE}")
        print("\nYears exported:")
        for bc in base_cases:
            print(f"  - {bc['year']}: {bc['baseCase']}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    export_base_cases()
