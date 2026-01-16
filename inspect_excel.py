
import pandas as pd
import json

try:
    file_path = '2026.xlsx'
    xl = pd.ExcelFile(file_path)
    
    structure = {}
    for sheet in xl.sheet_names:
        df = xl.parse(sheet)
        # Convert timestamps to strings for JSON serialization
        df = df.astype(object).where(pd.notnull(df), None)
        # Helper to handle non-serializable data
        def json_serial(obj):
            if isinstance(obj, (pd.Timestamp, pd.Timedelta)):
                return str(obj)
            return obj

        records = df.head(5).to_dict(orient='records')
        # Clean records
        clean_records = []
        for r in records:
            clean_r = {}
            for k, v in r.items():
                clean_r[str(k)] = json_serial(v)
            clean_records.append(clean_r)
            
        structure[sheet] = {
            "columns": list(df.columns),
            "sample_data": clean_records
        }
    
    print(json.dumps(structure, indent=2))
except Exception as e:
    print(f"Error: {e}")
