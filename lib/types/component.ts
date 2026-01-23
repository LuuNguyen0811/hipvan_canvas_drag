import type { SectionLayoutType } from "./layout";

export interface CollectionItemData {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  ctaText: string;
  ctaUrl: string;
  ctaBgColor?: string;
  ctaTextColor?: string;
  itemBgColor?: string;
  badge?: string;
}

export interface CollectionComponentData {
  layout: "horizontal" | "vertical";
  sourceType: "api" | "manual";
  collectionId?: string;
  collectionIds?: string[];
  collectionName?: string;
  items: CollectionItemData[];
  gap?: string;
  itemsPerRow?: number;
  showHeader?: boolean;
  headerTitle?: string;
  headerAlignment?: "left" | "center" | "right";
  itemCtaText?: string;
  itemCtaBgColor?: string;
  itemCtaTextColor?: string;
  itemBgColor?: string;
}

// Component type union - all available component types
export type ComponentType =
  // Basic
  | "heading"
  | "paragraph"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "card"
  | "list"
  | "collection"
  | "layout"
  // Form Elements
  | "input"
  | "textareaField"
  | "select"
  | "checkbox"
  | "radio"
  | "form"
  // Navigation
  | "navbar"
  | "menu"
  | "breadcrumb"
  | "footer"
  | "link"
  // Media
  | "video"
  | "audio"
  | "embed"
  | "icon"
  // Data Display
  | "table"
  | "badge"
  | "avatar"
  | "progress"
  // Layout Advanced
  | "grid"
  | "flex"
  | "accordion"
  | "tabs";

export interface Component {
  id: string;
  type: ComponentType;
  content: string;
  styles: Record<string, string>;
  props?: Record<string, unknown>;
  imageId?: string; // Reference to image in IndexedDB
  width?: string; // Component width (e.g., '100%', '50%', '300px')
  height?: string; // Component height
  layoutType?: SectionLayoutType;
  columns?: number;
  columnWidths?: string[];
  children?: Component[];
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    align?: "left" | "center" | "right";
    fontSize?: string;
  };
  collectionData?: CollectionComponentData;
  // Form-specific props
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { label: string; value: string }[];
  // Link/button props
  href?: string;
  target?: "_blank" | "_self";
  variant?: "default" | "outline" | "ghost" | "link";
  // Media props
  src?: string;
  alt?: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  // Table props
  headers?: string[];
  rows?: string[][];
  // Accordion/Tabs props
  items?: { title: string; content: string }[];
  activeIndex?: number;
  // Progress props
  value?: number;
  max?: number;
  // Avatar props
  initials?: string;
  // Badge props
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}
