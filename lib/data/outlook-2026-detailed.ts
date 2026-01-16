
import { OutlookItem } from "@/types/outlook";
import enrichedData from "./outlook_2026_enriched.json";

// The enriched JSON is a direct array of items
export const OUTLOOK_2026_FULL = enrichedData as unknown as OutlookItem[];
