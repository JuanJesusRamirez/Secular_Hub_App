import pandas as pd
import json

file_path = r'c:\Users\David Ricardo\Desktop\FLAR\Secular forum\Secular_Hub_App\manus proube\2026 agg.xlsx'
xl = pd.ExcelFile(file_path)
print(f"Sheets: {xl.sheet_names}")

for sheet in xl.sheet_names:
    df = xl.parse(sheet)
    print(f"\n--- Sheet: {sheet} ---")
    print(df.head())
