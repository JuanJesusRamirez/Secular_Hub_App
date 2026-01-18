# Tesis Agregadas Page

## Overview
Nueva página que muestra las **Tesis Agregadas** (Consensus Thesis vs Actual Outcomes) extraídas del archivo `tesis agregadas.csv`. Similar en diseño a la página Historical pero con una tabla expandible que muestra comparaciones entre las predicciones de consenso y los resultados reales.

## Estructura de Archivos Creados

### 1. API Endpoint
**Archivo:** `app/api/tesis/route.ts`
- Endpoint GET que lee y parsea el archivo CSV `tesis agregadas.csv`
- Usa `papaparse` para parsear el CSV con delimitador de punto y coma (`;`)
- Retorna datos estructurados con TypeScript

### 2. Componente Principal
**Archivo:** `components/tesis/tesis-table.tsx`
- Tabla interactiva con filas expandibles
- Filtrado por año
- Badges de colores para diferentes temas
- Muestra tanto la "Consensus Thesis" como la "Tesis Ex Post"

### 3. Página
**Archivo:** `app/tesis/page.tsx`
- Página principal accesible en `/tesis`
- Usa el componente TesisTable
- Maneja estados de carga y error

### 4. Hook Personalizado
**Archivo:** `lib/hooks/use-tesis-data.ts`
- Hook para facilitar el consumo de datos de tesis
- Incluye filtrado y helpers para años y temas

### 5. Navegación
**Archivo:** `components/layout/sidebar.tsx` (actualizado)
- Agregada entrada "Tesis" con icono BookOpen
- Ubicada después de "Historical"

## Características

### Filtrado por Año
- Botón "All Years" para mostrar todos los registros
- Botones individuales para cada año disponible
- Filtrado dinámico de datos

### Tabla Expandible
- Vista compacta con año, rank y tema
- Click para expandir y ver detalles completos
- Dos secciones en detalle:
  - **Consensus Thesis**: Predicción original
  - **Actual Outcome (Tesis Ex Post)**: Lo que realmente sucedió (destacado en naranja)

### Ranking y Desempate
- **Desempate en el Global Ranking:** En caso de empate en el ranking global, el desempate se realiza en base al nivel de convicción (mayor convicción tiene prioridad).

### Código de Colores
Los temas tienen colores consistentes con el resto de la aplicación:
- BASE CASE: Gris
- GROWTH: Verde
- MONETARY POLICY: Púrpura
- TRADE: Rosa
- INFLATION: Naranja
- VOLATILITY: Violeta
- FISCAL: Azul
- POLITICS: Rojo
- RECESSION: Rojo oscuro
- CHINA: Amarillo
- ESG: Esmeralda
- BREXIT: Índigo

## Estructura de Datos

### CSV Source
El CSV `tesis agregadas.csv` usa punto y coma (`;`) como delimitador y tiene las siguientes columnas:
- `Themes + Assets`: Tema principal
- `Rank`: Ranking de importancia
- `Year`: Año de la predicción
- `Consensus Thesis`: Tesis de consenso original
- `Tesis Ex Post`: Resultado real

### TypeScript Interface
```typescript
export interface TesisRecord {
  themesAssets: string;
  rank: number;
  year: number;
  consensusThesis: string;
  tesisExPost: string;
}
```

## Dependencias Agregadas
- `papaparse`: ^5.4.1 - Parser de CSV
- `@types/papaparse`: ^5.3.15 - Tipos de TypeScript

## Uso

### Acceder a la Página
Navega a `/tesis` o usa el sidebar para acceder a la nueva página "Tesis"

### API Endpoint
```typescript
// Fetch all tesis data
const response = await fetch('/api/tesis');
const data: TesisRecord[] = await response.json();
```

### Hook Usage
```typescript
import { useTesisData } from '@/lib/hooks/use-tesis-data';

function MyComponent() {
  const { data, loading, error, years, themes } = useTesisData();
  // Use the data...
}
```

## Screenshots
La página muestra:
1. Header con título "Tesis Agregadas" y descripción
2. Filtros de año en la parte superior
3. Cards expandibles para cada registro
4. Detalles completos al expandir (consenso vs realidad)

## Notas de Implementación
- La página sigue el mismo patrón de diseño que Historical
- Usa los mismos componentes UI (Card, Badge, Button, Skeleton)
- Responsive y con animaciones suaves
- Manejo apropiado de estados de carga y error
