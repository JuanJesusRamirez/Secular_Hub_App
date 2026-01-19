import pandas as pd

try:
    mariopath = 'Encuesta Mario.xlsx'
    df_mario = pd.read_excel(mariopath)
    
    print("Unique values in 'Numero' column:")
    print(df_mario['Numero'].unique())
    
    # Check data type
    print("\nData type of 'Numero':", df_mario['Numero'].dtype)

except Exception as e:
    print(e)
