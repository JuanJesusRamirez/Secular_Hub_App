import csv
from datetime import datetime, timedelta

# Read the original CSV
input_file = r'c:\Users\David Ricardo\Desktop\FLAR\Secular forum\Secular_Hub_App\SP500.csv'
output_file = r'c:\Users\David Ricardo\Desktop\FLAR\Secular forum\Secular_Hub_App\SP500_updated.csv'

# Read all lines
with open(input_file, 'r', encoding='latin-1') as f:
    lines = f.readlines()

# Separate header, 2025 data, 2026 data, and last lines
header = lines[0]
data_lines = []
last_lines = []

in_data = True
for line in lines[1:]:
    if line.strip() and ';' in line and '/' in line.split(';')[0]:
        data_lines.append(line)
    else:
        in_data = False
        last_lines.append(line)

# Filter: keep all 2025 data and only quarterly 2026 data
filtered_data = []
for line in data_lines:
    date_str = line.split(';')[0]
    if '/2025' in date_str:
        filtered_data.append(line)
    elif '/2026' in date_str:
        # Only keep 31/03/2026, 30/06/2026, 30/09/2026, 31/12/2026
        if date_str in ['31/03/2026', '30/06/2026', '30/09/2026', '31/12/2026']:
            filtered_data.append(line)

# Write the updated CSV
with open(output_file, 'w', encoding='latin-1', newline='') as f:
    f.write(header)
    for line in filtered_data:
        f.write(line)
    for line in last_lines:
        f.write(line)

print(f"CSV updated successfully!")
print(f"Original lines: {len(data_lines)}")
print(f"Filtered lines: {len(filtered_data)}")
