# Bases Modulares - Sistema de Análisis de Sentimiento

Este documento contiene todas las bases necesarias para integrar el sistema de análisis de sentimiento en tu proyecto existente.

## 1. Tipos TypeScript

```typescript
// types/sentiment.ts
export type SentimentType = 'Bullish' | 'Bearish' | 'Neutral';

export interface SentimentDistribution {
  Bullish?: number;
  Bearish?: number;
  Neutral?: number;
}

export interface Asset {
  theme: string;
  sentiment: SentimentType;
  sentiment_distribution: SentimentDistribution;
  description: string;
  sub_themes: string[];
  institutions_count: number;
  calls_count: number;
  institutions: string[];
}

export interface AssetsData {
  [key: string]: Asset;
}

export interface SentimentStats {
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  totalCalls: number;
  totalInstitutions: number;
}
```

## 2. Componentes React

### 2.1 SentimentBadge Component
Muestra un indicador visual del sentimiento (Alcista/Bajista/Neutral).

**Props:**
- `sentiment: 'Bullish' | 'Bearish' | 'Neutral'` - Tipo de sentimiento
- `size?: 'sm' | 'md' | 'lg'` - Tamaño del badge (default: 'md')

**Uso:**
```tsx
<SentimentBadge sentiment="Bullish" size="md" />
```

### 2.2 AssetCard Component
Tarjeta expandible que muestra información completa de un asset.

**Props:**
- `theme: string` - Nombre del asset
- `sentiment: SentimentType` - Sentimiento dominante
- `sentiment_distribution: SentimentDistribution` - Distribución de sentimientos
- `description: string` - Descripción de expectativas
- `sub_themes: string[]` - Temas relacionados
- `institutions_count: number` - Número de instituciones
- `calls_count: number` - Número de análisis
- `institutions: string[]` - Lista de instituciones

**Características:**
- Línea de acento izquierda
- Barra de distribución de sentimientos
- Expansión suave con detalles completos
- Muestra sub-temas e instituciones

**Uso:**
```tsx
<AssetCard
  theme="STOCKS"
  sentiment="Bullish"
  sentiment_distribution={{ Bullish: 45, Neutral: 10, Bearish: 5 }}
  description="Policy, AI and capex all add up to stock gains..."
  sub_themes={["High to Higher", "No Bubble No Problem"]}
  institutions_count={60}
  calls_count={60}
  institutions={["Goldman Sachs", "Morgan Stanley", "JPMorgan"]}
/>
```

### 2.3 AssetsList Component
Lista filtrable de todos los assets con sentimiento.

**Props:**
- `assets: Record<string, Asset>` - Datos de assets
- `title?: string` - Título de la sección
- `description?: string` - Descripción

**Características:**
- Filtros interactivos por sentimiento
- Animaciones suaves en carga
- Contador de assets por sentimiento
- Búsqueda y ordenamiento

**Uso:**
```tsx
<AssetsList
  assets={assetsData}
  title="Análisis de Assets"
  description="Sentimiento de mercado por clase de activo"
/>
```

## 3. Utilidades

### 3.1 Función de Extracción de Sentimiento
```typescript
// utils/sentiment.ts
export function extractSentiment(text: string): SentimentType {
  const textLower = text.toLowerCase();
  
  const positiveWords = [
    'positive', 'optimistic', 'strong', 'solid', 'resilient', 
    'growth', 'opportunity', 'favorable', 'upside', 'bullish', 
    'outperform', 'gains', 'rally', 'boom', 'accelerate', 
    'broadening', 'attractive'
  ];
  
  const negativeWords = [
    'negative', 'pessimistic', 'weak', 'decline', 'risk', 
    'volatility', 'correction', 'bearish', 'underperform', 
    'headwind', 'pressure', 'challenge', 'downside', 'caution', 
    'concern'
  ];
  
  const neutralWords = [
    'moderate', 'balanced', 'mixed', 'neutral', 'range-bound', 
    'stable', 'steady'
  ];
  
  const posCount = positiveWords.filter(w => textLower.includes(w)).length;
  const negCount = negativeWords.filter(w => textLower.includes(w)).length;
  const neuCount = neutralWords.filter(w => textLower.includes(w)).length;
  
  if (posCount > negCount && posCount > neuCount) return 'Bullish';
  if (negCount > posCount && negCount > neuCount) return 'Bearish';
  return 'Neutral';
}
```

### 3.2 Función de Cálculo de Porcentajes
```typescript
// utils/sentiment.ts
export function calculateSentimentPercentages(
  distribution: SentimentDistribution
): Record<SentimentType, number> {
  const total = Object.values(distribution).reduce((a, b) => a + (b || 0), 0);
  
  return {
    Bullish: total > 0 ? Math.round(((distribution.Bullish || 0) / total) * 100) : 0,
    Bearish: total > 0 ? Math.round(((distribution.Bearish || 0) / total) * 100) : 0,
    Neutral: total > 0 ? Math.round(((distribution.Neutral || 0) / total) * 100) : 0
  };
}
```

### 3.3 Hook para Cargar Datos de Assets
```typescript
// hooks/useAssets.ts
import { useState, useEffect } from 'react';
import { AssetsData } from '@/types/sentiment';

export function useAssets(dataUrl: string = '/assets-data.json') {
  const [assets, setAssets] = useState<AssetsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(dataUrl)
      .then(res => res.json())
      .then(data => {
        setAssets(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [dataUrl]);

  return { assets, loading, error };
}
```

### 3.4 Hook para Calcular Estadísticas
```typescript
// hooks/useSentimentStats.ts
import { useMemo } from 'react';
import { AssetsData, SentimentStats } from '@/types/sentiment';

export function useSentimentStats(assets: AssetsData): SentimentStats {
  return useMemo(() => {
    const values = Object.values(assets);
    
    return {
      bullishCount: values.filter(a => a.sentiment === 'Bullish').length,
      bearishCount: values.filter(a => a.sentiment === 'Bearish').length,
      neutralCount: values.filter(a => a.sentiment === 'Neutral').length,
      totalCalls: values.reduce((sum, a) => sum + a.calls_count, 0),
      totalInstitutions: new Set(values.flatMap(a => a.institutions)).size
    };
  }, [assets]);
}
```

## 4. Estilos CSS

### 4.1 Clases Personalizadas
```css
/* Línea de acento vertical */
.accent-line {
  width: 4px;
  height: 100%;
  background-color: #001F3F; /* Azul marino */
}

/* Divisor sutil entre secciones */
.section-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 3rem 0;
}

/* Números grandes para estadísticas */
.stat-number {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 3rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: #001F3F;
}

/* Barra de distribución de sentimientos */
.sentiment-bar {
  display: flex;
  gap: 2px;
  height: 8px;
  background-color: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.sentiment-bar-bullish {
  background-color: #22c55e;
}

.sentiment-bar-neutral {
  background-color: #94a3b8;
}

.sentiment-bar-bearish {
  background-color: #ef4444;
}
```

### 4.2 Colores de Sentimiento
```css
/* Bullish - Verde */
.sentiment-bullish {
  background-color: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

/* Neutral - Gris */
.sentiment-neutral {
  background-color: #f1f5f9;
  color: #334155;
  border-color: #cbd5e1;
}

/* Bearish - Rojo */
.sentiment-bearish {
  background-color: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}
```

## 5. Estructura de Datos JSON

Formato esperado para `assets-data.json`:

```json
{
  "STOCKS": {
    "theme": "STOCKS",
    "sentiment": "Bullish",
    "sentiment_distribution": {
      "Bullish": 45,
      "Neutral": 10,
      "Bearish": 5
    },
    "description": "Policy, AI and capex all add up to stock gains...",
    "sub_themes": ["High to Higher", "No Bubble No Problem"],
    "institutions_count": 60,
    "calls_count": 60,
    "institutions": ["Goldman Sachs", "Morgan Stanley", "JPMorgan"]
  }
}
```

## 6. Integración en Proyecto Existente

### Paso 1: Copiar Componentes
```bash
cp -r components/Sentiment* src/components/
cp -r components/Asset* src/components/
```

### Paso 2: Copiar Tipos
```bash
mkdir -p src/types
cp types/sentiment.ts src/types/
```

### Paso 3: Copiar Utilidades
```bash
mkdir -p src/utils src/hooks
cp utils/sentiment.ts src/utils/
cp hooks/useAssets.ts src/hooks/
cp hooks/useSentimentStats.ts src/hooks/
```

### Paso 4: Copiar Datos
```bash
cp client/public/assets-data.json public/
```

### Paso 5: Importar en tu Componente
```tsx
import AssetsList from '@/components/AssetsList';
import { useAssets } from '@/hooks/useAssets';
import { useSentimentStats } from '@/hooks/useSentimentStats';

export default function MyWindow() {
  const { assets, loading } = useAssets('/assets-data.json');
  const stats = useSentimentStats(assets);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <AssetsList assets={assets} />
    </div>
  );
}
```

## 7. Dependencias Requeridas

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.453.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/react": "^19.0.0"
  }
}
```

## 8. Configuración de Tailwind CSS

Asegúrate de que tu `tailwind.config.js` incluya:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#001F3F',
        'primary-foreground': '#FFFFFF'
      }
    }
  }
}
```

## 9. Personalización

### Cambiar Paleta de Colores
Modifica en `SentimentBadge.tsx` y `AssetCard.tsx`:

```tsx
const sentimentConfig = {
  Bullish: {
    bg: 'bg-green-50',      // Cambiar aquí
    text: 'text-green-700', // Cambiar aquí
    border: 'border-green-200'
  }
}
```

### Agregar Más Sentimientos
Extiende el tipo `SentimentType`:

```typescript
export type SentimentType = 'Bullish' | 'Bearish' | 'Neutral' | 'MuyBullish' | 'MuyBearish';
```

### Personalizar Tamaños
Modifica en `SentimentBadge.tsx`:

```tsx
const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
  xl: 'px-6 py-3 text-lg' // Agregar nuevo tamaño
}
```

## 10. Troubleshooting

**Problema:** Los iconos no aparecen
**Solución:** Instala `lucide-react`: `npm install lucide-react`

**Problema:** Los estilos no se aplican
**Solución:** Verifica que Tailwind CSS esté configurado correctamente

**Problema:** Los datos no cargan
**Solución:** Verifica que `assets-data.json` esté en la carpeta `public/`

---

**Versión:** 1.0  
**Última actualización:** 2026-01-15  
**Componentes incluidos:** 3 (SentimentBadge, AssetCard, AssetsList)  
**Hooks incluidos:** 2 (useAssets, useSentimentStats)
