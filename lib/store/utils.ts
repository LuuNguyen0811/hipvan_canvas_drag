import type { Component } from "../types";

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

export const collectImageIdsInTree = (components: Component[]): string[] => {
  const ids: string[] = [];
  for (const component of components) {
    if (component.type === "image" && component.imageId)
      ids.push(component.imageId);
    if (
      component.type === "layout" &&
      component.children &&
      component.children.length > 0
    ) {
      ids.push(...collectImageIdsInTree(component.children));
    }
  }
  return ids;
};

export const updateComponentInTree = (
  components: Component[],
  componentId: string,
  updates: Partial<Component>,
): Component[] => {
  return components.map((component) => {
    if (component.id === componentId) return { ...component, ...updates };
    if (
      component.type === "layout" &&
      component.children &&
      component.children.length > 0
    ) {
      return {
        ...component,
        children: updateComponentInTree(
          component.children,
          componentId,
          updates,
        ),
      };
    }
    return component;
  });
};

export const addComponentToLayoutInTree = (
  components: Component[],
  layoutComponentId: string,
  newChild: Component,
  insertIndex?: number,
): Component[] => {
  return components.map((component) => {
    if (component.id === layoutComponentId && component.type === "layout") {
      const nextChildren = [...(component.children || [])];
      const idx =
        insertIndex === undefined
          ? nextChildren.length
          : Math.max(0, Math.min(insertIndex, nextChildren.length));
      nextChildren.splice(idx, 0, newChild);
      const children = nextChildren;
      return { ...component, children };
    }
    if (
      component.type === "layout" &&
      component.children &&
      component.children.length > 0
    ) {
      return {
        ...component,
        children: addComponentToLayoutInTree(
          component.children,
          layoutComponentId,
          newChild,
          insertIndex,
        ),
      };
    }
    return component;
  });
};

export const removeComponentFromTree = (
  components: Component[],
  componentId: string,
): { components: Component[]; removed: Component | null } => {
  let removed: Component | null = null;
  const next: Component[] = [];

  for (const component of components) {
    if (component.id === componentId) {
      removed = component;
      continue;
    }
    if (
      component.type === "layout" &&
      component.children &&
      component.children.length > 0
    ) {
      const res = removeComponentFromTree(component.children, componentId);
      if (res.removed) removed = res.removed;
      next.push({ ...component, children: res.components });
      continue;
    }
    next.push(component);
  }

  return { components: next, removed };
};
