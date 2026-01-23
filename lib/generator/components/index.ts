import type { Component } from "../../types";
import { getStyleAttr, generateBasicComponent } from "./basic";
import { generateFormComponent } from "./form";
import { generateNavigationComponent } from "./navigation";
import { generateMediaComponent } from "./media";
import { generateDataDisplayComponent } from "./data-display";
import { generateLayoutComponent } from "./layout";
import { generateCollectionComponent } from "./collection";

export function generateComponent(component: Component): string {
  // Try each generator until one returns a non-null result
  const generators = [
    () => generateBasicComponent(component),
    () => generateFormComponent(component),
    () => generateNavigationComponent(component),
    () => generateMediaComponent(component),
    () => generateDataDisplayComponent(component),
    () => generateLayoutComponent(component, generateComponent),
    () => generateCollectionComponent(component),
  ];

  for (const gen of generators) {
    const result = gen();
    if (result !== null) {
      return result;
    }
  }

  // Fallback for unknown component types
  const styleAttr = getStyleAttr(component);
  return `        <div class="component"${styleAttr}>${component.content}</div>`;
}
