import type { Component } from "./component";

export type SectionLayoutType =
  | "full-width"
  | "two-equal"
  | "three-equal"
  | "four-equal"
  | "sidebar-left"
  | "sidebar-right"
  | "two-one"
  | "one-two"
  | "hero"
  | "feature-grid";

export interface LayoutSection {
  id: string;
  layoutType: SectionLayoutType;
  columns: number;
  columnWidths?: string[]; // e.g., ['1fr', '2fr'] for sidebar layouts
  backgroundColor?: string;
  padding?: string;
  components: Component[];
  name?: string;
  minHeight?: string; // Minimum section height
}

export type SectionTemplate = {
  id: SectionLayoutType;
  name: string;
  description: string;
  preview: string;
  columns: number;
  columnWidths?: string[];
};
