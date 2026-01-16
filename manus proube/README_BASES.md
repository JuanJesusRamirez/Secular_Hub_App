# 📦 Bases Modulares del Sistema de Análisis de Sentimiento

Aquí encontrarás todos los archivos necesarios para integrar el sistema de análisis de sentimiento en tu proyecto existente.

## 🎯 Inicio Rápido

### 1. Instalar Dependencia
```bash
npm install lucide-react
```

### 2. Copiar Archivos

**Tipos TypeScript:**
```bash
mkdir -p src/types
cp types-sentiment.ts src/types/sentiment.ts
```

**Utilidades:**
```bash
mkdir -p src/utils
cp utils-sentiment.ts src/utils/sentiment.ts
```

**Hooks:**
```bash
mkdir -p src/hooks
cp hooks-sentiment.ts src/hooks/useSentiment.ts
```

**Componentes:**
```bash
cp client/src/components/SentimentBadge.tsx src/components/
cp client/src/components/AssetCard.tsx src/components/
cp client/src/components/AssetsList.tsx src/components/
```

**Datos:**
```bash
cp client/public/assets-data.json public/
```

### 3. Usar en tu Proyecto

```tsx
import AssetsList from '@/components/AssetsList';
import { useAssets } from '@/hooks/useSentiment';

export default function MyWindow() {
  const { assets, loading } = useAssets('/assets-data.json');

  if (loading) return <div>Cargando...</div>;

  return <AssetsList assets={assets} />;
}
```

## 📁 Estructura de Archivos

```
informe-2026/
├── BASES_MODULO_SENTIMIENTO.md    ← Documentación técnica completa
├── GUIA_INTEGRACION.md             ← Guía paso a paso
├── README_BASES.md                 ← Este archivo
├── types-sentiment.ts              ← Tipos TypeScript
├── utils-sentiment.ts              ← Utilidades y funciones
├── hooks-sentiment.ts              ← Hooks personalizados
├── COMPONENTES_EXPORTAR.txt        ← Lista de archivos a copiar
└── client/
    ├── src/
    │   └── components/
    │       ├── SentimentBadge.tsx   ← Componente de badge
    │       ├── AssetCard.tsx        ← Componente de tarjeta
    │       └── AssetsList.tsx       ← Componente de lista
    └── public/
        └── assets-data.json        ← Datos de assets
```

## 🎨 3 Componentes Principales

### 1. **SentimentBadge**
Muestra un indicador visual del sentimiento.

```tsx
<SentimentBadge sentiment="Bullish" size="md" />
```

**Props:**
- `sentiment`: 'Bullish' | 'Bearish' | 'Neutral'
- `size?`: 'sm' | 'md' | 'lg'

### 2. **AssetCard**
Tarjeta expandible con información completa del asset.

```tsx
<AssetCard
  theme="STOCKS"
  sentiment="Bullish"
  sentiment_distribution={{ Bullish: 45, Neutral: 10, Bearish: 5 }}
  description="Policy, AI and capex..."
  sub_themes={["High to Higher"]}
  institutions_count={60}
  calls_count={60}
  institutions={["Goldman Sachs", "Morgan Stanley"]}
/>
```

### 3. **AssetsList**
Lista completa con filtros de sentimiento.

```tsx
<AssetsList
  assets={assetsData}
  title="Análisis de Sentimiento"
  description="Perspectivas de inversión"
/>
```

## 🔧 2 Hooks Principales

### 1. **useAssets**
Carga datos de assets desde JSON.

```tsx
const { assets, loading, error } = useAssets('/assets-data.json');
```

### 2. **useSentimentStats**
Calcula estadísticas agregadas.

```tsx
const stats = useSentimentStats(assets);
// { bullishCount, bearishCount, neutralCount, totalCalls, totalInstitutions }
```

## 🛠️ Utilidades Disponibles

```typescript
// Extraer sentimiento de texto
extractSentiment(text: string): SentimentType

// Calcular porcentajes
calculateSentimentPercentages(distribution): Record<SentimentType, number>

// Obtener colores
getSentimentColors(sentiment): { bg, text, border, barColor }

// Obtener labels en español
getSentimentLabel(sentiment): string

// Obtener emojis
getSentimentEmoji(sentiment): string

// Ordenar assets
sortAssetsBySentiment(assets): Array

// Filtrar assets
filterAssetsBySentiment(assets, sentiment): Array

// Calcular estadísticas
calculateSentimentStats(assets): Object

// Generar resumen
generateSentimentSummary(stats): string
```

## 📊 Estructura de Datos

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

## 🎨 Personalización

### Cambiar Colores
Modifica `getSentimentColors()` en `utils-sentiment.ts`:

```typescript
Bullish: {
  bg: 'bg-emerald-50',
  text: 'text-emerald-700',
  border: 'border-emerald-200',
  barColor: '#10b981'
}
```

### Agregar Nuevos Sentimientos
1. Actualiza el tipo `SentimentType`
2. Agrega configuración en `getSentimentColors()`

## ✅ Checklist

- [ ] `npm install lucide-react`
- [ ] Copiar tipos a `src/types/sentiment.ts`
- [ ] Copiar utilidades a `src/utils/sentiment.ts`
- [ ] Copiar hooks a `src/hooks/useSentiment.ts`
- [ ] Copiar componentes a `src/components/`
- [ ] Copiar datos a `public/assets-data.json`
- [ ] Verificar alias `@` en `tsconfig.json`
- [ ] Verificar Tailwind CSS configurado

## 📚 Documentación Completa

Para más detalles, consulta:
- **BASES_MODULO_SENTIMIENTO.md** - Referencia técnica completa
- **GUIA_INTEGRACION.md** - Guía paso a paso con ejemplos

## 🆘 Troubleshooting Rápido

**Error: Cannot find module '@/types/sentiment'**
→ Verifica que `tsconfig.json` tenga configurado el alias `@`

**Estilos no se aplican**
→ Verifica que Tailwind CSS esté importado en tu CSS global

**Datos no cargan**
→ Verifica que `assets-data.json` esté en `public/`

**Iconos no aparecen**
→ Instala lucide-react: `npm install lucide-react`

## 📱 Casos de Uso

### En Modal
```tsx
<Dialog>
  <DialogContent>
    <AssetsList assets={assets} />
  </DialogContent>
</Dialog>
```

### En Sidebar
```tsx
<aside className="w-80 overflow-y-auto">
  <AssetsList assets={assets} />
</aside>
```

### En Pestaña
```tsx
<Tabs>
  <TabsContent value="sentiment">
    <AssetsList assets={assets} />
  </TabsContent>
</Tabs>
```

## 🚀 Próximos Pasos

1. Integra los componentes en tu proyecto
2. Personaliza los colores según tu marca
3. Carga tus propios datos en `assets-data.json`
4. Adapta el layout a tu interfaz

## 📞 Soporte

Si tienes preguntas:
1. Revisa la **GUIA_INTEGRACION.md** para ejemplos
2. Consulta **BASES_MODULO_SENTIMIENTO.md** para referencia técnica
3. Verifica la sección de Troubleshooting

---

**Versión:** 1.0  
**Componentes:** 3 (SentimentBadge, AssetCard, AssetsList)  
**Hooks:** 2+ (useAssets, useSentimentStats, y más)  
**Utilidades:** 10+ funciones reutilizables  
**Última actualización:** 2026-01-15
