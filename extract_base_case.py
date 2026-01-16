import pandas as pd

file_path = r'c:\Users\David Ricardo\Desktop\FLAR\Secular forum\Secular_Hub_App\manus proube\2026 agg.xlsx'
df = pd.read_excel(file_path)
print(df.columns)
base_case = df[df['Themes + Assets'] == 'BASE CASE']
if not base_case.empty:
    print("\n--- BASE CASE THESIS ---")
    print(base_case['Consensus Thesis'].values[0])
else:
    print("BASE CASE not found")
