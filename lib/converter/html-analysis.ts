import { TAG_TO_COMPONENT } from "./component-factory";
import { detectLayout } from "./layout-detector";

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
