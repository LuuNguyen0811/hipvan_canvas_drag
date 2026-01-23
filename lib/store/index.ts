import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProjectStore } from "./types";
import { createProjectSlice } from "./slices/project-slice";
import { createSectionSlice } from "./slices/section-slice";
import { createComponentSlice } from "./slices/component-slice";
import { createHistorySlice } from "./slices/history-slice";

export const useProjectStore = create<ProjectStore>()(
  persist(
    (...args) => ({
      ...createProjectSlice(...args),
      ...createSectionSlice(...args),
      ...createComponentSlice(...args),
      ...createHistorySlice(...args),
    }),
    {
      name: "website-builder-storage",
      partialize: (state) => ({ projects: state.projects }),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);
