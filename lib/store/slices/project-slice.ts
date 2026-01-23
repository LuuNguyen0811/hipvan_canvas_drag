import { StateCreator } from "zustand";
import { ProjectStore } from "../types";
import { generateId } from "../utils";
import type { Project, LayoutSection } from "../../types";

export const createProjectSlice: StateCreator<
  ProjectStore,
  [["zustand/persist", unknown]],
  [],
  Pick<
    ProjectStore,
    | "projects"
    | "currentProject"
    | "_hasHydrated"
    | "setHasHydrated"
    | "editorTarget"
    | "setEditorTarget"
    | "clearEditorTarget"
    | "createProject"
    | "deleteProject"
    | "duplicateProject"
    | "setCurrentProject"
    | "updateProjectName"
    | "saveProject"
  >
> = (set, get) => ({
  projects: [],
  currentProject: null,
  _hasHydrated: false,
  setHasHydrated: (state) => set({ _hasHydrated: state }),
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
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
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
        p.id === updatedProject.id ? updatedProject : p
      ),
    }));
  },

  updateProjectName: (id: string, name: string) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, name, updatedAt: new Date() } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, name, updatedAt: new Date() }
          : state.currentProject,
    }));
  },

  saveProject: () => {
    set((state) => {
      if (!state.currentProject) return state;
      return {
        projects: state.projects.map((p) =>
          p.id === state.currentProject!.id
            ? { ...state.currentProject!, updatedAt: new Date() }
            : p
        ),
      };
    });
  },
});
