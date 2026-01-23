import type { ComponentType } from "./component";

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

export const ALL_COMPONENT_TYPES: ComponentTypeDefinition[] = [
  ...BASIC_COMPONENTS,
  ...FORM_COMPONENTS,
  ...NAVIGATION_COMPONENTS,
  ...MEDIA_COMPONENTS,
  ...DATA_COMPONENTS,
  ...LAYOUT_COMPONENTS,
];

export const COMPONENT_TYPES = BASIC_COMPONENTS.map((c) => ({
  type: c.type,
  label: c.label,
  icon: c.icon,
}));
