import json
import os

def fix_mangled_encoding(text):
    if not isinstance(text, str):
        return text
    
    # Mapping of mangled sequences (UTF-8 bytes interpreted as Windows-1252)
    replacements = {
        '\u00e2\u0080\u009c': '“',
        '\u00e2\u0080\u009d': '”',
        '\u00e2\u0080\u0099': "'",
        '\u00e2\u0080\u0093': '–',
        '\u00e2\u0080\u0094': '—',
        '\u00e2\u0080\u00a6': '...',
        '\u00c2\u00a0': ' ',
        '\u00c2': '',
    }
    
    for mangled, fixed in replacements.items():
        text = text.replace(mangled, fixed)
    
    return text

def process_json_file(file_path):
    print(f"Processing {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    def walk(obj):
        if isinstance(obj, dict):
            return {walk(k): walk(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [walk(i) for i in obj]
        elif isinstance(obj, str):
            return fix_mangled_encoding(obj)
        else:
            return obj

    fixed_data = walk(data)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(fixed_data, f, indent=2, ensure_ascii=False)
    print(f"Done fixing {file_path}")

# Target directory
target_dir = r'c:\Users\juanj\OneDrive\Desktop\AI_Sandbox\Secular_Hub_App\lib\data\expost\2025'

if os.path.exists(target_dir):
    for filename in os.listdir(target_dir):
        if filename.endswith('.json'):
            file_path = os.path.join(target_dir, filename)
            process_json_file(file_path)
else:
    print(f"Directory not found: {target_dir}")
