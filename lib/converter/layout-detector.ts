import { getComputedStyles } from "./utils";

export interface LayoutInfo {
  isFlexRow: boolean;
  isFlexColumn: boolean;
  isGrid: boolean;
  gridColumns: number;
  isInline: boolean;
  childCount: number;
}

// Detect layout type from element
export function detectLayout(element: Element): LayoutInfo {
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

  return result;
}
