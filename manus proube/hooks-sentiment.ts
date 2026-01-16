/**
 * Hooks Personalizados para Análisis de Sentimiento
 * Copiar este archivo a: src/hooks/useSentiment.ts en tu proyecto
 */

import { useState, useEffect, useMemo } from 'react';
import { AssetsData, SentimentStats, SentimentType } from '@/types/sentiment';

/**
 * Hook para cargar datos de assets desde un archivo JSON
 * @param dataUrl - URL del archivo JSON con datos de assets
 * @returns Objeto con assets, loading, error
 */
export function useAssets(dataUrl: string = '/assets-data.json') {
  const [assets, setAssets] = useState<AssetsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch(dataUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAssets(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        setAssets({});
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [dataUrl]);

  return { assets, loading, error };
}

/**
 * Hook para calcular estadísticas de sentimiento
 * @param assets - Datos de assets
 * @returns Estadísticas de sentimiento
 */
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

/**
 * Hook para filtrar assets por sentimiento
 * @param assets - Datos de assets
 * @param sentiment - Sentimiento a filtrar
 * @returns Assets filtrados
 */
export function useFilteredAssets(
  assets: AssetsData,
  sentiment: 'All' | SentimentType = 'All'
) {
  return useMemo(() => {
    const values = Object.values(assets);

    if (sentiment === 'All') {
      return values;
    }

    return values.filter(asset => asset.sentiment === sentiment);
  }, [assets, sentiment]);
}

/**
 * Hook para gestionar el estado de filtro de sentimiento
 * @param initialSentiment - Sentimiento inicial
 * @returns Estado del filtro y función para cambiarlo
 */
export function useSentimentFilter(
  initialSentiment: 'All' | SentimentType = 'All'
) {
  const [selectedSentiment, setSelectedSentiment] = useState<'All' | SentimentType>(
    initialSentiment
  );

  const handleFilterChange = (sentiment: 'All' | SentimentType) => {
    setSelectedSentiment(sentiment);
  };

  return {
    selectedSentiment,
    handleFilterChange,
    setSelectedSentiment
  };
}

/**
 * Hook para gestionar el estado de expansión de cards
 * @returns Estado de expansión y funciones para manejarlo
 */
export function useCardExpansion() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const isExpanded = (cardId: string) => expandedCards.has(cardId);

  const expandAll = () => {
    // Implementar si es necesario
  };

  const collapseAll = () => {
    setExpandedCards(new Set());
  };

  return {
    expandedCards,
    toggleCard,
    isExpanded,
    expandAll,
    collapseAll
  };
}

/**
 * Hook para búsqueda de assets
 * @param assets - Datos de assets
 * @returns Función de búsqueda y assets filtrados
 */
export function useAssetSearch(assets: AssetsData) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = useMemo(() => {
    if (!searchTerm.trim()) {
      return Object.values(assets);
    }

    const term = searchTerm.toLowerCase();
    return Object.values(assets).filter(
      asset =>
        asset.theme.toLowerCase().includes(term) ||
        asset.description.toLowerCase().includes(term) ||
        asset.sub_themes.some(theme => theme.toLowerCase().includes(term))
    );
  }, [assets, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredAssets
  };
}

/**
 * Hook para ordenamiento de assets
 * @param assets - Array de assets
 * @returns Assets ordenados y función para cambiar orden
 */
export function useSortAssets(assets: any[]) {
  const [sortBy, setSortBy] = useState<'sentiment' | 'name' | 'calls'>('sentiment');

  const sortedAssets = useMemo(() => {
    const sorted = [...assets];

    switch (sortBy) {
      case 'sentiment':
        const sentimentOrder = { Bullish: 0, Neutral: 1, Bearish: 2 };
        sorted.sort((a, b) => sentimentOrder[a.sentiment] - sentimentOrder[b.sentiment]);
        break;

      case 'name':
        sorted.sort((a, b) => a.theme.localeCompare(b.theme));
        break;

      case 'calls':
        sorted.sort((a, b) => b.calls_count - a.calls_count);
        break;

      default:
        break;
    }

    return sorted;
  }, [assets, sortBy]);

  return {
    sortBy,
    setSortBy,
    sortedAssets
  };
}

/**
 * Hook para persistencia de preferencias en localStorage
 * @param key - Clave para localStorage
 * @param initialValue - Valor inicial
 * @returns Estado y función para actualizar
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
