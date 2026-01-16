
import pandas as pd
import json
import os

input_file = '2026.xlsx'
output_file = 'lib/data/outlook_2026_full.json'

try:
    xl = pd.ExcelFile(input_file)
    data = {}
    
    for sheet in xl.sheet_names:
        df = xl.parse(sheet)
        # Handle nan/inf
        df = df.astype(object).where(pd.notnull(df), None)
        
        # Convert timestamps
        def json_serial(obj):
            if isinstance(obj, (pd.Timestamp, pd.Timedelta)):
                return str(obj)
            return obj
            
        records = df.to_dict(orient='records')
        clean_records = []
        for r in records:
            clean_r = {}
            for k, v in r.items():
                if v is None:
                    continue
                clean_r[str(k)] = json_serial(v)
            clean_records.append(clean_r)
            
        data[sheet] = clean_records

    # We expect a single main sheet usually, but we'll save the whole structure
    # If there is a sheet named '2026' or 'Sheet1', it will be a key.
    
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
        
    print(f"Successfully converted {input_file} to {output_file}")
    
except Exception as e:
    print(f"Error converting file: {e}")
