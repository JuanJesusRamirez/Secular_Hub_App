import pandas as pd
import os

file_path = '2026.xlsx'

if not os.path.exists(file_path):
    print(f"File {file_path} not found.")
    element_files = os.listdir('.')
    print("Files in current dir:", element_files)
    exit(1)

try:
    xl = pd.ExcelFile(file_path)
    print("Sheet names:", xl.sheet_names)

    for sheet in xl.sheet_names:
        print(f"\n--- Sheet: {sheet} ---")
        df = xl.parse(sheet)
        print(df.head().to_string())
        print("\nColumns:", df.columns.tolist())
except Exception as e:
    print(f"Error reading excel: {e}")
