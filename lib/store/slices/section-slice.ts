import { StateCreator } from "zustand";
import { ProjectStore } from "../types";
import { generateId } from "../utils";
import type { LayoutSection, SectionLayoutType, SectionTemplate } from "../../types";

export const createSectionSlice: StateCreator<
  ProjectStore,
  [["zustand/persist", unknown]],
  [],
  Pick<
    ProjectStore,
    | "setLayout"
    | "addSection"
    | "updateSection"
    | "removeSection"
    | "duplicateSection"
    | "moveSectionUp"
    | "moveSectionDown"
    | "clearAllSections"
  >
> = (set, get) => ({
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
          p.id === updatedProject.id ? updatedProject : p
        ),
      };
    });
    get().saveToHistory("Layout changed");
  },

  addSection: (layoutType: SectionLayoutType, template: SectionTemplate, insertIndex?: number) => {
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
          p.id === updatedProject.id ? updatedProject : p
        ),
      };
    });
    get().saveToHistory(`Added ${template.name} section`);
  },

  updateSection: (sectionId: string, updates: Partial<LayoutSection>, skipHistory = false) => {
    set((state) => {
      if (!state.currentProject) return state;
      const updatedLayout = state.currentProject.layout.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
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
      get().saveToHistory("Updated section");
    }
  },

  removeSection: (sectionId: string) => {
    set((state) => {
      if (!state.currentProject) return state;
      const updatedLayout = state.currentProject.layout.filter((s) => s.id !== sectionId);
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
    get().saveToHistory("Removed section");
  },

  duplicateSection: (sectionId: string) => {
    set((state) => {
      if (!state.currentProject) return state;
      const sectionIndex = state.currentProject.layout.findIndex((s) => s.id === sectionId);
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
          p.id === updatedProject.id ? updatedProject : p
        ),
      };
    });
    get().saveToHistory("Duplicated section");
  },

  moveSectionUp: (sectionId: string) => {
    set((state) => {
      if (!state.currentProject) return state;
      const index = state.currentProject.layout.findIndex((s) => s.id === sectionId);
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
          p.id === updatedProject.id ? updatedProject : p
        ),
      };
    });
    get().saveToHistory("Moved section up");
  },

  moveSectionDown: (sectionId: string) => {
    set((state) => {
      if (!state.currentProject) return state;
      const index = state.currentProject.layout.findIndex((s) => s.id === sectionId);
      if (index === -1 || index >= state.currentProject.layout.length - 1) return state;
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
          p.id === updatedProject.id ? updatedProject : p
        ),
      };
    });
    get().saveToHistory("Moved section down");
  },

  clearAllSections: () => {
    set((state) => {
      if (!state.currentProject) return state;
      const updatedProject = {
        ...state.currentProject,
        layout: [],
        updatedAt: new Date(),
      };
      return {
        currentProject: updatedProject,
        projects: state.projects.map((p) =>
          p.id === updatedProject.id ? updatedProject : p
        ),
      };
    });
    get().saveToHistory("Cleared all sections");
  },
});
