/**
 * ThesisCard Component
 * Design System: Minimalismo Institucional Moderno
 * - Card con línea de acento izquierda
 * - Diseño limpio y minimalista
 * - Transiciones suaves en hover
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ThesisCardProps {
  rank: number;
  theme: string;
  thesis: string;
}

export default function ThesisCard({ rank, theme, thesis }: ThesisCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Truncar texto para vista colapsada
  const truncatedThesis = thesis.length > 200 ? thesis.substring(0, 200) + '...' : thesis;

  return (
    <div className="border border-border rounded transition-all duration-300 hover:shadow-md overflow-hidden">
      <div className="flex">
        {/* Línea de acento izquierda */}
        <div className="w-1 bg-primary flex-shrink-0" />
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 p-6 text-left hover:bg-secondary/50 transition-colors duration-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-lg font-semibold text-primary">
                  {String(rank).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  {theme}
                </h3>
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isExpanded ? thesis : truncatedThesis}
              </p>
            </div>
            
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>
      </div>
    </div>
  );
}
