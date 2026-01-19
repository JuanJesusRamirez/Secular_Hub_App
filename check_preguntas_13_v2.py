import pandas as pd

try:
    preguntaspath = 'preguntas.xlsx'
    df_preguntas = pd.read_excel(preguntaspath)
    print("Columns:", df_preguntas.columns.tolist())
    print("\nRows matching 13:")
    # Try looking for a column that looks like Number or Numero
    col_name = None
    for col in df_preguntas.columns:
        if 'num' in str(col).lower() or 'id' in str(col).lower():
            col_name = col
            break
            
    if col_name:
        print(df_preguntas[df_preguntas[col_name] == 13])
        print(df_preguntas[df_preguntas[col_name].astype(str).str.contains('13')])
    else:
        print(df_preguntas)

except Exception as e:
    print(e)
