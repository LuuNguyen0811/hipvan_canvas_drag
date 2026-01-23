import type { Component } from "../types";

// Get computed styles from element
export function getComputedStyles(element: Element): CSSStyleDeclaration | null {
  if (typeof window === "undefined") return null;
  try {
    return window.getComputedStyle(element);
  } catch {
    return null;
  }
}

// Extract text content from HTML element
export function getTextContent(element: Element): string {
  let text = "";
  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || "";
    }
  });
  return text.trim();
}

// Extract all text content including children
export function getAllTextContent(element: Element): string {
  return (element.textContent || "").trim();
}

// Parse inline styles from HTML element
export function parseStyles(element: Element): Record<string, string> {
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
export function parseFormatting(element: Element): Component["formatting"] {
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
