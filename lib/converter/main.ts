import type { Component, LayoutSection } from "../types";
import { resetIdCounter } from "./component-factory";
import { processElement, createSectionFromElement } from "./processor";

export function htmlToComponents(html: string): Component[] {
  if (typeof window === "undefined") return [];

  resetIdCounter();
  const container = document.createElement("div");
  container.innerHTML = html;
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
    document.body.removeChild(container);
  }

  return components;
}

export function htmlToSections(html: string): LayoutSection[] {
  if (typeof window === "undefined") return [];

  resetIdCounter();
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.visibility = "hidden";
  document.body.appendChild(container);

  const sections: LayoutSection[] = [];
  try {
    const structuralSelectors = "header, nav, main, section, article, aside, footer, [role='banner'], [role='main'], [role='contentinfo']";
    const structuralElements = container.querySelectorAll(`:scope > ${structuralSelectors.split(", ").join(", :scope > ")}`);

    if (structuralElements.length > 0) {
      structuralElements.forEach((element) => {
        const tagName = element.tagName.toLowerCase();
        const sectionName = tagName.charAt(0).toUpperCase() + tagName.slice(1);
        const section = createSectionFromElement(element, sectionName);
        if (section) sections.push(section);
      });
    }

    if (sections.length === 0) {
      const deepStructural = container.querySelectorAll(structuralSelectors);
      if (deepStructural.length > 0) {
        deepStructural.forEach((element) => {
          const tagName = element.tagName.toLowerCase();
          const sectionName = tagName.charAt(0).toUpperCase() + tagName.slice(1);
          const section = createSectionFromElement(element, sectionName);
          if (section) sections.push(section);
        });
      }
    }

    if (sections.length === 0) {
      const section = createSectionFromElement(container, "Content");
      if (section) sections.push(section);
    }
  } finally {
    document.body.removeChild(container);
  }

  return sections;
}
