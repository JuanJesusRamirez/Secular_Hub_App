import pandas as pd

try:
    mariopath = 'Encuesta Mario.xlsx'
    df_mario = pd.read_excel(mariopath)
    
    # Filter for Question 13
    q13 = df_mario[df_mario['Numero'] == 13]
    
    print(f"Total rows for Question 13: {len(q13)}")
    print("\nFirst 10 rows for Question 13:")
    print(q13[['Firma', 'Respuesta', 'Numero']].head(10))
    
    print("\nValue counts for 'Firma' in Question 13:")
    print(q13['Firma'].value_counts().head())

    # Check excluding the firms we excluded before
    excluded_firms = [
        "CIBC", 
        "EY (Ernst & Young)", 
        "Moody's", 
        "MUFG (Mitsubishi UFJ Financial Group)", 
        "Natixis"
    ]
    
    q13_filtered = q13[~q13['Firma'].isin(excluded_firms)]
    print(f"\nTotal rows for Question 13 after filtering: {len(q13_filtered)}")
    print("Unique firms in filtered Q13:", q13_filtered['Firma'].nunique())

except Exception as e:
    print(e)
