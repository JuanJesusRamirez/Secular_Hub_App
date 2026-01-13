import csv
from datetime import datetime
from collections import defaultdict

# Read the CSV
input_file = r'c:\Users\David Ricardo\Desktop\FLAR\Secular forum\Secular_Hub_App\SP500.csv'
output_file = r'c:\Users\David Ricardo\Desktop\FLAR\Secular forum\Secular_Hub_App\SP500_monthly.csv'

# Read all lines
with open(input_file, 'r', encoding='latin-1') as f:
    lines = f.readlines()

# Separate header, data, and last lines
header = lines[0]
data_lines = []
last_lines = []

for line in lines[1:]:
    if line.strip() and ';' in line and '/' in line.split(';')[0]:
        data_lines.append(line)
    else:
        last_lines.append(line)

# Group by month and keep only the last date of each month
months_data = defaultdict(list)

for line in data_lines:
    date_str = line.split(';')[0]
    try:
        # Parse date (format: DD/MM/YYYY)
        date_parts = date_str.split('/')
        if len(date_parts) == 3:
            day, month, year = date_parts
            date_obj = datetime(int(year), int(month), int(day))
            month_key = f"{year}-{month.zfill(2)}"
            
            months_data[month_key].append((date_obj, line))
    except:
        pass

# Get the last date for each month
monthly_data = []
for month_key in sorted(months_data.keys()):
    # Sort by date and take the last one
    month_entries = sorted(months_data[month_key], key=lambda x: x[0])
    monthly_data.append(month_entries[-1][1])

# Write the monthly CSV
with open(output_file, 'w', encoding='latin-1', newline='') as f:
    f.write(header)
    for line in monthly_data:
        f.write(line)
    for line in last_lines:
        f.write(line)

print(f"Monthly CSV created successfully!")
print(f"Original data lines: {len(data_lines)}")
print(f"Monthly data lines: {len(monthly_data)}")
print(f"Number of unique months: {len(months_data)}")
