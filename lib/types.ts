export interface CollectionItemData {
  id: string
  title: string
  subtitle?: string
  image?: string
  ctaText: string
  ctaUrl: string
  ctaBgColor?: string
  badge?: string
}

export interface CollectionComponentData {
  layout: 'horizontal' | 'vertical'
  sourceType: 'api' | 'manual'
  collectionId?: string
  collectionIds?: string[]
  collectionName?: string
  items: CollectionItemData[]
  gap?: string
  itemsPerRow?: number
  showHeader?: boolean
  headerTitle?: string
  headerCtaText?: string
  headerCtaUrl?: string
  itemCtaText?: string
  itemCtaBgColor?: string
}

export interface Component {
  id: string
  type: 'heading' | 'paragraph' | 'image' | 'button' | 'divider' | 'spacer' | 'card' | 'list' | 'collection'
  content: string
  styles: Record<string, string>
  props?: Record<string, unknown>
  imageId?: string
  width?: string
  height?: string
  formatting?: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    align?: 'left' | 'center' | 'right'
    fontSize?: string
  }
  collectionData?: CollectionComponentData
}

export type SectionLayoutType = 
  | 'full-width' 
  | 'two-equal' 
  | 'three-equal' 
  | 'four-equal'
  | 'sidebar-left' 
  | 'sidebar-right' 
  | 'two-one'
  | 'one-two'
  | 'hero'
  | 'feature-grid'

export interface LayoutSection {
  id: string
  layoutType: SectionLayoutType
  columns: number
  columnWidths?: string[] // e.g., ['1fr', '2fr'] for sidebar layouts
  backgroundColor?: string
  padding?: string
  components: Component[]
  name?: string
  minHeight?: string // Minimum section height
}

export interface Project {
  id: string
  name: string
  thumbnail?: string
  layout: LayoutSection[]
  createdAt: Date
  updatedAt: Date
  history: HistoryEntry[]
}

export interface HistoryEntry {
  id: string
  timestamp: Date
  action: string
  snapshot: LayoutSection[]
}

export type SectionTemplate = {
  id: SectionLayoutType
  name: string
  description: string
  preview: string
  columns: number
  columnWidths?: string[]
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'full-width',
    name: 'Full Width',
    description: 'Single column spanning full width',
    preview: '████████████',
    columns: 1,
    columnWidths: ['100%'],
  },
  {
    id: 'two-equal',
    name: '2 Equal Columns',
    description: 'Two columns of equal width',
    preview: '████  ████',
    columns: 2,
    columnWidths: ['50%', '50%'],
  },
  {
    id: 'three-equal',
    name: '3 Equal Columns',
    description: 'Three columns of equal width',
    preview: '███ ███ ███',
    columns: 3,
    columnWidths: ['33.33%', '33.33%', '33.34%'],
  },
  {
    id: 'four-equal',
    name: '4 Equal Columns',
    description: 'Four columns of equal width',
    preview: '██ ██ ██ ██',
    columns: 4,
    columnWidths: ['25%', '25%', '25%', '25%'],
  },
  {
    id: 'sidebar-left',
    name: 'Sidebar Left',
    description: 'Narrow left column with wide content',
    preview: '██  ████████',
    columns: 2,
    columnWidths: ['25%', '75%'],
  },
  {
    id: 'sidebar-right',
    name: 'Sidebar Right',
    description: 'Wide content with narrow right column',
    preview: '████████  ██',
    columns: 2,
    columnWidths: ['75%', '25%'],
  },
  {
    id: 'two-one',
    name: '2/3 + 1/3',
    description: 'Wide left, narrow right',
    preview: '██████  ████',
    columns: 2,
    columnWidths: ['66%', '34%'],
  },
  {
    id: 'one-two',
    name: '1/3 + 2/3',
    description: 'Narrow left, wide right',
    preview: '████  ██████',
    columns: 2,
    columnWidths: ['34%', '66%'],
  },
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Full-width hero with centered content',
    preview: '╔══════════╗',
    columns: 1,
    columnWidths: ['100%'],
  },
  {
    id: 'feature-grid',
    name: 'Feature Grid',
    description: 'Three-column feature showcase',
    preview: '▢ ▢ ▢',
    columns: 3,
    columnWidths: ['33.33%', '33.33%', '33.34%'],
  },
]

export const COMPONENT_TYPES = [
  { type: 'heading', label: 'Heading', icon: 'Type' },
  { type: 'paragraph', label: 'Paragraph', icon: 'AlignLeft' },
  { type: 'image', label: 'Image', icon: 'Image' },
  { type: 'button', label: 'Button', icon: 'Square' },
  { type: 'divider', label: 'Divider', icon: 'Minus' },
  { type: 'spacer', label: 'Spacer', icon: 'MoveVertical' },
  { type: 'card', label: 'Card', icon: 'CreditCard' },
  { type: 'list', label: 'List', icon: 'List' },
  { type: 'collection', label: 'Collection', icon: 'Grid2X2' },
] as const
