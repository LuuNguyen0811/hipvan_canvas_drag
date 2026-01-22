"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Project,
  LayoutSection,
  Component,
  HistoryEntry,
  SectionLayoutType,
  SectionTemplate,
} from "./types";
import { deleteImage } from "./image-storage";

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;

  editorTarget: { sectionId: string; componentId: string } | null;
  setEditorTarget: (target: { sectionId: string; componentId: string }) => void;
  clearEditorTarget: () => void;

  // Project actions
  createProject: (name: string) => string;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  setCurrentProject: (id: string) => void;
  updateProjectName: (id: string, name: string) => void;

  // Layout actions
  setLayout: (sections: LayoutSection[]) => void;

  // Section actions
  addSection: (
    layoutType: SectionLayoutType,
    template: SectionTemplate,
    insertIndex?: number,
  ) => void;
  updateSection: (
    sectionId: string,
    updates: Partial<LayoutSection>,
    skipHistory?: boolean,
  ) => void;
  removeSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  moveSectionUp: (sectionId: string) => void;
  moveSectionDown: (sectionId: string) => void;

  // Component actions
  addComponent: (
    sectionId: string,
    component: Component,
    insertIndex?: number,
  ) => void;
  addComponentToLayout: (
    sectionId: string,
    layoutComponentId: string,
    component: Component,
    insertIndex?: number,
  ) => void;
  addComponentToColumn: (
    sectionId: string,
    columnIndex: number,
    component: Component,
  ) => void;
  updateComponent: (
    sectionId: string,
    componentId: string,
    updates: Partial<Component>,
    skipHistory?: boolean,
  ) => void;
  removeComponent: (sectionId: string, componentId: string) => void;
  moveComponent: (
    fromSectionId: string,
    toSectionId: string,
    componentId: string,
    newIndex: number,
    options?: {
      targetColumnIndex?: number;
      targetSpan?: "full" | "column";
      fromLayoutId?: string | null;
      toLayoutId?: string | null;
    },
  ) => void;

  // History actions
  saveToHistory: (action: string) => void;
  restoreFromHistory: (historyId: string) => void;
  clearHistory: () => void;

  // Save project
  saveProject: () => void;
}

// Throttle helper to prevent too many saves
let lastHistorySave = 0;
const HISTORY_THROTTLE_MS = 1000; // Only save history once per second max

const generateId = () => Math.random().toString(36).substring(2, 9);

const findComponentInTree = (
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

const collectImageIdsInTree = (components: Component[]): string[] => {
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

const updateComponentInTree = (
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

const addComponentToLayoutInTree = (
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

const removeComponentFromTree = (
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

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,

      editorTarget: null,
      setEditorTarget: (target) => set({ editorTarget: target }),
      clearEditorTarget: () => set({ editorTarget: null }),

      createProject: (name: string) => {
        const id = generateId();
        const defaultSection: LayoutSection = {
          id: generateId(),
          layoutType: "full-width",
          columns: 1,
          columnWidths: ["100%"],
          components: [],
          name: "Full Width",
        };
        const newProject: Project = {
          id,
          name,
          layout: [defaultSection],
          createdAt: new Date(),
          updatedAt: new Date(),
          history: [],
        };
        set((state) => ({
          projects: [newProject, ...state.projects],
          currentProject: newProject,
        }));
        return id;
      },

      deleteProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject:
            state.currentProject?.id === id ? null : state.currentProject,
        }));
      },

      duplicateProject: (id: string) => {
        const project = get().projects.find((p) => p.id === id);
        if (project) {
          const newProject: Project = {
            ...project,
            id: generateId(),
            name: `${project.name} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
            history: [],
          };
          set((state) => ({
            projects: [newProject, ...state.projects],
          }));
        }
      },

      setCurrentProject: (id: string) => {
        const project = get().projects.find((p) => p.id === id);
        if (!project) {
          set({ currentProject: null });
          return;
        }

        if (project.layout.length > 0) {
          set({ currentProject: project });
          return;
        }

        const defaultSection: LayoutSection = {
          id: generateId(),
          layoutType: "full-width",
          columns: 1,
          columnWidths: ["100%"],
          components: [],
          name: "Full Width",
        };

        const updatedProject: Project = {
          ...project,
          layout: [defaultSection],
          updatedAt: new Date(),
        };

        set((state) => ({
          currentProject: updatedProject,
          projects: state.projects.map((p) =>
            p.id === updatedProject.id ? updatedProject : p,
          ),
        }));
      },

      updateProjectName: (id: string, name: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name, updatedAt: new Date() } : p,
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, name, updatedAt: new Date() }
              : state.currentProject,
        }));
      },

      setLayout: (sections: LayoutSection[]) => {
        set((state) => {
          if (!state.currentProject) return state;
          const updatedProject = {
            ...state.currentProject,
            layout: sections,
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            ),
          };
        });
        get().saveToHistory("Layout changed");
      },

      addSection: (
        layoutType: SectionLayoutType,
        template: SectionTemplate,
        insertIndex?: number,
      ) => {
        set((state) => {
          if (!state.currentProject) return state;
          const newSection: LayoutSection = {
            id: generateId(),
            layoutType,
            columns: template.columns,
            columnWidths: template.columnWidths,
            components: [],
            name: template.name,
          };
          const newLayout = [...state.currentProject.layout];
          if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= newLayout.length) {
            newLayout.splice(insertIndex, 0, newSection);
          } else {
            newLayout.push(newSection);
          }
          const updatedProject = {
            ...state.currentProject,
            layout: newLayout,
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            ),
          };
        });
        get().saveToHistory(`Added ${template.name} section`);
      },

      updateSection: (
        sectionId: string,
        updates: Partial<LayoutSection>,
        skipHistory = false,
      ) => {
        set((state) => {
          if (!state.currentProject) return state;
          const updatedLayout = state.currentProject.layout.map((section) =>
            section.id === sectionId ? { ...section, ...updates } : section,
          );
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            ),
          };
        });
        if (!skipHistory) {
          get().saveToHistory("Updated section");
        }
      },

      removeSection: (sectionId: string) => {
        set((state) => {
          if (!state.currentProject) return state;
          const updatedLayout = state.currentProject.layout.filter(
            (s) => s.id !== sectionId,
          );
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            ),
          };
        });
        get().saveToHistory("Removed section");
      },

      duplicateSection: (sectionId: string) => {
        set((state) => {
          if (!state.currentProject) return state;
          const sectionIndex = state.currentProject.layout.findIndex(
            (s) => s.id === sectionId,
          );
          if (sectionIndex === -1) return state;
          const section = state.currentProject.layout[sectionIndex];
          const duplicated: LayoutSection = {
            ...JSON.parse(JSON.stringify(section)),
            id: generateId(),
            name: section.name ? `${section.name} (Copy)` : undefined,
          };
          const updatedLayout = [...state.currentProject.layout];
          updatedLayout.splice(sectionIndex + 1, 0, duplicated);
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            ),
          };
        });
        get().saveToHistory("Duplicated section");
      },

      moveSectionUp: (sectionId: string) => {
        set((state) => {
          if (!state.currentProject) return state;
          const index = state.currentProject.layout.findIndex(
            (s) => s.id === sectionId,
          );
          if (index <= 0) return state;
          const updatedLayout = [...state.currentProject.layout];
          [updatedLayout[index - 1], updatedLayout[index]] = [
            updatedLayout[index],
            updatedLayout[index - 1],
          ];
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            ),
          };
        });
        get().saveToHistory("Moved section up");
      },

      moveSectionDown: (sectionId: string) => {
        set((state) => {
          if (!state.currentProject) return state;
          const index = state.currentProject.layout.findIndex(
            (s) => s.id === sectionId,
          );
          if (index === -1 || index >= state.currentProject.layout.length - 1)
            return state;
          const updatedLayout = [...state.currentProject.layout];
          [updatedLayout[index], updatedLayout[index + 1]] = [
            updatedLayout[index + 1],
            updatedLayout[index],
          ];
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            ),
          };
        });
        get().saveToHistory("Moved section down");
      },

      addComponent: (
        sectionId: string,
        component: Component,
        insertIndex?: number,
      ) => {
        set((state) => {
          if (!state.currentProject) return state;
          const updatedLayout = state.currentProject.layout.map((section) =>
            section.id === sectionId
              ? (() => {
                  const next = [...section.components];
                  const idx =
                    insertIndex === undefined
                      ? next.length
                      : Math.max(0, Math.min(insertIndex, next.length));
                  next.splice(idx, 0, component);
                  return { ...section, components: next };
                })()
              : section,
          );
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            ),
          };
        });
        get().saveToHistory(`Added ${component.type}`);
      },

      addComponentToLayout: (
        sectionId: string,
        layoutComponentId: string,
        component: Component,
        insertIndex?: number,
      ) => {
        set((state) => {
          if (!state.currentProject) return state;
          const updatedLayout = state.currentProject.layout.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  components: addComponentToLayoutInTree(
                    section.components,
                    layoutComponentId,
                    component,
                    insertIndex,
                  ),
                }
              : section,
          );
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            ),
          };
        });
        get().saveToHistory(`Added ${component.type}`);
      },

      addComponentToColumn: (
        sectionId: string,
        columnIndex: number,
        component: Component,
      ) => {
        const componentWithColumn = {
          ...component,
          props: { ...component.props, columnIndex },
        };
        get().addComponent(sectionId, componentWithColumn);
      },

      updateComponent: (
        sectionId: string,
        componentId: string,
        updates: Partial<Component>,
        skipHistory = false,
      ) => {
        set((state) => {
          if (!state.currentProject) return state;
          const updatedLayout = state.currentProject.layout.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  components: updateComponentInTree(
                    section.components,
                    componentId,
                    updates,
                  ),
                }
              : section,
          );
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            ),
          };
        });
        if (!skipHistory) {
          get().saveToHistory("Updated component");
        }
      },

      removeComponent: (sectionId: string, componentId: string) => {
        const section = get().currentProject?.layout.find(
          (s) => s.id === sectionId,
        );
        const component = section
          ? findComponentInTree(section.components, componentId)
          : null;
        const imageIdsToDelete = component
          ? collectImageIdsInTree([component])
          : [];
        imageIdsToDelete.forEach((imageId) => {
          deleteImage(imageId).catch(console.error);
        });

        set((state) => {
          if (!state.currentProject) return state;
          const updatedLayout = state.currentProject.layout.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  components: removeComponentFromTree(
                    section.components,
                    componentId,
                  ).components,
                }
              : section,
          );
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            ),
          };
        });
        get().saveToHistory("Removed component");
      },

      moveComponent: (
        fromSectionId: string,
        toSectionId: string,
        componentId: string,
        newIndex: number,
        options,
      ) => {
        set((state) => {
          if (!state.currentProject) return state;

          const targetColumnIndex = options?.targetColumnIndex;
          const toLayoutId = options?.toLayoutId || null;
          const targetSpan = options?.targetSpan;

          let movedComponent: Component | null = null;
          let updatedLayout = state.currentProject.layout.map((section) => {
            if (section.id !== fromSectionId) return section;
            const res = removeComponentFromTree(
              section.components,
              componentId,
            );
            movedComponent = res.removed;
            return { ...section, components: res.components };
          });

          if (movedComponent) {
            const moved = movedComponent as Component;
            const movedProps = (moved.props ?? {}) as Record<string, unknown>;
            const movedWithColumn: Component =
              targetColumnIndex !== undefined
                ? {
                    ...moved,
                    props: {
                      ...movedProps,
                      span: "column",
                      columnIndex: targetColumnIndex,
                    },
                  }
                : targetSpan === "full"
                  ? {
                      ...moved,
                      props: {
                        ...movedProps,
                        span: "full",
                        columnIndex: undefined,
                      },
                    }
                  : moved;

            updatedLayout = updatedLayout.map((section) => {
              if (section.id !== toSectionId) return section;

              if (toLayoutId) {
                return {
                  ...section,
                  components: addComponentToLayoutInTree(
                    section.components,
                    toLayoutId,
                    movedWithColumn,
                    newIndex,
                  ),
                };
              }

              const newComponents = [...section.components];
              const insertIndex = Math.max(
                0,
                Math.min(newIndex, newComponents.length),
              );
              newComponents.splice(insertIndex, 0, movedWithColumn);
              return { ...section, components: newComponents };
            });
          }

          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            ),
          };
        });
        get().saveToHistory("Moved component");
      },

      saveToHistory: (action: string) => {
        // Throttle history saves to prevent overwhelming storage
        const now = Date.now();
        if (now - lastHistorySave < HISTORY_THROTTLE_MS) {
          return; // Skip this save, too soon since last one
        }
        lastHistorySave = now;

        try {
          set((state) => {
            if (!state.currentProject) return state;

            // Limit history entries to prevent storage overflow
            const maxHistoryEntries = 5; // Very conservative limit

            const historyEntry: HistoryEntry = {
              id: generateId(),
              timestamp: new Date(),
              action,
              snapshot: JSON.parse(JSON.stringify(state.currentProject.layout)),
            };
            const updatedProject = {
              ...state.currentProject,
              history: [historyEntry, ...state.currentProject.history].slice(
                0,
                maxHistoryEntries,
              ),
            };
            return {
              currentProject: updatedProject,
              projects: state.projects.map((p) =>
                p.id === updatedProject.id ? updatedProject : p,
              ),
            };
          });
        } catch (error) {
          // If quota exceeded, clear all history and try again
          if (error instanceof Error && error.name === "QuotaExceededError") {
            console.warn(
              "Storage quota exceeded, clearing history to free space...",
            );
            get().clearHistory();

            // Try one more time with empty history
            try {
              set((state) => {
                if (!state.currentProject) return state;

                const historyEntry: HistoryEntry = {
                  id: generateId(),
                  timestamp: new Date(),
                  action,
                  snapshot: JSON.parse(
                    JSON.stringify(state.currentProject.layout),
                  ),
                };
                const updatedProject = {
                  ...state.currentProject,
                  history: [historyEntry],
                };
                return {
                  currentProject: updatedProject,
                  projects: state.projects.map((p) =>
                    p.id === updatedProject.id ? updatedProject : p,
                  ),
                };
              });
            } catch (retryError) {
              console.error(
                "Still unable to save after clearing history. Storage may be critically full.",
              );
            }
          } else {
            console.error("Error saving to history:", error);
          }
        }
      },

      clearHistory: () => {
        set((state) => {
          if (!state.currentProject) return state;

          const updatedProject = {
            ...state.currentProject,
            history: [],
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            ),
          };
        });
      },

      restoreFromHistory: (historyId: string) => {
        set((state) => {
          if (!state.currentProject) return state;
          const historyEntry = state.currentProject.history.find(
            (h) => h.id === historyId,
          );
          if (!historyEntry) return state;
          const updatedProject = {
            ...state.currentProject,
            layout: JSON.parse(JSON.stringify(historyEntry.snapshot)),
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p,
            ),
          };
        });
      },

      saveProject: () => {
        set((state) => {
          if (!state.currentProject) return state;
          return {
            projects: state.projects.map((p) =>
              p.id === state.currentProject!.id
                ? { ...state.currentProject!, updatedAt: new Date() }
                : p,
            ),
          };
        });
      },
    }),
    {
      name: "website-builder-storage",
      partialize: (state) => ({ projects: state.projects }),
    },
  ),
);
