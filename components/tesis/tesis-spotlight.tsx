"use client"

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TesisRecord } from '@/app/api/tesis/route';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

interface TesisSpotlightProps {
  theme: string;
  year: number;
  data: TesisRecord[];
  onClose: () => void;
}

export function TesisSpotlight({ theme, year, data, onClose }: TesisSpotlightProps) {
  const themeData = useMemo(() => {
    return data.filter(record => record.themesAssets === theme);
  }, [theme, data]);

  const yearData = useMemo(() => {
    return data.find(record => record.themesAssets === theme && record.year === year);
  }, [theme, year, data]);

  if (!yearData) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{theme}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-muted-foreground text-center">No hay datos disponibles para el año {year}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold">{theme}</h3>
          <Badge variant="outline">Año: {yearData.year}</Badge>
          <Badge variant="outline">Rango: #{yearData.rank}</Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-muted/30">
          <div className="text-sm text-muted-foreground mb-1">Año</div>
          <div className="text-2xl font-bold">{yearData.year}</div>
        </Card>
        <Card className="p-4 bg-muted/30">
          <div className="text-sm text-muted-foreground mb-1">Rango</div>
          <div className="text-2xl font-bold">#{yearData.rank}</div>
        </Card>
        <Card className="p-4 bg-muted/30">
          <div className="text-sm text-muted-foreground mb-1">Apariciones Totales</div>
          <div className="text-2xl font-bold">{themeData.length}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Tesis Consenso
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {yearData.consensusThesis || 'No disponible'}
          </p>
        </Card>

        <Card className="p-5 border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-purple-500" />
            Resultado Ex-Post
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {yearData.tesisExPost || 'No disponible'}
          </p>
        </Card>
      </div>
    </Card>
  );
}
