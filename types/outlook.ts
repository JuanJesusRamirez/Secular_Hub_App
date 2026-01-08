import { OutlookCall, Prisma } from '@prisma/client';

export type { OutlookCall };
export type { Prisma };

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  filters_applied?: Record<string, any>;
}

export interface StatsResponse {
  total_records: number;
  years: { year: number; count: number }[];
  themes: { theme: string; count: number }[];
  institutions: { institution: string; count: number }[];
}

export interface CompareResponse {
  year1: number;
  year2: number;
  themes_emerged: string[];
  themes_extinct: string[];
  themes_grew: { theme: string; delta: number }[];
  themes_declined: { theme: string; delta: number }[];
  institutional_changes: { institution: string; year1_themes: string[]; year2_themes: string[] }[];
}
