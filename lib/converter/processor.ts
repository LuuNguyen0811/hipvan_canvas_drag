import type { Component, LayoutSection, SectionLayoutType } from "../types";
import { TAG_TO_COMPONENT, createComponent, generateId } from "./component-factory";
import { detectLayout } from "./layout-detector";
import { getTextContent, getAllTextContent, parseStyles, parseFormatting } from "./utils";

// Process element and its children recursively
export function processElement(
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
        const logoSelectors = ".logo, .brand, [class*='logo'], [class*='brand'], h1, h2, .navbar-brand";
        const logoText = element.querySelector(logoSelectors)?.textContent?.trim() || 
                        element.querySelector("*")?.textContent?.trim() || 
                        "Logo";
        return {
          id: generateId(),
          type: "navbar",
          content: logoText,
          styles: parseStyles(element),
          props: { items: navLinks },
        } as Component;
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

// Process an element and create components with proper columnIndex
export function processElementForSection(
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

  // If it's a direct component type (not a container)
  if (componentType && !["div", "section", "article", "main", "aside"].includes(tagName)) {
    const comp = createComponent(componentType, element);
    comp.props = { ...comp.props, columnIndex, span: "column" };
    components.push(comp);
    return components;
  }

  // For container elements, check layout and process children
  const layout = detectLayout(element);

  // If it's a horizontal layout with multiple children, handle at section level
  if ((layout.isFlexRow || layout.isGrid) && element.children.length >= 2) {
    return components;
  }

  // For vertical containers, process children
  Array.from(element.children).forEach((child) => {
    const childComps = processElementForSection(child, columnIndex, depth + 1);
    components.push(...childComps);
  });

  const directText = getTextContent(element);
  if (directText && directText.length > 5) {
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

  return components;
}

// Create a section from an element, detecting horizontal layout
export function createSectionFromElement(element: Element, sectionName: string): LayoutSection | null {
  const layout = detectLayout(element);
  const children = Array.from(element.children).filter((child) => {
    const tag = child.tagName.toLowerCase();
    return !["script", "style", "link", "meta", "noscript"].includes(tag);
  });

  let columns = 1;
  let layoutType: SectionLayoutType = "full-width";
  const components: Component[] = [];
  const processedElements = new Set<Element>();

  if ((layout.isFlexRow || layout.isGrid) && children.length >= 2) {
    columns = Math.min(children.length, 3);
    layoutType = columns === 2 ? "two-equal" : columns === 3 ? "three-equal" : "full-width";

    children.forEach((child, index) => {
      if (processedElements.has(child)) return;
      processedElements.add(child);
      const columnIndex = index % columns;
      const childComponents = processElementForSection(child, columnIndex, 0);
      components.push(...childComponents);
    });
  } else {
    children.forEach((child) => {
      if (processedElements.has(child)) return;
      const childLayout = detectLayout(child);
      const grandChildren = Array.from(child.children).filter((gc) => {
        const tag = gc.tagName.toLowerCase();
        return !["script", "style", "link", "meta", "noscript"].includes(tag);
      });

      if ((childLayout.isFlexRow || childLayout.isGrid) && grandChildren.length >= 2) {
        processedElements.add(child);
        const childColumns = Math.min(grandChildren.length, 3);
        if (columns === 1) {
          columns = childColumns;
          layoutType = columns === 2 ? "two-equal" : columns === 3 ? "three-equal" : "full-width";
        }
        grandChildren.forEach((grandChild, gcIndex) => {
          if (processedElements.has(grandChild)) return;
          processedElements.add(grandChild);
          const columnIndex = gcIndex % columns;
          const gcComponents = processElementForSection(grandChild, columnIndex, 0);
          components.push(...gcComponents);
        });
      } else {
        processedElements.add(child);
        const childComponents = processElementForSection(child, 0, 0);
        components.push(...childComponents);
      }
    });
  }

  if (components.length === 0) return null;

  // Deduplicate
  const uniqueComponents: Component[] = [];
  const seen = new Set<string>();
  components.forEach((comp) => {
    let key = `${comp.type}:${comp.content.substring(0, 50)}:${comp.props?.columnIndex || 0}`;
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
