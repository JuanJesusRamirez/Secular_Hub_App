import pandas as pd
import os

try:
    mariopath = 'Encuesta Mario.xlsx'
    preguntaspath = 'preguntas.xlsx'

    if os.path.exists(mariopath):
        df_mario = pd.read_excel(mariopath)
        print("=== Encuesta Mario.xlsx ===")
        print(df_mario.head())
        print(df_mario.columns.tolist())
    else:
        print(f"{mariopath} not found")

    if os.path.exists(preguntaspath):
        df_preguntas = pd.read_excel(preguntaspath)
        print("\n=== preguntas.xlsx ===")
        print(df_preguntas.head())
        print(df_preguntas.columns.tolist())

except Exception as e:
    print(e)
