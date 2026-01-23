import pandas as pd
try:
    df = pd.read_excel('Encuesta Mario.xlsx')
    print("Columns:", df.columns.tolist())
    print("First few rows:")
    print(df.head())
except Exception as e:
    print(e)
