import pandas as pd
import os

files = ['XAU.csv', 'Rate FED.csv', 'SP500.csv']

import json

comments_data = {}

for f in files:
    try:
        path = os.path.join(os.getcwd(), f)
        if not os.path.exists(path):
            continue
            
        with open(path, 'r', encoding='latin1') as file:
            lines = [l.strip() for l in file.readlines() if l.strip()]
        
        headers = lines[0].split(';')
        
        comment_line = None
        comment_index = -1
        
        if f == 'XAU.csv':
             if len(lines) >= 623:
                comment_line = lines[622]
                comment_index = 622
        elif f == 'SP500.csv':
            for i, l in enumerate(lines):
                if l.startswith('2/01/2027'):
                    comment_line = l
                    comment_index = i
                    break
        elif f == 'Rate FED.csv':
             # Need to confirm which line for FED. Assuming last non-empty?
             # Let's assume it's like XAU, at the end. Or maybe checking for a specific date?
             # Actually, checking `components/charts/fed-rate-chart.tsx` and `api` logic would be good.
             # But let's assume last line for now as per output showing comments.
             comment_line = lines[-1]
             comment_index = len(lines) - 1
        
        if comment_line:
            vals = comment_line.split(';')
            file_comments = {}
            for i, v in enumerate(vals):
                if i > 0 and v and len(v) > 5:
                    key = headers[i] if i < len(headers) else f"col_{i}"
                    file_comments[key] = v
            
            comments_data[f] = {
                'index': comment_index,
                'comments': file_comments
            }

    except Exception as e:
        print(f"Error {f}: {e}")

with open('comments_dump.json', 'w', encoding='utf-8') as f:
    json.dump(comments_data, f, indent=2, ensure_ascii=False)
