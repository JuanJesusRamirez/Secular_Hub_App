import pandas as pd
import os

csv_path = 'DXY.csv'

if os.path.exists(csv_path):
    try:
        # Read with semicolon delimiter
        df = pd.read_csv(csv_path, sep=';', dtype=str)
        
        # Convert Dates to datetime for filtering
        df['Dates_dt'] = pd.to_datetime(df['Dates'])
        
        # Filter <= 2027-12-31
        cutoff = pd.Timestamp('2027-12-31')
        df_filtered = df[df['Dates_dt'] <= cutoff]
        
        # Drop helper column
        df_filtered = df_filtered.drop(columns=['Dates_dt'])
        
        print(f"Original rows: {len(df)}")
        print(f"Filtered rows: {len(df_filtered)}")
        
        # Write back
        df_filtered.to_csv(csv_path, sep=';', index=False)
        print("Successfully truncated DXY.csv to 2027-12-31")
        
    except Exception as e:
        print(f"Error: {e}")
else:
    print("DXY.csv not found")
