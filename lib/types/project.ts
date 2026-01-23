import type { LayoutSection } from "./layout";

export interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  layout: LayoutSection[];
  createdAt: Date;
  updatedAt: Date;
  history: HistoryEntry[];
}

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  snapshot: LayoutSection[];
}
