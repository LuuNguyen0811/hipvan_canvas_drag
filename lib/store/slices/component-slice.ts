import { StateCreator } from "zustand";
import { ProjectStore } from "../types";
import {
  findComponentInTree,
  collectImageIdsInTree,
  updateComponentInTree,
  addComponentToLayoutInTree,
  removeComponentFromTree,
} from "../utils";
import type { Component } from "../../types";
import { deleteImage } from "../../image-storage";

export const createComponentSlice: StateCreator<
  ProjectStore,
  [["zustand/persist", unknown]],
  [],
  Pick<
    ProjectStore,
    | "addComponent"
    | "addComponentToLayout"
    | "addComponentToColumn"
    | "updateComponent"
    | "removeComponent"
    | "moveComponent"
    | "reorderCollectionItems"
  >
> = (set, get) => ({
  addComponent: (sectionId: string, component: Component, insertIndex?: number) => {
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
          : section
      );
      const updatedProject = {
        ...state.currentProject,
        layout: updatedLayout,
        updatedAt: new Date(),
      };
      return {
        currentProject: updatedProject,
        projects: state.projects.map((p) =>
          p.id === updatedProject.id ? updatedProject : p
        ),
      };
    });
    get().saveToHistory(`Added ${component.type}`);
  },

  addComponentToLayout: (sectionId: string, layoutComponentId: string, component: Component, insertIndex?: number) => {
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
                insertIndex
              ),
            }
          : section
      );
      const updatedProject = {
        ...state.currentProject,
        layout: updatedLayout,
        updatedAt: new Date(),
      };
      return {
        currentProject: updatedProject,
        projects: state.projects.map((p) =>
          p.id === updatedProject.id ? updatedProject : p
        ),
      };
    });
    get().saveToHistory(`Added ${component.type}`);
  },

  addComponentToColumn: (sectionId: string, columnIndex: number, component: Component) => {
    const componentWithColumn = {
      ...component,
      props: { ...component.props, columnIndex },
    };
    get().addComponent(sectionId, componentWithColumn);
  },

  updateComponent: (sectionId: string, componentId: string, updates: Partial<Component>, skipHistory = false) => {
    set((state) => {
      if (!state.currentProject) return state;
      const updatedLayout = state.currentProject.layout.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              components: updateComponentInTree(section.components, componentId, updates),
            }
          : section
      );
      const updatedProject = {
        ...state.currentProject,
        layout: updatedLayout,
        updatedAt: new Date(),
      };
      return {
        currentProject: updatedProject,
        projects: state.projects.map((p) =>
          p.id === updatedProject.id ? updatedProject : p
        ),
      };
    });
    if (!skipHistory) {
      get().saveToHistory("Updated component");
    }
  },

  removeComponent: (sectionId: string, componentId: string) => {
    const section = get().currentProject?.layout.find((s) => s.id === sectionId);
    const component = section ? findComponentInTree(section.components, componentId) : null;
    const imageIdsToDelete = component ? collectImageIdsInTree([component]) : [];
    imageIdsToDelete.forEach((imageId) => {
      deleteImage(imageId).catch(console.error);
    });

    set((state) => {
      if (!state.currentProject) return state;
      const updatedLayout = state.currentProject.layout.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              components: removeComponentFromTree(section.components, componentId).components,
            }
          : section
      );
      const updatedProject = {
        ...state.currentProject,
        layout: updatedLayout,
        updatedAt: new Date(),
      };
      return {
        currentProject: updatedProject,
        projects: state.projects.map((p) =>
          p.id === updatedProject.id ? updatedProject : p
        ),
      };
    });
    get().saveToHistory("Removed component");
  },

  moveComponent: (fromSectionId: string, toSectionId: string, componentId: string, newIndex: number, options) => {
    set((state) => {
      if (!state.currentProject) return state;

      let movedComponent: Component | null = null;
      let updatedLayout = state.currentProject.layout.map((section) => {
        if (section.id !== fromSectionId) return section;
        const res = removeComponentFromTree(section.components, componentId);
        movedComponent = res.removed;
        return { ...section, components: res.components };
      });

      if (movedComponent) {
        const moved = movedComponent as Component;
        const movedProps = (moved.props ?? {}) as Record<string, unknown>;
        const movedWithColumn: Component =
          options?.targetColumnIndex !== undefined
            ? {
                ...moved,
                props: {
                  ...movedProps,
                  span: "column",
                  columnIndex: options.targetColumnIndex,
                },
              }
            : options?.targetSpan === "full"
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

          if (options?.toLayoutId) {
            return {
              ...section,
              components: addComponentToLayoutInTree(
                section.components,
                options.toLayoutId,
                movedWithColumn,
                newIndex
              ),
            };
          }

          const newComponents = [...section.components];
          const insertIndex = Math.max(0, Math.min(newIndex, newComponents.length));
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
          p.id === updatedProject.id ? updatedProject : p
        ),
      };
    });
    get().saveToHistory("Moved component");
  },

  reorderCollectionItems: (sectionId: string, componentId: string, oldIndex: number, newIndex: number) => {
    set((state) => {
      if (!state.currentProject) return state;

      const updatedLayout = state.currentProject.layout.map((section) => {
        if (section.id !== sectionId) return section;

        return {
          ...section,
          components: section.components.map((comp) => {
            if (comp.id !== componentId || !comp.collectionData) return comp;

            const newItems = [...comp.collectionData.items];
            const [movedItem] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);

            return {
              ...comp,
              collectionData: {
                ...comp.collectionData,
                items: newItems,
              },
            };
          }),
        };
      });

      const updatedProject = {
        ...state.currentProject,
        layout: updatedLayout,
        updatedAt: new Date(),
      };

      return {
        currentProject: updatedProject,
        projects: state.projects.map((p) =>
          p.id === updatedProject.id ? updatedProject : p
        ),
      };
    });
    get().saveToHistory("Reordered collection items");
  },
});
