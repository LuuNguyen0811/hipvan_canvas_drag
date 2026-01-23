/**
 * HTML to Components Converter
 * Converts HTML structure into the application's component tree
 * Preserves layout structures (flex, grid) for accurate representation
 */

import type { Component, ComponentType, LayoutSection, SectionLayoutType } from "./types";
import { DEFAULT_COMPONENT_CONTENT, DEFAULT_COMPONENT_PROPS } from "./types";

// Generate unique IDs
let idCounter = 0;
const generateId = () => `comp-${Date.now()}-${idCounter++}`;

// Reset ID counter (useful for testing)
export const resetIdCounter = () => {
  idCounter = 0;
};

// HTML tag to component type mapping
const TAG_TO_COMPONENT: Record<string, ComponentType> = {
  // Headings
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  // Text
  p: "paragraph",
  span: "paragraph",
  // Media
  img: "image",
  video: "video",
  audio: "audio",
  iframe: "embed",
  // Interactive
  button: "button",
  a: "link",
  // Lists
  ul: "list",
  ol: "list",
  // Tables
  table: "table",
  // Form elements
  input: "input",
  textarea: "textareaField",
  select: "select",
  form: "form",
  // Separators
  hr: "divider",
};

// Layout detection types
interface LayoutInfo {
  isFlexRow: boolean;
  isFlexColumn: boolean;
  isGrid: boolean;
  gridColumns: number;
  isInline: boolean;
  childCount: number;
}

// Get computed styles from element
function getComputedStyles(element: Element): CSSStyleDeclaration | null {
  if (typeof window === "undefined") return null;
  try {
    return window.getComputedStyle(element);
  } catch {
    return null;
  }
}

// Detect layout type from element
function detectLayout(element: Element): LayoutInfo {
  const computed = getComputedStyles(element);
  const inlineStyle = element.getAttribute("style") || "";
  const className = element.getAttribute("class") || "";

  const result: LayoutInfo = {
    isFlexRow: false,
    isFlexColumn: false,
    isGrid: false,
    gridColumns: 1,
    isInline: false,
    childCount: element.children.length,
  };

  if (!computed) {
    // Fallback: detect from class names
    if (className.includes("flex") && !className.includes("flex-col")) {
      result.isFlexRow = true;
    }
    if (className.includes("flex-col") || className.includes("flex-column")) {
      result.isFlexColumn = true;
    }
    if (className.includes("grid")) {
      result.isGrid = true;
      // Try to detect columns from class
      const colMatch = className.match(/grid-cols-(\d+)/);
      if (colMatch) {
        result.gridColumns = parseInt(colMatch[1], 10);
      }
    }
    if (className.includes("inline") || className.includes("row")) {
      result.isInline = true;
    }
    return result;
  }

  const display = computed.display;
  const flexDirection = computed.flexDirection;
  const gridTemplateColumns = computed.gridTemplateColumns;

  // Check for flex
  if (display === "flex" || display === "inline-flex" || inlineStyle.includes("display: flex") || inlineStyle.includes("display:flex")) {
    if (flexDirection === "row" || flexDirection === "row-reverse" || !flexDirection || flexDirection === "") {
      result.isFlexRow = true;
    } else {
      result.isFlexColumn = true;
    }
  }

  // Check for grid
  if (display === "grid" || display === "inline-grid" || inlineStyle.includes("display: grid") || inlineStyle.includes("display:grid")) {
    result.isGrid = true;
    // Count grid columns
    if (gridTemplateColumns && gridTemplateColumns !== "none") {
      const columns = gridTemplateColumns.split(" ").filter(c => c && c !== "0px");
      result.gridColumns = Math.max(columns.length, 1);
    }
  }

  // Check for inline elements
  if (display === "inline" || display === "inline-block" || display === "inline-flex") {
    result.isInline = true;
  }

  // Additional class-based detection for common frameworks (Tailwind, Bootstrap, etc.)
  if (className.includes("d-flex") || className.includes("flex-row")) {
    result.isFlexRow = true;
  }
  if (className.includes("flex-column") || className.includes("flex-col")) {
    result.isFlexColumn = true;
  }
  if (className.includes("row") && !className.includes("flex-row")) {
    result.isFlexRow = true;
  }
  if (className.includes("col-") || className.includes("column")) {
    // This is likely a column inside a row
  }

  return result;
}

// Extract text content from HTML element
function getTextContent(element: Element): string {
  let text = "";
  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || "";
    }
  });
  return text.trim();
}

// Extract all text content including children
function getAllTextContent(element: Element): string {
  return (element.textContent || "").trim();
}

// Parse inline styles from HTML element
function parseStyles(element: Element): Record<string, string> {
  const styles: Record<string, string> = {};
  const styleAttr = element.getAttribute("style");

  if (styleAttr) {
    styleAttr.split(";").forEach((rule) => {
      const [property, value] = rule.split(":").map((s) => s.trim());
      if (property && value) {
        const camelProperty = property.replace(/-([a-z])/g, (_, letter) =>
          letter.toUpperCase()
        );
        styles[camelProperty] = value;
      }
    });
  }

  return styles;
}

// Parse text formatting from element and styles
function parseFormatting(element: Element): Component["formatting"] {
  const styles = parseStyles(element);
  const computed = getComputedStyles(element);

  const formatting: Component["formatting"] = {};

  // Check bold
  const fontWeight = computed?.fontWeight || styles.fontWeight;
  if (
    element.tagName === "STRONG" ||
    element.tagName === "B" ||
    fontWeight === "bold" ||
    fontWeight === "700" ||
    (fontWeight && parseInt(fontWeight) >= 600)
  ) {
    formatting.bold = true;
  }

  // Check italic
  if (
    element.tagName === "EM" ||
    element.tagName === "I" ||
    computed?.fontStyle === "italic" ||
    styles.fontStyle === "italic"
  ) {
    formatting.italic = true;
  }

  // Check underline
  const textDecoration = computed?.textDecoration || styles.textDecoration;
  if (element.tagName === "U" || textDecoration?.includes("underline")) {
    formatting.underline = true;
  }

  // Check alignment
  const textAlign = computed?.textAlign || styles.textAlign;
  if (textAlign && ["left", "center", "right"].includes(textAlign)) {
    formatting.align = textAlign as "left" | "center" | "right";
  }

  // Check font size
  const fontSize = computed?.fontSize || styles.fontSize;
  if (fontSize) {
    formatting.fontSize = fontSize;
  }

  return formatting;
}

// Create a component from an element
function createComponent(type: ComponentType, element: Element): Component {
  const defaultProps = DEFAULT_COMPONENT_PROPS[type] || {};

  const component: Component = {
    id: generateId(),
    type,
    content: "",
    styles: parseStyles(element),
    formatting: parseFormatting(element),
    ...defaultProps,
  };

  // Type-specific content extraction
  switch (type) {
    case "heading":
    case "paragraph":
    case "button":
      component.content = getAllTextContent(element);
      break;

    case "image":
      component.src = element.getAttribute("src") || "";
      component.alt = element.getAttribute("alt") || "Image";
      // Don't set content for images - it causes duplicate fields
      component.content = "";
      break;

    case "video":
      component.src = element.getAttribute("src") || 
        element.querySelector("source")?.getAttribute("src") || "";
      component.poster = element.getAttribute("poster") || "";
      component.autoplay = element.hasAttribute("autoplay");
      component.controls = element.hasAttribute("controls");
      break;

    case "audio":
      component.src = element.getAttribute("src") ||
        element.querySelector("source")?.getAttribute("src") || "";
      component.controls = element.hasAttribute("controls");
      break;

    case "embed":
      component.src = element.getAttribute("src") || "";
      break;

    case "link":
      component.href = element.getAttribute("href") || "#";
      component.target = (element.getAttribute("target") || "_self") as "_blank" | "_self";
      component.content = getAllTextContent(element);
      break;

    case "list":
      const items = Array.from(element.querySelectorAll(":scope > li"))
        .map((li) => li.textContent?.trim())
        .filter(Boolean);
      component.content = items.join(", ");
      break;

    case "table":
      const headers = Array.from(element.querySelectorAll("th")).map(
        (th) => th.textContent?.trim() || ""
      );
      const rows = Array.from(element.querySelectorAll("tbody tr")).map((tr) =>
        Array.from(tr.querySelectorAll("td")).map(
          (td) => td.textContent?.trim() || ""
        )
      );
      component.headers = headers.length > 0 ? headers : undefined;
      component.rows = rows.length > 0 ? rows : undefined;
      break;

    case "input":
      component.placeholder = element.getAttribute("placeholder") || "";
      component.label = element.getAttribute("aria-label") || 
        element.closest("label")?.textContent?.trim() || "";
      component.required = element.hasAttribute("required");
      component.disabled = element.hasAttribute("disabled");
      break;

    case "textareaField":
      component.placeholder = element.getAttribute("placeholder") || "";
      component.label = element.getAttribute("aria-label") || "";
      break;

    case "select":
      const options = Array.from(element.querySelectorAll("option")).map(
        (opt) => ({
          label: opt.textContent?.trim() || "",
          value: opt.getAttribute("value") || "",
        })
      );
      component.options = options;
      break;

    default:
      component.content = getAllTextContent(element) || DEFAULT_COMPONENT_CONTENT[type] || "";
  }

  return component;
}

// Process element and its children recursively
function processElement(
  element: Element,
  depth: number = 0
): Component | Component[] | null {
  if (depth > 15) return null;

  const tagName = element.tagName.toLowerCase();

  // Skip non-visual elements
  const skipTags = ["script", "style", "link", "meta", "noscript", "svg", "path", "head", "title"];
  if (skipTags.includes(tagName)) return null;

  // Check if it has meaningful content
  const hasVisualChildren = element.children.length > 0;
  const hasText = getTextContent(element).length > 0;

  if (!hasVisualChildren && !hasText && !["img", "video", "audio", "input", "hr", "br"].includes(tagName)) {
    return null;
  }

  // Get layout info
  const layout = detectLayout(element);

  // Check if this is a direct component type
  const componentType = TAG_TO_COMPONENT[tagName];

  // If it's a layout container (flex row or grid with multiple children)
  if ((layout.isFlexRow || layout.isGrid) && element.children.length > 1) {
    // Create a layout component with children
    const columns = layout.isGrid ? layout.gridColumns : element.children.length;
    const layoutComponent: Component = {
      id: generateId(),
      type: "layout",
      content: "",
      styles: parseStyles(element),
      layoutType: columns === 2 ? "two-equal" : columns >= 3 ? "three-equal" : "full-width",
      columns: Math.min(columns, 3),
      columnWidths: Array(Math.min(columns, 3)).fill(`${100 / Math.min(columns, 3)}%`),
      children: [],
    };

    // Process children and assign to columns
    Array.from(element.children).forEach((child, index) => {
      const childComponents = processElement(child, depth + 1);
      if (childComponents) {
        const childArray = Array.isArray(childComponents) ? childComponents : [childComponents];
        childArray.forEach((comp) => {
          // Assign to column based on index
          const columnIndex = index % Math.min(columns, 3);
          comp.props = { ...comp.props, columnIndex, span: "column" };
          layoutComponent.children!.push(comp);
        });
      }
    });

    if (layoutComponent.children!.length > 0) {
      return layoutComponent;
    }
    return null;
  }

  // If it's a known component type, create it
  if (componentType && !["div", "section", "article", "main", "aside"].includes(tagName)) {
    return createComponent(componentType, element);
  }

  // For container elements, process children
  const containerTags = ["div", "section", "article", "main", "aside", "nav", "header", "footer", "form", "figure"];
  if (containerTags.includes(tagName)) {
    const childComponents: Component[] = [];

    // Check if container has a heading
    const heading = element.querySelector(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6");
    
    // Process children
    Array.from(element.children).forEach((child) => {
      const result = processElement(child, depth + 1);
      if (result) {
        if (Array.isArray(result)) {
          childComponents.push(...result);
        } else {
          childComponents.push(result);
        }
      }
    });

    // If container has direct text content, add it as paragraph
    const directText = getTextContent(element);
    if (directText && directText.length > 10) {
      childComponents.unshift({
        id: generateId(),
        type: "paragraph",
        content: directText,
        styles: {},
        formatting: parseFormatting(element),
      });
    }

    // Special handling for nav and header
    if (tagName === "nav" || tagName === "header") {
      const navLinks = Array.from(element.querySelectorAll("a")).map((a) => ({
        title: a.textContent?.trim() || "",
        content: a.getAttribute("href") || "#",
      }));
      if (navLinks.length > 0) {
        // Get logo/brand text from various common selectors
        const logoSelectors = ".logo, .brand, [class*='logo'], [class*='brand'], h1, h2, .navbar-brand";
        const logoText = element.querySelector(logoSelectors)?.textContent?.trim() || 
                        element.querySelector("*")?.textContent?.trim() || 
                        "Logo";
        return {
          id: generateId(),
          type: "navbar",
          content: logoText,
          styles: parseStyles(element),
          items: navLinks,
        };
      }
      
      // If no links but has heading content, extract it
      const heading = element.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading) {
        childComponents.unshift(createComponent("heading", heading));
      } else {
        // Get all text if no specific heading
        const headerText = getAllTextContent(element);
        if (headerText && headerText.length > 0) {
          childComponents.unshift({
            id: generateId(),
            type: "heading",
            content: headerText,
            styles: parseStyles(element),
            formatting: parseFormatting(element),
          });
        }
      }
    }

    // Special handling for footer
    if (tagName === "footer") {
      return {
        id: generateId(),
        type: "footer",
        content: getAllTextContent(element),
        styles: parseStyles(element),
      };
    }

    return childComponents.length > 0 ? childComponents : null;
  }

  // Default: try to create a component if it has text
  if (hasText) {
    return {
      id: generateId(),
      type: "paragraph",
      content: getAllTextContent(element),
      styles: parseStyles(element),
      formatting: parseFormatting(element),
    };
  }

  return null;
}

// Parse HTML string and convert to components
export function htmlToComponents(html: string): Component[] {
  if (typeof window === "undefined") {
    return [];
  }

  resetIdCounter();

  const container = document.createElement("div");
  container.innerHTML = html;

  // Append to body temporarily to get computed styles
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.visibility = "hidden";
  document.body.appendChild(container);

  const components: Component[] = [];

  try {
    Array.from(container.children).forEach((element) => {
      const result = processElement(element);
      if (result) {
        if (Array.isArray(result)) {
          components.push(...result);
        } else {
          components.push(result);
        }
      }
    });
  } finally {
    // Clean up
    document.body.removeChild(container);
  }

  return components;
}

// Process an element and create components with proper columnIndex
function processElementForSection(
  element: Element,
  columnIndex: number = 0,
  depth: number = 0
): Component[] {
  if (depth > 10) return [];

  const tagName = element.tagName.toLowerCase();
  const skipTags = ["script", "style", "link", "meta", "noscript", "head", "title"];
  if (skipTags.includes(tagName)) return [];

  const components: Component[] = [];
  const componentType = TAG_TO_COMPONENT[tagName];

  // Check if element has meaningful content
  const hasText = getTextContent(element).length > 0;
  const hasChildren = element.children.length > 0;

  // If it's a direct component type (not a container)
  if (componentType && !["div", "section", "article", "main", "aside"].includes(tagName)) {
    const comp = createComponent(componentType, element);
    comp.props = { ...comp.props, columnIndex, span: "column" };
    components.push(comp);
    return components; // Return immediately, don't process children
  }

  // For container elements, check layout and process children
  const layout = detectLayout(element);

  // If it's a horizontal layout with multiple children,
  // we should NOT process it here - return empty to let parent handle it properly
  if ((layout.isFlexRow || layout.isGrid) && element.children.length >= 2) {
    // This creates a horizontal layout that should be handled at section level
    // Don't process it here to avoid duplicates
    return components;
  }

  // For vertical containers, process children
  Array.from(element.children).forEach((child) => {
    const childComps = processElementForSection(child, columnIndex, depth + 1);
    components.push(...childComps);
  });

  // Add direct text content if any (not just when components.length === 0)
  const directText = getTextContent(element);
  if (directText && directText.length > 5) {
    // Check if we already have a component with this exact text
    const existingTextComp = components.find(c => c.content === directText);
    if (!existingTextComp) {
      components.push({
        id: generateId(),
        type: "paragraph",
        content: directText,
        styles: parseStyles(element),
        formatting: parseFormatting(element),
        props: { columnIndex },
      });
    }
  }

  // If still no components, try to get ALL text content
  if (components.length === 0) {
    const allText = getAllTextContent(element);
    if (allText && allText.length > 5) {
      components.push({
        id: generateId(),
        type: "paragraph",
        content: allText,
        styles: parseStyles(element),
        formatting: parseFormatting(element),
        props: { columnIndex },
      });
    }
  }

  return components;
}

// Create a section from an element, detecting horizontal layout
function createSectionFromElement(element: Element, sectionName: string): LayoutSection | null {
  const layout = detectLayout(element);
  const children = Array.from(element.children).filter((child) => {
    const tag = child.tagName.toLowerCase();
    return !["script", "style", "link", "meta", "noscript"].includes(tag);
  });

  let columns = 1;
  let layoutType: SectionLayoutType = "full-width";
  const components: Component[] = [];
  const processedElements = new Set<Element>(); // Track processed elements to avoid duplicates

  // Check if this element has horizontal layout
  if ((layout.isFlexRow || layout.isGrid) && children.length >= 2) {
    // Horizontal layout - distribute children to columns
    columns = Math.min(children.length, 3);
    layoutType = columns === 2 ? "two-equal" : columns === 3 ? "three-equal" : "full-width";

    children.forEach((child, index) => {
      if (processedElements.has(child)) return; // Skip if already processed
      processedElements.add(child);
      
      const columnIndex = index % columns;
      const childComponents = processElementForSection(child, columnIndex, 0);
      
      // If no components were extracted, create a placeholder
      if (childComponents.length === 0) {
        const text = getAllTextContent(child);
        if (text && text.length > 0) {
          childComponents.push({
            id: generateId(),
            type: "paragraph",
            content: text.substring(0, 200),
            styles: parseStyles(child),
            props: { columnIndex },
          });
        }
      }
      
      components.push(...childComponents);
    });
  } else {
    // Vertical layout - all components go to column 0
    // But check if any direct child has horizontal layout
    let hasHorizontalChild = false;

    children.forEach((child) => {
      if (processedElements.has(child)) return; // Skip if already processed
      
      const childLayout = detectLayout(child);
      const grandChildren = Array.from(child.children).filter((gc) => {
        const tag = gc.tagName.toLowerCase();
        return !["script", "style", "link", "meta", "noscript"].includes(tag);
      });

      if ((childLayout.isFlexRow || childLayout.isGrid) && grandChildren.length >= 2) {
        hasHorizontalChild = true;
        processedElements.add(child); // Mark as processed
        
        // This child has horizontal layout
        const childColumns = Math.min(grandChildren.length, 3);
        
        // Update section layout if this is the first horizontal child
        if (columns === 1) {
          columns = childColumns;
          layoutType = columns === 2 ? "two-equal" : columns === 3 ? "three-equal" : "full-width";
        }

        grandChildren.forEach((grandChild, gcIndex) => {
          if (processedElements.has(grandChild)) return; // Skip if already processed
          processedElements.add(grandChild);
          
          const columnIndex = gcIndex % columns;
          const gcComponents = processElementForSection(grandChild, columnIndex, 0);
          
          if (gcComponents.length === 0) {
            const text = getAllTextContent(grandChild);
            if (text && text.length > 0) {
              gcComponents.push({
                id: generateId(),
                type: "paragraph",
                content: text.substring(0, 200),
                styles: parseStyles(grandChild),
                props: { columnIndex },
              });
            }
          }
          
          components.push(...gcComponents);
        });
      } else {
        // Vertical child
        processedElements.add(child); // Mark as processed
        const childComponents = processElementForSection(child, 0, 0);
        components.push(...childComponents);
      }
    });
  }

  if (components.length === 0) {
    return null;
  }

  // Deduplicate components based on type and content/src
  const uniqueComponents: Component[] = [];
  const seen = new Set<string>();
  
  components.forEach((comp) => {
    // Create a unique key based on type and main content
    let key = `${comp.type}`;
    if (comp.type === "image" && comp.src) {
      key += `:${comp.src}`;
    } else if (comp.content) {
      key += `:${comp.content.substring(0, 50)}`; // First 50 chars
    }
    key += `:${comp.props?.columnIndex || 0}`; // Include column to allow same content in different columns
    
    if (!seen.has(key)) {
      seen.add(key);
      uniqueComponents.push(comp);
    }
  });

  return {
    id: generateId(),
    layoutType,
    columns,
    columnWidths: Array(columns).fill(`${(100 / columns).toFixed(2)}%`),
    components: uniqueComponents,
    name: sectionName,
  };
}

// Convert HTML to layout sections with proper structure
export function htmlToSections(html: string): LayoutSection[] {
  if (typeof window === "undefined") {
    return [];
  }

  resetIdCounter();

  const container = document.createElement("div");
  container.innerHTML = html;

  // Append to body temporarily to get computed styles
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.visibility = "hidden";
  document.body.appendChild(container);

  const sections: LayoutSection[] = [];

  try {
    // Find main structural elements
    const structuralSelectors = "header, nav, main, section, article, aside, footer, [role='banner'], [role='main'], [role='contentinfo']";
    const structuralElements = container.querySelectorAll(`:scope > ${structuralSelectors.split(", ").join(", :scope > ")}`);

    if (structuralElements.length > 0) {
      structuralElements.forEach((element) => {
        const tagName = element.tagName.toLowerCase();
        const sectionName = tagName.charAt(0).toUpperCase() + tagName.slice(1);
        const section = createSectionFromElement(element, sectionName);
        if (section) {
          sections.push(section);
        }
      });
    }

    // If no structural elements found at top level, try one level deeper
    if (sections.length === 0) {
      const deepStructural = container.querySelectorAll(structuralSelectors);
      if (deepStructural.length > 0) {
        deepStructural.forEach((element) => {
          const tagName = element.tagName.toLowerCase();
          const sectionName = tagName.charAt(0).toUpperCase() + tagName.slice(1);
          const section = createSectionFromElement(element, sectionName);
          if (section) {
            sections.push(section);
          }
        });
      }
    }

    // If still no sections, process the entire content
    if (sections.length === 0) {
      const section = createSectionFromElement(container, "Content");
      if (section) {
        sections.push(section);
      }
    }
  } finally {
    document.body.removeChild(container);
  }

  return sections;
}

// Analyze HTML structure and return summary
export interface HTMLAnalysis {
  totalElements: number;
  componentTypes: Record<string, number>;
  hasNavigation: boolean;
  hasHeader: boolean;
  hasFooter: boolean;
  hasForm: boolean;
  imageCount: number;
  linkCount: number;
  hasFlexLayouts: boolean;
  hasGridLayouts: boolean;
}

export function analyzeHTML(html: string): HTMLAnalysis {
  if (typeof window === "undefined") {
    return {
      totalElements: 0,
      componentTypes: {},
      hasNavigation: false,
      hasHeader: false,
      hasFooter: false,
      hasForm: false,
      imageCount: 0,
      linkCount: 0,
      hasFlexLayouts: false,
      hasGridLayouts: false,
    };
  }

  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.visibility = "hidden";
  document.body.appendChild(container);

  const componentTypes: Record<string, number> = {};
  let totalElements = 0;
  let hasFlexLayouts = false;
  let hasGridLayouts = false;

  try {
    container.querySelectorAll("*").forEach((element) => {
      const tagName = element.tagName.toLowerCase();
      const componentType = TAG_TO_COMPONENT[tagName];

      if (componentType) {
        componentTypes[componentType] = (componentTypes[componentType] || 0) + 1;
        totalElements++;
      }

      // Check for flex/grid
      const layout = detectLayout(element);
      if (layout.isFlexRow || layout.isFlexColumn) hasFlexLayouts = true;
      if (layout.isGrid) hasGridLayouts = true;
    });
  } finally {
    document.body.removeChild(container);
  }

  return {
    totalElements,
    componentTypes,
    hasNavigation: container.querySelector("nav") !== null,
    hasHeader: container.querySelector("header") !== null,
    hasFooter: container.querySelector("footer") !== null,
    hasForm: container.querySelector("form") !== null,
    imageCount: container.querySelectorAll("img").length,
    linkCount: container.querySelectorAll("a").length,
    hasFlexLayouts,
    hasGridLayouts,
  };
}

export default htmlToComponents;
