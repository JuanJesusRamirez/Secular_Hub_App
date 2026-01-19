import os

translations = {
    # XAU.csv
    "J.P. Morgan mantiene una 'fuerte convicciÃ³n' de que el oro alcanzarÃ¡ los $5,000 hacia finales de aÃ±o. Gregory Shearer, jefe de estrategia de metales, afirma que 'aunque el tiempo de los catalizadores es difÃ­cil de precisar, la demanda tiene suficiente potencia para este nivel'. El banco destaca el rol de los bancos centrales (previendo compras de 755 toneladas en 2026) y una nueva demanda proveniente del sector asegurador chino y la comunidad cripto.": "J.P. Morgan maintains 'strong conviction' gold reaches $5,000 by year-end. Gregory Shearer notes 'demand has enough power for this level'. Bank highlights central bank buying (755t in 2026) and new demand from Chinese insurers/crypto.",
    
    "La firma elevÃ³ su previsiÃ³n citando un aumento del 14% impulsado por flujos en ETFs y compras estructurales de bancos centrales de mercados emergentes. Sus analistas seÃ±alan que 'el oro se beneficiarÃ¡ de factores cÃ­clicos como los recortes de tasas de la Fed (esperando 100 pb menos para mediados de 2026) y factores estructurales de diversificaciÃ³n ante la incertidumbre comercial global'.": "Firm raised forecast citing 14% increase on ETF flows and EM central bank buying. Analysts note 'gold benefits from cyclical factors like Fed cuts (100bps less by mid-2026) and structural diversification amid trade uncertainty'.",
    
    "UBS prevÃ© que el oro toque los $5,000 en el primer trimestre, pero que termine el aÃ±o en $4,800 tras una 'toma de beneficios natural'. El banco advierte que la volatilidad polÃ­tica por las elecciones intermedias de EE.UU. podrÃ­a disparar el precio hasta los $5,400 en un escenario de estrÃ©s, afirmando que 'el oro sigue siendo el componente central de protecciÃ³n ante dÃ©ficits gubernamentales crecientes'.": "UBS sees gold touching $5,000 in Q1, ending year at $4,800 on 'profit taking'. Warns political vol could spike price to $5,400 in stress scenario, stating 'gold remains core hedge against rising fiscal deficits'.",
    
    "BofA sitÃºa su objetivo en los $5,000 basÃ¡ndose en lo que llaman un 'marco de polÃ­tica poco ortodoxo' de la Casa Blanca. El reporte de su equipo de Global Research subraya que 'dÃ©ficits fiscales y el aumento de la deuda, junto con una presiÃ³n polÃ­tica para recortar tasas con inflaciÃ³n persistente, crean el entorno perfecto para que el oro alcance nuevos hitos'.": "BofA targets $5,000 based on 'unorthodox policy framework'. Global Research notes 'fiscal deficits, rising debt and pressure to cut rates with sticky inflation create perfect environment for gold milestones'.",
    
    "HSBC es mÃ¡s cauteloso, proyectando un pico de $5,050 en el primer semestre seguido de una correcciÃ³n profunda. Sus analistas advierten que 'vemos un rango muy amplio entre $5,050 y $3,950 debido a que los precios altos podrÃ­an reducir la demanda de joyerÃ­a y provocar ventas masivas si los riesgos geopolÃ­ticos se calman o la Fed detiene sus recortes'.": "HSBC is cautious, seeing $5,050 peak in H1 then deep correction. Analysts warn of 'wide range $5,050-$3,950 as high prices could curb jewelry demand and trigger selling if risks calm or Fed halts cuts'.",
    
    "En su 'escenario base' (50% de probabilidad), Citi prevÃ© que el oro baje si la economÃ­a de EE.UU. mejora significativamente. Sin embargo, contrastan esto con un 'escenario alcista' (30% prob.) de $5,000-6,000 si ocurre una 'reasignaciÃ³n masiva de riqueza global' donde el mercado fÃ­sico, al ser pequeÃ±o, obligue a un ajuste de precios violento hacia arriba.": "In 'base case' (50% prob), Citi sees gold falling if US econ improves. Contrasts with 'bullish scenario' (30% prob) of $5,000-6,000 if 'massive global wealth reallocation' forces violent price adjustment in small physical market.",
    
    "\"El banco proyecta que el rally continuarÃ¡ apoyado por cambios en el liderazgo de la Fed y una debilidad sostenida del dÃ³lar. SegÃºn su nota de enero 2026, 'una combinaciÃ³n de fuerzas monetarias e institucionales sostendrÃ¡ las ganancias": "\"Bank projects rally continues on Fed leadership changes and weak dollar. Note says 'monetary and institutional forces will sustain gains",
    
    " el costo de oportunidad de mantener activos sin rendimiento como el oro seguirÃ¡ cayendo ante tipos de interÃ©s reales mÃ¡s bajos'.\"": " opportunity cost of holding non-yielding assets keeps falling amid lower real rates'.\"",
    
    "Standard Chartered delinea un panorama constructivo con un promedio anual de $4,488, pero con un cierre fuerte de aÃ±o. Su informe enfatiza que 'el oro permanece altamente sensible a los rendimientos reales y a la dinÃ¡mica de divisas, funcionando como una cobertura crÃ­tica ante la incertidumbre del camino de las tasas de interÃ©s en la segunda mitad de 2026'.": "Standard Chartered sees constructive outlook (avg $4,488), strong year-end. Report emphasizes 'gold remains highly sensitive to real yields/FX, functioning as critical hedge against 2026 H2 rate path uncertainty'.",
    
    "\"ANZ anticipa un pico de $4,600 en junio de 2026 para luego estabilizarse cerca de los $4,400. Su tesis es que 'el ciclo de flexibilizaciÃ³n de la Fed proporcionarÃ¡ vientos de cola hasta mediados de aÃ±o": "\"ANZ sees $4,600 peak in June 2026 then stabilizing near $4,400. Thesis: 'Fed easing cycle provides tailwinds until mid-year",
    
    " despuÃ©s de eso, el mercado enfrentarÃ¡ vientos en contra a medida que las tasas reales comiencen a normalizarse y se gane claridad sobre el crecimiento de EE.UU.'.\"": " then market faces headwinds as real rates normalize and US growth clarity is gained'.\"",
    
    "SocGen mantiene una de las posturas mÃ¡s sÃ³lidas sobre el valor del oro como 'diversificador definitivo'. Proyectan que alcanzarÃ¡ los $5,000 para fines de 2026, argumentando que 'la volatilidad persistente en los mercados de renta variable y la necesidad de cobertura contra riesgos de cola mantendrÃ¡n la demanda de inversiÃ³n en niveles rÃ©cord'.": "SocGen holds strong stance on gold as 'ultimate diversifier'. Projects $5,000 by end-2026, arguing 'persistent equity vol and tail risk hedging needs will keep investment demand at record levels'.",

    # Rate FED.csv
    "En Estados Unidos, una combinación de una economía resiliente y una tasa de inflación que esperamos que se mantenga alrededor del 3% según la medida PCE subyacente preferida por la Fed sugiere que los recortes de tipos llegarán más lentamente de lo que los inversores anticipan. El tipo de interés de los fondos federales se encuentra en un rango del 3,25-3,5%, frente a las expectativas del mercado de que el próximo año caería por debajo del 3%": "In US, resilient economy and inflation expected around 3% (core PCE) suggests slower rate cuts than investors anticipate. Fed funds rate range 3.25-3.5%, vs market expectations below 3% next year.",
    
    "Esperamos un aumento del ritmo económico estadounidense hasta el 2,3%, respaldado por el alivio de los cambios fiscales, recortes de tipos de la Fed hacia el 3%, mayor estabilidad en aranceles y un gasto continuo de capital impulsado por IA y tecnología. En conjunto, estos factores deberían ayudar a prolongar el ciclo.": "We expect US growth uptick to 2.3%, supported by tax relief, Fed cuts to 3%, tariff stability and AI/tech capex. Together, these help prolong the cycle.",
    
    "La economía estadounidense sigue sólida, con un crecimiento proyectado en un 2,1%, impulsado por el apoyo fiscal y la inversión en IA. La inflación se mantendrá por encima del objetivo en el 2,9%, mientras que se espera que la Fed realice dos recortes de tipos para final de año, situándose en el 3,5%.": "US economy remains solid, projected 2.1% growth driven by fiscal support and AI. Inflation stays above target at 2.9%, while Fed expected to make two cuts by year-end, settling at 3.5%.",
    
    "Con la inflación estadounidense proyectada apenas ligeramente por encima del objetivo, es probable que la Fed haga hincapié en apoyar el empleo y el crecimiento, aunque los próximos cambios en la junta podrían afectar el tamaño y la velocidad de las rebajas de tipos. Es probable que la Fed siga rebajando los tipos el próximo año hasta que la economía y los mercados financieros la detengan, llevando el límite inferior del rango al 2,5% para 2027.": "With US inflation slightly above target, Fed likely emphasizes jobs/growth, though board changes could affect cut pace. Fed likely continues cuts next year until halted by economy/markets, reaching 2.5% lower bound by 2027.",
    
    "En la Fed al 3%. Es probable que el banco central dovish continúe con recortes de tipos, en respuesta a la debilidad del mercado laboral.": "Fed to 3%. Dovish central bank likely continues cuts in response to labor market weakness.",
    
    "Esperamos que la Fed recorte 50 puntos básicos hasta el 3-3,25% y vemos riesgos de acomodación debido a nuestra condena sobre la desinflación, las preocupaciones del mercado laboral y el próximo cambio en el liderazgo de la Fed.": "Expect Fed to cut 50bps to 3-3.25%, seeing accommodation risks due to disinflation conviction, labor concerns and leadership change.",
    
    "Esperamos que la Reserva Federal de EE. UU. realice menos recortes de tipos de interés de los que los mercados esperan, a pesar de los esfuerzos de Trump por socavar su independencia. Nuestros economistas esperan solo una nueva bajada en el tipo de los fondos federales hasta el 3,75% para finales de 2026. Eso podría generar cierta decepción en el mercado de bonos.": "Expect Fed to make fewer cuts than market expects, despite political pressure. Economists see only one further cut to 3.75% by end-2026. Could cause bond market disappointment.",
    
    "Se espera que el crecimiento económico mantenga la inflación estadounidense algo persistente, manteniéndose por encima del 2% a finales de 2026. Esta combinación de sólido crecimiento y una inflación aún persistente sugiere que la Reserva Federal tendrá un margen limitado para recortar los tipos por debajo de nuestra tasa neutral estimada del 3,5%. Nuestra previsión de la Fed es algo más agresiva de lo que esperaba el mercado de bonos.": "Growth keeps inflation sticky above 2% by end-2026. Solid growth + sticky inflation suggests limited room to cut below 3.5% neutral rate. Our forecast is more hawkish than bond market.",
    
    "Para 2026, esperamos dos recortes adicionales de 25 puntos básicos por parte de la Fed a mitad de año, lo que situaría el tipo terminal en un 3%-3,25%.": "For 2026, we expect two additional 25bps cuts mid-year, placing terminal rate at 3%-3.25%.",
    
    "Esperamos que los mercados laborales dominen el pensamiento de la Fed, y la inclinación más moderada de la Fed en 2026-2027 nos lleva a esperar una serie de recortes de tipos durante el próximo año, bajando el tipo de los fondos federales al límite inferior de las estimaciones neutrales (3% en el límite superior) para septiembre.": "Expect labor markets to dominate Fed thinking. Dovish lean in 2026-2027 implies series of cuts, lowering funds rate to neutral lower bound (3% upper) by September.",
    
    # SP500.csv
    "Federated Hermes ha mejorado su perspectiva de beneficios futuros y también hemos aumentado nuestro objetivo de precio para el S&P 500 2026 de 7.500 a 7.800.": "Federated Hermes upgraded earnings outlook and raised 2026 S&P 500 target from 7,500 to 7,800.",
    
    "Las acciones estadounidenses deberían superar a sus homólogos globales en 2026, con el S&P 500 subiendo hasta 7.800 en los próximos 12 meses, una ganancia del 14% respecto a su nivel actual, frente a las ganancias esperadas del 7% para el TOPIX japonés y el 4% del MSCI Europa.": "US stocks should outperform global peers in 2026; S&P 500 rising to 7,800 (+14%), vs 7% for TOPIX and 4% for MSCI Europe.",
    
    "Las acciones mantienen potencial al alza, lideradas por las acciones estadounidenses impulsadas por las ganancias de productividad impulsadas por la IA e inversión fiscal. La perspectiva de Europa se sostiene con el gasto en defensa e infraestructuras, aunque la demanda débil y la lenta adopción tecnológica frenan el impulso. Se prevé que el S&P 500 alcance los 7.600, mientras que el Euro STOXX 50 podría subir hasta los 6.200.": "Stocks maintain upside, led by US (AI/fiscal). Europe supported by defense/infra but slowed by weak demand. S&P 500 forecast 7,600, Euro STOXX 50 to 6,200.",
    
    "No hay duda de que las valoraciones de las acciones son altas, especialmente en Estados Unidos. Pero aún no están tan tensos como durante la última burbuja bursátil impulsada por la tecnología a finales de los años 90 y el crecimiento de los beneficios debería mantenerse sólido. Por ello, creemos que las acciones pueden seguir repuntando durante un tiempo: proyectamos que el S&P 500 subirá a 8.000 para finales de 2026.": "Valuations are high but not 90s-bubble stretched; earnings solid. Stocks can rally further: S&P 500 to 8,000 by end-2026.",
    
    "Nuestro optimismo por las acciones se mantiene, especialmente en Estados Unidos: el S&P 500 podría alcanzar alrededor de 7.500 puntos a finales de 2026, impulsado por el crecimiento de beneficios y las inversiones en IA. Las finanzas podrían beneficiarse de rendimientos moderados y desregulación.": "Optimism remains for US stocks: S&P 500 to 7,500 by end-2026 on earnings/AI. Financials benefit from moderate yields/deregulation.",
    
    "\"El mercado alcista se extenderá en 2026, respaldado por la revolución en curso de la IA y reforzado por un sólido aunque poco destacable crecimiento económico, así como por estímulos fiscales y monetarios (OBBB, ciclo de recortes de la Fed). Es importante destacar que las señales que históricamente han puesto fin a los mercados alcistas recesión, \"\"no cooperativa\"\" Fed, el entusiasmo de los inversores y el sentimiento de los mercados de capitales están ausentes. El caso base es S&P 500 con 7.750 al final del año.\"": "\"Bull market extends in 2026 on AI, solid growth, and stimulus. Signals ending bulls (recession, hostile Fed, euphoria) are absent. Base case S&P 500 7,750.\"",
    
    "Se esperan rentabilidades de un solo dígito en rentas variables, impulsadas por el crecimiento de los beneficios. Vemos el valor razonable del S&P 500 cerca de 7.200-7.400, asumiendo una compresión múltiple modesta.": "Single-digit equity returns expected on earnings growth. S&P 500 fair value 7,200-7,400 assuming modest multiple compression.",
    
    "El rango objetivo de valor razonable de LPL Research para el S&P 500 a final de año 2026 es de 7.300 a 7.400, basado en 23 veces 320 dólares en ganancias por acción del S&P 500 en 2027, un aumento del 10% respecto a nuestra estimación revisada al alza para 2026 de 290 dólares. Estimamos que las probabilidades de este escenario sean alrededor del 60%.": "LPL Research fair value range 7,300-7,400 (23x $320 2027 EPS). Odds estimated at 60%.",
    
    "Esperamos un crecimiento del EPS del 14% pero solo un 4-5% de apreciación del precio del S&P, con un objetivo de cierre de año de 7.100 para el índice. Estamos atentos a señales que sugieran que podríamos estar pasando de un mercado alcista impulsado por el consumo a uno impulsado por el capital.": "Expect 14% EPS growth but only 4-5% price appreciation (target 7,100). Watching for shift from consumption-driven to capital-driven bull market.",
    
    "Nuestro objetivo de precio de fin de año para el SPX es 7.400. Actualmente, el SPX cotiza a valoraciones elevadas en el extremo superior de su canal de tendencia a largo plazo. Esto significa que se debería esperar cierta consolidación en algún momento, quizás a mediados o finales del invierno.": "Year-end SPX target 7,400. Currently at top of long-term trend channel. Expect consolidation mid-to-late winter."
}

files = ['XAU.csv', 'Rate FED.csv', 'SP500.csv']
for f in files:
    if not os.path.exists(f): 
        continue
    
    print(f"Updating {f}...")
    try:
        # Read as binary/latin1 to preserve encoding
        with open(f, 'r', encoding='latin1') as file:
            content = file.read()
        
        # Perform replacements
        new_content = content
        count = 0
        for span, eng in translations.items():
            if span in new_content:
                # Remove semicolons from English text to avoid breaking CSV
                eng_clean = eng.replace(';', ',')
                new_content = new_content.replace(span, eng_clean)
                count += 1
        
        if count > 0:
            with open(f, 'w', encoding='latin1') as file:
                file.write(new_content)
            print(f"Updated {count} translations in {f}")
        else:
            print(f"No translations found/applied in {f}")
            
    except Exception as e:
        print(f"Error updating {f}: {e}")
