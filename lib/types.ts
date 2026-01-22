export interface Component {
  id: string;
  type:
    | "heading"
    | "paragraph"
    | "image"
    | "button"
    | "divider"
    | "spacer"
    | "card"
    | "list"
    | "layout";
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
}

export type SectionLayoutType = "full-width" | "two-equal" | "three-equal";

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

export type SectionTemplate = {
  id: SectionLayoutType;
  name: string;
  description: string;
  preview: string;
  columns: number;
  columnWidths?: string[];
};

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: "full-width",
    name: "Full Width",
    description: "Single column spanning full width",
    preview: "████████████",
    columns: 1,
    columnWidths: ["100%"],
  },
  {
    id: "two-equal",
    name: "2 Equal Columns",
    description: "Two columns of equal width",
    preview: "████  ████",
    columns: 2,
    columnWidths: ["50%", "50%"],
  },
  {
    id: "three-equal",
    name: "3 Equal Columns",
    description: "Three columns of equal width",
    preview: "███ ███ ███",
    columns: 3,
    columnWidths: ["33.33%", "33.33%", "33.34%"],
  },
];

export const COMPONENT_TYPES = [
  { type: "heading", label: "Heading", icon: "Type" },
  { type: "paragraph", label: "Paragraph", icon: "AlignLeft" },
  { type: "image", label: "Image", icon: "Image" },
  { type: "button", label: "Button", icon: "Square" },
  { type: "divider", label: "Divider", icon: "Minus" },
  { type: "spacer", label: "Spacer", icon: "MoveVertical" },
  { type: "card", label: "Card", icon: "CreditCard" },
  { type: "list", label: "List", icon: "List" },
] as const;
