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
    preview: "┌──────┐",
    columns: 1,
    columnWidths: ["100%"],
  },
  {
    id: "two-equal",
    name: "2 Equal Columns",
    description: "Two columns of equal width",
    preview: "┌──┐┌──┐",
    columns: 2,
    columnWidths: ["50%", "50%"],
  },
  {
    id: "three-equal",
    name: "3 Equal Columns",
    description: "Three columns of equal width",
    preview: "┌┐ ┌┐ ┌┐",
    columns: 3,
    columnWidths: ["33.33%", "33.33%", "33.34%"],
  },
  {
    id: "four-equal",
    name: "4 Equal Columns",
    description: "Four columns of equal width",
    preview: "┌┐┌┐┌┐┌┐",
    columns: 4,
    columnWidths: ["25%", "25%", "25%", "25%"],
  },
  {
    id: "sidebar-left",
    name: "Sidebar Left",
    description: "Narrow left column with wide content",
    preview: "┌┐┌───┐",
    columns: 2,
    columnWidths: ["25%", "75%"],
  },
  {
    id: "sidebar-right",
    name: "Sidebar Right",
    description: "Wide content with narrow right column",
    preview: "┌───┐┌┐",
    columns: 2,
    columnWidths: ["75%", "25%"],
  },
  {
    id: "two-one",
    name: "2/3 + 1/3",
    description: "Wide left, narrow right",
    preview: "┌───┐┌┐",
    columns: 2,
    columnWidths: ["66.66%", "33.34%"],
  },
  {
    id: "one-two",
    name: "1/3 + 2/3",
    description: "Narrow left, wide right",
    preview: "┌┐┌───┐",
    columns: 2,
    columnWidths: ["33.34%", "66.66%"],
  },
  {
    id: "hero",
    name: "Hero Section",
    description: "Full-width hero with centered content",
    preview: "┌──✧──┐",
    columns: 1,
    columnWidths: ["100%"],
  },
  {
    id: "feature-grid",
    name: "Feature Grid",
    description: "Three-column feature showcase",
    preview: "┌┐┌┐┌┐",
    columns: 3,
    columnWidths: ["33.33%", "33.33%", "33.34%"],
  },
];

// Component type definition for UI
export interface ComponentTypeDefinition {
  type: ComponentType;
  label: string;
  icon: string;
  category: ComponentCategory;
  description?: string;
}

export type ComponentCategory =
  | "basic"
  | "form"
  | "navigation"
  | "media"
  | "data"
  | "layout";

// Basic components (existing)
export const BASIC_COMPONENTS: ComponentTypeDefinition[] = [
  {
    type: "heading",
    label: "Heading",
    icon: "Type",
    category: "basic",
    description: "Add a title or heading",
  },
  {
    type: "paragraph",
    label: "Paragraph",
    icon: "AlignLeft",
    category: "basic",
    description: "Add text content",
  },
  {
    type: "image",
    label: "Image",
    icon: "Image",
    category: "basic",
    description: "Add an image",
  },
  {
    type: "button",
    label: "Button",
    icon: "Square",
    category: "basic",
    description: "Add a clickable button",
  },
  {
    type: "divider",
    label: "Divider",
    icon: "Minus",
    category: "basic",
    description: "Add a horizontal line",
  },
  {
    type: "spacer",
    label: "Spacer",
    icon: "MoveVertical",
    category: "basic",
    description: "Add vertical space",
  },
  {
    type: "card",
    label: "Card",
    icon: "CreditCard",
    category: "basic",
    description: "Add a card container",
  },
  {
    type: "list",
    label: "List",
    icon: "List",
    category: "basic",
    description: "Add a bullet list",
  },
  {
    type: "collection",
    label: "Collection",
    icon: "Grid2X2",
    category: "basic",
    description: "Add a product collection",
  },
];

// Form components
export const FORM_COMPONENTS: ComponentTypeDefinition[] = [
  {
    type: "input",
    label: "Input",
    icon: "FormInput",
    category: "form",
    description: "Text input field",
  },
  {
    type: "textareaField",
    label: "Textarea",
    icon: "AlignLeft",
    category: "form",
    description: "Multi-line text input",
  },
  {
    type: "select",
    label: "Select",
    icon: "ChevronDown",
    category: "form",
    description: "Dropdown selection",
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: "CheckSquare",
    category: "form",
    description: "Checkbox input",
  },
  {
    type: "radio",
    label: "Radio",
    icon: "Circle",
    category: "form",
    description: "Radio button group",
  },
  {
    type: "form",
    label: "Form",
    icon: "FileInput",
    category: "form",
    description: "Form container",
  },
];

// Navigation components
export const NAVIGATION_COMPONENTS: ComponentTypeDefinition[] = [
  {
    type: "navbar",
    label: "Navbar",
    icon: "Menu",
    category: "navigation",
    description: "Navigation bar",
  },
  {
    type: "menu",
    label: "Menu",
    icon: "MoreHorizontal",
    category: "navigation",
    description: "Menu list",
  },
  {
    type: "breadcrumb",
    label: "Breadcrumb",
    icon: "ChevronRight",
    category: "navigation",
    description: "Breadcrumb navigation",
  },
  {
    type: "footer",
    label: "Footer",
    icon: "PanelBottom",
    category: "navigation",
    description: "Page footer",
  },
  {
    type: "link",
    label: "Link",
    icon: "Link",
    category: "navigation",
    description: "Hyperlink",
  },
];

// Media components
export const MEDIA_COMPONENTS: ComponentTypeDefinition[] = [
  {
    type: "video",
    label: "Video",
    icon: "Video",
    category: "media",
    description: "Video player",
  },
  {
    type: "audio",
    label: "Audio",
    icon: "Music",
    category: "media",
    description: "Audio player",
  },
  {
    type: "embed",
    label: "Embed",
    icon: "Code",
    category: "media",
    description: "Embedded content",
  },
  {
    type: "icon",
    label: "Icon",
    icon: "Smile",
    category: "media",
    description: "Icon element",
  },
];

// Data display components
export const DATA_COMPONENTS: ComponentTypeDefinition[] = [
  {
    type: "table",
    label: "Table",
    icon: "Table",
    category: "data",
    description: "Data table",
  },
  {
    type: "badge",
    label: "Badge",
    icon: "Tag",
    category: "data",
    description: "Status badge",
  },
  {
    type: "avatar",
    label: "Avatar",
    icon: "User",
    category: "data",
    description: "User avatar",
  },
  {
    type: "progress",
    label: "Progress",
    icon: "BarChart",
    category: "data",
    description: "Progress bar",
  },
];

// Advanced layout components
export const LAYOUT_COMPONENTS: ComponentTypeDefinition[] = [
  {
    type: "grid",
    label: "Grid",
    icon: "Grid3x3",
    category: "layout",
    description: "Grid layout",
  },
  {
    type: "flex",
    label: "Flex",
    icon: "Columns",
    category: "layout",
    description: "Flex container",
  },
  {
    type: "accordion",
    label: "Accordion",
    icon: "PanelTopClose",
    category: "layout",
    description: "Collapsible sections",
  },
  {
    type: "tabs",
    label: "Tabs",
    icon: "LayoutPanelTop",
    category: "layout",
    description: "Tabbed content",
  },
];

// All components grouped by category
export const COMPONENT_CATEGORIES: {
  id: ComponentCategory;
  label: string;
  icon: string;
  components: ComponentTypeDefinition[];
}[] = [
  { id: "basic", label: "Basic", icon: "Shapes", components: BASIC_COMPONENTS },
  { id: "form", label: "Form", icon: "FormInput", components: FORM_COMPONENTS },
  {
    id: "navigation",
    label: "Navigation",
    icon: "Navigation",
    components: NAVIGATION_COMPONENTS,
  },
  { id: "media", label: "Media", icon: "Play", components: MEDIA_COMPONENTS },
  { id: "data", label: "Data", icon: "Database", components: DATA_COMPONENTS },
  {
    id: "layout",
    label: "Layout",
    icon: "Layout",
    components: LAYOUT_COMPONENTS,
  },
];

// All component types (flat array for backward compatibility)
export const ALL_COMPONENT_TYPES: ComponentTypeDefinition[] = [
  ...BASIC_COMPONENTS,
  ...FORM_COMPONENTS,
  ...NAVIGATION_COMPONENTS,
  ...MEDIA_COMPONENTS,
  ...DATA_COMPONENTS,
  ...LAYOUT_COMPONENTS,
];

// Legacy COMPONENT_TYPES for backward compatibility
export const COMPONENT_TYPES = BASIC_COMPONENTS.map((c) => ({
  type: c.type,
  label: c.label,
  icon: c.icon,
}));

// Default content for each component type
export const DEFAULT_COMPONENT_CONTENT: Record<ComponentType, string> = {
  // Basic
  heading: "Your Heading Here",
  paragraph: "This is a paragraph. Click to edit and add your own content.",
  image: "Image Placeholder",
  button: "Click Me",
  divider: "",
  spacer: "",
  card: "Card Title",
  list: "Item 1, Item 2, Item 3",
  collection: "",
  layout: "",
  // Form
  input: "",
  textareaField: "",
  select: "",
  checkbox: "Checkbox label",
  radio: "Radio option",
  form: "",
  // Navigation
  navbar: "Logo",
  menu: "Menu Item 1, Menu Item 2, Menu Item 3",
  breadcrumb: "Home, Products, Category",
  footer: "© 2024 Your Company",
  link: "Click here",
  // Media
  video: "",
  audio: "",
  embed: "",
  icon: "star",
  // Data
  table: "",
  badge: "Badge",
  avatar: "",
  progress: "",
  // Layout
  grid: "",
  flex: "",
  accordion: "",
  tabs: "",
};

// Default props for each component type
export const DEFAULT_COMPONENT_PROPS: Partial<Record<ComponentType, Partial<Component>>> = {
  input: {
    placeholder: "Enter text...",
    label: "Label",
  },
  textareaField: {
    placeholder: "Enter your message...",
    label: "Message",
  },
  select: {
    label: "Select an option",
    options: [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" },
      { label: "Option 3", value: "3" },
    ],
  },
  checkbox: {
    label: "I agree to the terms",
  },
  radio: {
    label: "Choose an option",
    options: [
      { label: "Option A", value: "a" },
      { label: "Option B", value: "b" },
    ],
  },
  video: {
    controls: true,
    src: "",
  },
  audio: {
    controls: true,
    src: "",
  },
  table: {
    headers: ["Column 1", "Column 2", "Column 3"],
    rows: [
      ["Row 1, Cell 1", "Row 1, Cell 2", "Row 1, Cell 3"],
      ["Row 2, Cell 1", "Row 2, Cell 2", "Row 2, Cell 3"],
    ],
  },
  progress: {
    value: 50,
    max: 100,
  },
  avatar: {
    initials: "AB",
  },
  accordion: {
    items: [
      { title: "Section 1", content: "Content for section 1" },
      { title: "Section 2", content: "Content for section 2" },
    ],
  },
  tabs: {
    items: [
      { title: "Tab 1", content: "Content for tab 1" },
      { title: "Tab 2", content: "Content for tab 2" },
    ],
  },
  link: {
    href: "#",
    target: "_self",
  },
  navbar: {
    items: [
      { title: "Home", content: "/" },
      { title: "About", content: "/about" },
      { title: "Contact", content: "/contact" },
    ],
  },
};
