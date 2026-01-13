import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch
import os
import sys
from dotenv import load_dotenv

# Load .env.local
load_dotenv('.env.local')

PG_URL = os.getenv('DATABASE_URL')
if not PG_URL:
    print("ERROR: DATABASE_URL not found in environment or .env.local")
    sys.exit(1)

# Remove Prisma query params
if '?' in PG_URL:
    PG_URL = PG_URL.split('?')[0]

def upload_csv_to_pg(file_path, table_name, year):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print(f"\nProcessing {file_path} for year {year}...")
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        print(f"  Error reading CSV: {e}")
        return
    
    # We need to add 'year'
    df['year'] = year
    
    # If the CSV has 'word', rename it to 'term'
    if 'word' in df.columns:
        df = df.rename(columns={'word': 'term'})
    
    # Map CSV columns to Database columns
    # Prisma @map("tfidf_score") etc matches the CSV column names usually
    columns = [
        'term', 'year', 'tfidf_score', 'semantic_position', 
        'frequency', 'relative_frequency', 'sentiment_label', 'sentiment_score'
    ]
    
    # Ensure all required columns exist
    missing = [c for c in columns if c not in df.columns]
    if missing:
        print(f"  Error: Missing columns in CSV: {missing}")
        return

    # Prepare data for insertion
    data_to_insert = []
    for _, row in df.iterrows():
        data_to_insert.append((
            str(row['term']),
            int(row['year']),
            float(row['tfidf_score']),
            float(row['semantic_position']),
            int(row['frequency']),
            float(row['relative_frequency']),
            str(row['sentiment_label']),
            float(row['sentiment_score'])
        ))

    # Connect to Postgres
    try:
        pg_conn = psycopg2.connect(PG_URL)
        pg_cursor = pg_conn.cursor()
        
        col_list = ', '.join([f'"{c}"' for c in columns])
        placeholders = ', '.join(['%s'] * len(columns))
        
        # UPSERT logic: update if exists
        insert_sql = f"""
            INSERT INTO "{table_name}" ({col_list}) 
            VALUES ({placeholders}) 
            ON CONFLICT (term, year) 
            DO UPDATE SET 
                tfidf_score = EXCLUDED.tfidf_score, 
                semantic_position = EXCLUDED.semantic_position, 
                frequency = EXCLUDED.frequency, 
                relative_frequency = EXCLUDED.relative_frequency, 
                sentiment_label = EXCLUDED.sentiment_label, 
                sentiment_score = EXCLUDED.sentiment_score
        """
        
        execute_batch(pg_cursor, insert_sql, data_to_insert, page_size=100)
        pg_conn.commit()
        print(f"  ✅ Successfully uploaded {len(data_to_insert)} rows to {table_name}")
    except Exception as e:
        if 'pg_conn' in locals(): pg_conn.rollback()
        print(f"  ❌ Error during upload: {e}")
    finally:
        if 'pg_conn' in locals(): pg_conn.close()

def main():
    print("🚀 Starting Word/Phrase Data Migration to PostgreSQL")
    
    tasks = [
        ("word_rain_data_2022.csv", "word_analysis", 2022),
        ("word_rain_data_2025.csv", "word_analysis", 2025),
        ("word_rain_phrases_data_2022.csv", "phrase_analysis", 2022),
        ("word_rain_phrases_data_2025.csv", "phrase_analysis", 2025),
        # Aggregated data (2019-2026) mapped to year 0 (Special value for 'All Years')
        ("word_rain_data_2019_2026.csv", "word_analysis", 0),
        ("word_rain_phrases_data_2019_2026.csv", "phrase_analysis", 0),
    ]
    
    for file, table, year in tasks:
        upload_csv_to_pg(file, table, year)
    
    print("\n✨ Migration finished!")

if __name__ == "__main__":
    main()
