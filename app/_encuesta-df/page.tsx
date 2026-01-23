/**
 * Página de Encuesta (Survey)
 * 
 * Esta página muestra los resultados de una encuesta realizada a instituciones financieras
 * sobre sus perspectivas para 2026. Los datos se obtienen del archivo survey-data.json
 * y se visualizan mediante gráficos de pastel (pie charts) y estadísticas.
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart as PieChartIcon, MessageSquare, Building2, Info } from 'lucide-react';

/**
 * Interfaz que define la estructura de una respuesta individual de una institución
 * @property institution - Nombre de la institución financiera
 * @property answer - Respuesta proporcionada por la institución
 */
interface SurveyResponse {
  institution: string;
  answer: string;
}

/**
 * Interfaz que define la estructura de datos para cada pregunta de la encuesta
 * @property id - Identificador único de la pregunta
 * @property question - Texto de la pregunta
 * @property stats - Objeto con el conteo de respuestas por categoría
 * @property responses - Array de respuestas individuales de cada institución
 */
interface QuestionData {
  id: number;
  question: string;
  stats: Record<string, number>;
  responses: SurveyResponse[];
}

/**
 * Paleta de colores predeterminada para los gráficos de pastel
 * Se utiliza cuando no hay un color semántico específico asignado a una respuesta
 */
const COLORS = [
  '#0ea5e9', // sky-500
  '#22c55e', // green-500
  '#ef4444', // red-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#64748b', // slate-500
  '#ec4899', // pink-500
];

/**
 * Mapeo de colores semánticos para respuestas específicas
 * 
 * Utiliza un sistema de colores intuitivo:
 * - Verde (#22c55e): Respuestas positivas/alcistas (Increase, Yes, Overweight, etc.)
 * - Rojo (#ef4444): Respuestas negativas/bajistas (Decrease, No, Underweight, etc.)
 * - Gris (#64748b): Respuestas neutrales (Remain the same, Neutral)
 * 
 * Incluye tanto versiones en inglés como en español (legacy) para compatibilidad
 */
const ANSWER_COLORS: Record<string, string> = {
  // English Mappings
  'Increase': '#22c55e',
  'Decrease': '#ef4444',
  'Remain the same': '#64748b',
  'Yes': '#22c55e',
  'No': '#ef4444',
  'Overweight': '#22c55e',
  'Underweight': '#ef4444',
  'Neutral': '#64748b',
  'Risk-on': '#22c55e',
  'Risk-off': '#ef4444',
  'Tighten': '#22c55e',
  'Widen': '#ef4444',
  'Appreciate': '#22c55e',
  'Depreciate': '#ef4444',

  // Legacy Spanish (Just in case)
  'Aumentará': '#22c55e',
  'Aumentarán': '#22c55e',
  'Disminuirá': '#ef4444',
  'Bajará': '#ef4444',
  'Bajarán': '#ef4444',
  'Se mantendrá': '#64748b',
  'Se mantendrán': '#64748b',
  'Sí': '#22c55e',
  'OW': '#22c55e',
  'UW': '#ef4444',
  'Se estrecharán': '#22c55e',
  'Se ampliarán': '#ef4444',
  'Se apreciará': '#22c55e',
  'Se depreciará': '#ef4444',
};

/**
 * Ranking de instituciones financieras basado en el Global Ranking 2025
 * 
 * Este objeto define el orden de prioridad de las instituciones para:
 * 1. Ordenar las respuestas en tooltips y vistas detalladas
 * 2. Destacar visualmente las instituciones top 5 con estilos especiales
 * 
 * Las instituciones están ordenadas según su desempeño en el análisis Ex-Post 2025
 * Un número menor indica mejor ranking (1 = mejor, 18 = último)
 */
const FIRM_RANKING: Record<string, number> = {
  "Goldman Sachs": 1,
  "BlackRock": 2,
  "HSBC": 3,
  "JP Morgan": 4,
  "Morgan Stanley": 5,
  "UBS": 6,
  "BNP Paribas": 7,
  "Capital Economics": 8,
  "Invesco": 9,
  "NatWest": 10,
  "Robeco": 11,
  "State Street": 12,
  "Amundi": 13,
  "Deutsche Bank": 14,
  "Fidelity": 15,
  "ABN AMRO": 16,
  "Barclays": 17,
  "T. Rowe Price": 18
};

/**
 * Componente CustomTooltip
 * 
 * Tooltip personalizado para los gráficos de pastel que muestra:
 * 1. El nombre de la respuesta y su conteo
 * 2. Lista de instituciones que dieron esa respuesta
 * 
 * Características especiales:
 * - Las instituciones se ordenan según FIRM_RANKING (mejores primero)
 * - Las instituciones top 5 se destacan visualmente con estilos especiales
 * - Muestra el número de ranking junto al nombre de cada institución
 * 
 * @param active - Indica si el tooltip está activo (hover sobre el gráfico)
 * @param payload - Datos del segmento del gráfico sobre el que se hace hover
 * @param label - Etiqueta del segmento (no utilizado en este caso)
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    // Ordenar las instituciones según el ranking global (mejores primero)
    const sortedFirms = [...data.firms].sort((a: string, b: string) => {
      const rankA = FIRM_RANKING[a] || 999; // 999 para instituciones sin ranking
      const rankB = FIRM_RANKING[b] || 999;
      return rankA - rankB;
    });

    return (
      <div className="bg-popover border text-popover-foreground shadow-md rounded-lg p-3 max-w-[300px] pointer-events-none z-50">
        {/* Encabezado: muestra el color, nombre de la respuesta y conteo */}
        <div className="font-semibold mb-2 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill }}></span>
          {data.name}: {data.value}
        </div>
        {/* Lista de instituciones que dieron esta respuesta */}
        <div className="flex flex-wrap gap-1">
          {sortedFirms.map((firm: string, idx: number) => {
            const rank = FIRM_RANKING[firm];
            const isTop = rank && rank <= 5; // Destacar las top 5
            return (
              <span
                key={idx}
                className={`text-[10px] px-1.5 py-0.5 rounded border ${isTop ? 'bg-primary/10 border-primary/20 text-primary font-medium' : 'bg-muted text-muted-foreground'}`}
              >
                {rank ? `#${rank} ` : ''}{firm}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Componente principal de la página de Encuesta
 * 
 * Este componente:
 * 1. Carga los datos de la encuesta desde /data/survey-data.json
 * 2. Gestiona el estado de carga y los datos
 * 3. Renderiza las estadísticas globales y las preguntas individuales
 * 
 * Maneja dos tipos de preguntas:
 * - Pregunta 19: Pregunta abierta que muestra respuestas textuales individuales
 * - Otras preguntas: Preguntas cerradas que se visualizan con gráficos de pastel
 */
export default function EncuestaDFPage() {
  // Estado para almacenar los datos de la encuesta
  const [data, setData] = useState<QuestionData[]>([]);
  // Estado para controlar el indicador de carga
  const [loading, setLoading] = useState(true);

  /**
   * Efecto que se ejecuta al montar el componente
   * Carga los datos de la encuesta desde el archivo JSON
   */
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/data/survey-data.json');
        if (!res.ok) throw new Error('Failed to load data');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Mostrar skeleton mientras se cargan los datos
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Survey</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Renderizar la página principal con los datos cargados
  return (
    <div className="container mx-auto py-8 max-w-[1600px]">
      <div className="flex flex-col gap-6 mb-8">

        {/* Encabezado de la página con título y descripción */}
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-primary/10 via-background to-background p-6 md:p-8 shadow-sm">
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2.5 rounded-lg text-primary">
                <PieChartIcon className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-foreground">
                Survey
              </h1>
            </div>
            <p className="text-lg text-muted-foreground ml-[3.25rem] max-w-2xl">
              Institutional responses and consensus distribution by question
            </p>
          </div>
          {/* Elemento decorativo de fondo */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-primary/5 blur-3xl"></div>
        </div>

        {/* Estadísticas globales: número de instituciones y preguntas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                {/* Conteo de instituciones participantes */}
                <div className="text-2xl font-bold">{data.length > 0 ? data[0].responses.length : 0}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Institutions</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                {/* Conteo total de preguntas en la encuesta */}
                <div className="text-2xl font-bold">{data.length}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Questions</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grid de preguntas - 2 columnas en pantallas grandes */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {data.map((q) => {
          /**
           * Caso especial: Pregunta 19 (pregunta abierta)
           * Se renderiza de forma diferente mostrando las respuestas textuales
           * de cada institución en lugar de un gráfico de pastel
           */
          if (q.id === 19) {
            // Ordenar respuestas por ranking de instituciones
            const sortedResponses = [...q.responses].sort((a, b) => {
              const rankA = FIRM_RANKING[a.institution] || 999;
              const rankB = FIRM_RANKING[b.institution] || 999;
              return rankA - rankB;
            });

            return (
              <Card key={q.id} className="flex flex-col overflow-hidden border-t-4 border-t-primary/20 xl:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="py-6 px-6 bg-gradient-to-r from-muted/50 to-background border-b">
                  <div className="flex flex-col gap-3">
                    <Badge variant="outline" className="w-fit bg-primary/10 text-primary border-primary/20 px-3 py-1 font-semibold">
                      Question {q.id} (Open Ended)
                    </Badge>
                    <CardTitle className="text-2xl font-bold leading-tight text-primary/90">
                      {q.question}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                  {/* Grid de respuestas individuales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedResponses.map((resp, idx) => (
                      <div key={idx} className="flex flex-col gap-2 p-4 rounded-lg border bg-card hover:bg-muted/20 transition-colors">
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="font-bold text-sm text-primary">
                            {/* Mostrar ranking si está disponible */}
                            {FIRM_RANKING[resp.institution] ? `#${FIRM_RANKING[resp.institution]} ` : ''}
                            {resp.institution}
                          </span>
                        </div>
                        {/* Respuesta textual de la institución */}
                        <p className="text-sm text-muted-foreground leading-snug">
                          {resp.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          }

          /**
           * Caso general: Preguntas cerradas con opciones múltiples
           * Se visualizan mediante gráficos de pastel (donut charts)
           */

          // Preparar datos para el gráfico de pastel
          const chartData = Object.entries(q.stats).map(([name, value]) => ({
            name,        // Nombre de la opción de respuesta
            value,       // Número de instituciones que eligieron esta opción
            firms: q.responses.filter(r => r.answer === name).map(r => r.institution) // Lista de instituciones
          }));
          const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

          return (
            <Card key={q.id} className="flex flex-col overflow-hidden border-t-4 border-t-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="py-6 px-6 bg-gradient-to-r from-muted/50 to-background border-b min-h-[140px] flex flex-col justify-center">
                <div className="flex flex-col gap-3">
                  <Badge variant="outline" className="w-fit bg-primary/10 text-primary border-primary/20 px-3 py-1 font-semibold">
                    Question {q.id}
                  </Badge>
                  <CardTitle className="text-xl font-bold leading-tight text-foreground/90">
                    {q.question}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6">
                <div className="h-full min-h-[300px] relative">
                  {/* Gráfico de pastel responsivo */}
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}   // Radio interno para crear efecto donut
                        outerRadius={100}  // Radio externo del gráfico
                        paddingAngle={2}   // Separación entre segmentos
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => {
                          // Intentar usar colores semánticos primero, luego usar paleta predeterminada
                          const color = ANSWER_COLORS[entry.name] || COLORS[index % COLORS.length];
                          return <Cell key={`cell-${index}`} fill={color} strokeWidth={1} />;
                        })}
                      </Pie>
                      {/* Tooltip personalizado que muestra instituciones */}
                      <Tooltip content={<CustomTooltip />} />
                      {/* Leyenda en la parte inferior */}
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Centro del donut (vacío para diseño limpio) */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8 text-center px-8">
                    {/* Empty center for cleaner look since total is global now */}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Nota metodológica al final de la página */}
      <div className="mt-12">
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-6 flex gap-4">
            <div className="mt-1">
              <Info className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Methodology Note</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This survey analysis was conducted by consulting the 2026 Outlook reports available on our internal SharePoint.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
