import pandas as pd
import os

file_path = 'dxy graph.xlsx'
if os.path.exists(file_path):
    try:
        df = pd.read_excel(file_path)
        print("Columns:", df.columns.tolist())
        print("First 5 rows:")
        print(df.head())
        print("Tail:")
        print(df.tail())
        
        # Save as CSV to see if we can just use that
        csv_path = 'DXY.csv'
        # The other CSVs are semicolon separated and Latin1. Let's try to replicate that format if possible, 
        # but first let's just see the data.
        df.to_csv(csv_path, sep=';', index=False)
        print(f"Saved to {csv_path}")
        
    except Exception as e:
        print(f"Error reading excel: {e}")
else:
    print(f"{file_path} not found")
