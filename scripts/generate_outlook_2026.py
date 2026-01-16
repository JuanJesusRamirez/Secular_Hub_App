import pandas as pd
import json

file_path = '2026.xlsx'
output_path = 'lib/data/outlook-2026.ts'

try:
    xl = pd.ExcelFile(file_path)
    # Assume first sheet
    df = xl.parse(xl.sheet_names[0])
    
    # Standardize column names
    # Expected: 'Themes + Assets', 'Rank', 'Consensus Thesis'
    # Clean whitespace in column names
    df.columns = df.columns.str.strip()
    
    print("Columns found:", df.columns.tolist())
    
    required_cols = {
        'Themes + Assets': 'theme_asset',
        'Rank': 'rank',
        'Consensus Thesis': 'thesis'
    }
    
    # Check if columns exist
    for col in required_cols:
        if col not in df.columns:
            # Try fuzzy match or hardcoded variations if needed
            print(f"Warning: Column '{col}' not found.")
            # Map common variations if anticipated?
            # For now, let's fail or skip if critical ones missing
            
    # Rename
    df = df.rename(columns=required_cols)
    
    # Select only needed columns plus maybe Year if it exists
    cols_to_keep = ['theme_asset', 'rank', 'thesis']
    df = df[cols_to_keep]
    
    # Clean data
    # Remove rows where theme_asset is nan
    df = df.dropna(subset=['theme_asset'])
    
    # Convert rank to number (handle non-numeric if any)
    df['rank'] = pd.to_numeric(df['rank'], errors='coerce').fillna(0)
    
    # Convert to list of dicts
    data = df.to_dict(orient='records')
    
    # Generate TS file content
    ts_content = "export const OUTLOOK_DATA_2026 = " + json.dumps(data, indent=4) + ";\n"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)
        
    print(f"Successfully generated {output_path} with {len(data)} items.")
    
except Exception as e:
    print(f"Error generating outlook data: {e}")
