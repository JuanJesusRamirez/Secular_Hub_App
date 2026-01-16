# Guía de Integración - Sistema de Análisis de Sentimiento

Esta guía te ayudará a integrar el sistema de análisis de sentimiento en tu proyecto existente.

## 📋 Requisitos Previos

- React 18+ o 19
- TypeScript
- Tailwind CSS
- lucide-react (para iconos)

## 🚀 Pasos de Integración

### Paso 1: Instalar Dependencias

```bash
npm install lucide-react
# o si usas yarn
yarn add lucide-react
```

### Paso 2: Copiar Archivos de Tipos

1. Crea la carpeta `src/types` si no existe
2. Copia el contenido de `types-sentiment.ts` a `src/types/sentiment.ts`

```bash
mkdir -p src/types
cp types-sentiment.ts src/types/sentiment.ts
```

### Paso 3: Copiar Archivos de Utilidades

1. Crea la carpeta `src/utils` si no existe
2. Copia el contenido de `utils-sentiment.ts` a `src/utils/sentiment.ts`

```bash
mkdir -p src/utils
cp utils-sentiment.ts src/utils/sentiment.ts
```

### Paso 4: Copiar Hooks Personalizados

1. Crea la carpeta `src/hooks` si no existe
2. Copia el contenido de `hooks-sentiment.ts` a `src/hooks/useSentiment.ts`

```bash
mkdir -p src/hooks
cp hooks-sentiment.ts src/hooks/useSentiment.ts
```

### Paso 5: Copiar Componentes

Copia los siguientes componentes desde la carpeta `client/src/components/`:

```bash
cp client/src/components/SentimentBadge.tsx src/components/
cp client/src/components/AssetCard.tsx src/components/
cp client/src/components/AssetsList.tsx src/components/
```

### Paso 6: Copiar Datos

Copia el archivo de datos a tu carpeta `public/`:

```bash
cp client/public/assets-data.json public/
```

### Paso 7: Actualizar Configuración de Tailwind

Asegúrate de que tu `tailwind.config.js` incluya los colores necesarios:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#001F3F',
        'primary-foreground': '#FFFFFF',
      }
    }
  }
}
```

## 💻 Uso Básico

### Opción 1: Usar el Componente Completo

```tsx
import AssetsList from '@/components/AssetsList';
import { useAssets } from '@/hooks/useSentiment';

export default function MyWindow() {
  const { assets, loading, error } = useAssets('/assets-data.json');

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6">
      <AssetsList 
        assets={assets}
        title="Análisis de Sentimiento"
        description="Perspectivas de inversión por clase de activo"
      />
    </div>
  );
}
```

### Opción 2: Usar Componentes Individuales

```tsx
import AssetCard from '@/components/AssetCard';
import SentimentBadge from '@/components/SentimentBadge';

export default function MyWindow() {
  return (
    <div className="space-y-4">
      <SentimentBadge sentiment="Bullish" size="lg" />
      
      <AssetCard
        theme="STOCKS"
        sentiment="Bullish"
        sentiment_distribution={{ Bullish: 45, Neutral: 10, Bearish: 5 }}
        description="Policy, AI and capex all add up to stock gains..."
        sub_themes={["High to Higher"]}
        institutions_count={60}
        calls_count={60}
        institutions={["Goldman Sachs", "Morgan Stanley"]}
      />
    </div>
  );
}
```

### Opción 3: Usar Hooks Personalizados

```tsx
import { useAssets, useSentimentStats, useSentimentFilter } from '@/hooks/useSentiment';

export default function MyWindow() {
  const { assets, loading } = useAssets('/assets-data.json');
  const stats = useSentimentStats(assets);
  const { selectedSentiment, handleFilterChange } = useSentimentFilter();

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <p>Assets Alcistas: {stats.bullishCount}</p>
        <p>Total de Análisis: {stats.totalCalls}</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['All', 'Bullish', 'Neutral', 'Bearish'].map(sentiment => (
          <button
            key={sentiment}
            onClick={() => handleFilterChange(sentiment as any)}
            className={`px-4 py-2 rounded ${
              selectedSentiment === sentiment
                ? 'bg-primary text-white'
                : 'bg-gray-100'
            }`}
          >
            {sentiment}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## 🎨 Personalización

### Cambiar Colores de Sentimiento

En `src/utils/sentiment.ts`, modifica la función `getSentimentColors()`:

```typescript
export function getSentimentColors(sentiment: SentimentType) {
  const colors = {
    Bullish: {
      bg: 'bg-emerald-50',      // Cambiar aquí
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      barColor: '#10b981'
    },
    // ... resto de sentimientos
  };
  return colors[sentiment];
}
```

### Cambiar Tamaños de Componentes

En `src/components/SentimentBadge.tsx`:

```tsx
const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
  xl: 'px-6 py-3 text-lg'  // Agregar nuevo tamaño
}
```

### Agregar Nuevos Sentimientos

1. Actualiza el tipo en `src/types/sentiment.ts`:

```typescript
export type SentimentType = 'Bullish' | 'Bearish' | 'Neutral' | 'MuyBullish';
```

2. Agrega la configuración en `getSentimentColors()`:

```typescript
MuyBullish: {
  bg: 'bg-green-100',
  text: 'text-green-800',
  border: 'border-green-300',
  barColor: '#16a34a'
}
```

## 📊 Procesamiento de Datos

Si necesitas procesar tus propios datos para generar `assets-data.json`:

```python
# Python script para procesar Excel
import pandas as pd
import json
from collections import defaultdict

def extract_sentiment(text):
    text_lower = str(text).lower()
    positive_words = ['positive', 'optimistic', 'strong', ...]
    negative_words = ['negative', 'pessimistic', 'weak', ...]
    
    pos_count = sum(1 for w in positive_words if w in text_lower)
    neg_count = sum(1 for w in negative_words if w in text_lower)
    
    if pos_count > neg_count:
        return 'Bullish'
    elif neg_count > pos_count:
        return 'Bearish'
    return 'Neutral'

# Leer Excel
df = pd.read_excel('2026.xlsx')

# Procesar por tema
assets_data = {}
for theme in df['Theme'].unique():
    theme_df = df[df['Theme'] == theme]
    sentiments = [extract_sentiment(call) for call in theme_df['Call_text']]
    sentiment_counts = defaultdict(int)
    for s in sentiments:
        sentiment_counts[s] += 1
    
    dominant_sentiment = max(sentiment_counts, key=sentiment_counts.get)
    
    assets_data[theme] = {
        'theme': theme,
        'sentiment': dominant_sentiment,
        'sentiment_distribution': dict(sentiment_counts),
        'description': theme_df['Section_description'].iloc[0],
        'sub_themes': theme_df['Sub_theme'].unique().tolist(),
        'institutions_count': len(theme_df['Institution'].unique()),
        'calls_count': len(theme_df),
        'institutions': theme_df['Institution'].unique().tolist()[:5]
    }

# Guardar JSON
with open('assets-data.json', 'w', encoding='utf-8') as f:
    json.dump(assets_data, f, ensure_ascii=False, indent=2)
```

## 🔧 Troubleshooting

### Problema: "Cannot find module '@/types/sentiment'"

**Solución:** Verifica que tu `tsconfig.json` tenga configurado el alias `@`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Problema: Los estilos no se aplican

**Solución:** Asegúrate de que Tailwind CSS esté correctamente configurado y que el archivo CSS global importe Tailwind:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Problema: Los datos no cargan

**Solución:** 
1. Verifica que `assets-data.json` esté en la carpeta `public/`
2. Abre la consola del navegador para ver si hay errores de CORS
3. Verifica que la URL en `useAssets()` sea correcta

### Problema: Los iconos no aparecen

**Solución:** Instala lucide-react:

```bash
npm install lucide-react
```

## 📱 Responsive Design

Los componentes están diseñados para ser responsive. Para personalizar los breakpoints, modifica en `tailwind.config.js`:

```js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    }
  }
}
```

## 🎯 Casos de Uso Comunes

### Mostrar en Modal

```tsx
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AssetsList from '@/components/AssetsList';

export default function MyModal() {
  const [open, setOpen] = useState(false);
  const { assets } = useAssets();

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir Análisis</button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <AssetsList assets={assets} />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Mostrar en Sidebar

```tsx
export default function Sidebar() {
  const { assets, loading } = useAssets();

  return (
    <aside className="w-80 bg-gray-50 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Sentimiento de Mercado</h2>
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <AssetsList assets={assets} title="" />
      )}
    </aside>
  );
}
```

### Mostrar en Pestaña

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MyTabs() {
  const { assets } = useAssets();

  return (
    <Tabs defaultValue="sentiment">
      <TabsList>
        <TabsTrigger value="sentiment">Sentimiento</TabsTrigger>
        <TabsTrigger value="other">Otro</TabsTrigger>
      </TabsList>
      
      <TabsContent value="sentiment">
        <AssetsList assets={assets} />
      </TabsContent>
    </Tabs>
  );
}
```

## 📚 Documentación Adicional

- [Documentación de React](https://react.dev)
- [Documentación de Tailwind CSS](https://tailwindcss.com)
- [Documentación de lucide-react](https://lucide.dev)

## ✅ Checklist de Integración

- [ ] Dependencias instaladas
- [ ] Archivos de tipos copiados
- [ ] Archivos de utilidades copiados
- [ ] Hooks copiados
- [ ] Componentes copiados
- [ ] Datos copiados a `public/`
- [ ] Tailwind CSS configurado
- [ ] Alias `@` configurado en tsconfig.json
- [ ] Componentes importados correctamente
- [ ] Datos cargando correctamente

---

**Versión:** 1.0  
**Última actualización:** 2026-01-15  
**Soporte:** Para preguntas, revisa la sección de Troubleshooting
