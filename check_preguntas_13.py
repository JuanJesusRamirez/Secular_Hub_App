import pandas as pd

try:
    preguntaspath = 'preguntas.xlsx'
    df_preguntas = pd.read_excel(preguntaspath)
    print(df_preguntas[df_preguntas['Número'] == 13])
except Exception as e:
    print(e)
