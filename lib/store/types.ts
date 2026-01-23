import type {
  Project,
  LayoutSection,
  Component,
  HistoryEntry,
  SectionLayoutType,
  SectionTemplate,
} from "../types";

export interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  _hasHydrated: boolean;

  // Hydration action
  setHasHydrated: (state: boolean) => void;

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
  clearAllSections: () => void;

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
  reorderCollectionItems: (
    sectionId: string,
    componentId: string,
    oldIndex: number,
    newIndex: number,
  ) => void;
  // History actions
  saveToHistory: (action: string) => void;
  restoreFromHistory: (historyId: string) => void;
  clearHistory: () => void;

  // Save project
  saveProject: () => void;
}
