import type { Component } from "./types";

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const findComponentInTree = (
  components: Component[],
  componentId: string,
): Component | null => {
  for (const component of components) {
    if (component.id === componentId) return component;
    if (
      component.type === "layout" &&
      component.children &&
      component.children.length > 0
    ) {
      const found = findComponentInTree(component.children, componentId);
      if (found) return found;
    }
  }
  return null;
};

export const collectImageComponentsInTree = (components: Component[]): Component[] => {
  const out: Component[] = [];
  for (const component of components) {
    if (component.type === "image" && component.imageId) out.push(component);
    if (
      component.type === "layout" &&
      component.children &&
      component.children.length > 0
    ) {
      out.push(...collectImageComponentsInTree(component.children));
    }
  }
  return out;
};
