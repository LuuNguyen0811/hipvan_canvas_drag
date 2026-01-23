import { StateCreator } from "zustand";
import { ProjectStore } from "../types";
import { generateId } from "../utils";
import type { HistoryEntry } from "../../types";

let lastHistorySave = 0;
const HISTORY_THROTTLE_MS = 1000;

export const createHistorySlice: StateCreator<
  ProjectStore,
  [["zustand/persist", unknown]],
  [],
  Pick<ProjectStore, "saveToHistory" | "restoreFromHistory" | "clearHistory">
> = (set, get) => ({
  saveToHistory: (action: string) => {
    const now = Date.now();
    if (now - lastHistorySave < HISTORY_THROTTLE_MS) return;
    lastHistorySave = now;

    try {
      set((state) => {
        if (!state.currentProject) return state;
        const maxHistoryEntries = 5;

        const historyEntry: HistoryEntry = {
          id: generateId(),
          timestamp: new Date(),
          action,
          snapshot: JSON.parse(JSON.stringify(state.currentProject.layout)),
        };

        const updatedProject = {
          ...state.currentProject,
          history: [historyEntry, ...state.currentProject.history].slice(0, maxHistoryEntries),
        };

        return {
          currentProject: updatedProject,
          projects: state.projects.map((p) =>
            p.id === updatedProject.id ? updatedProject : p
          ),
        };
      });
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.warn("Storage quota exceeded, clearing history to free space...");
        get().clearHistory();
        // Retry logic could go here, but omitted for brevity in slice
      } else {
        console.error("Error saving to history:", error);
      }
    }
  },

  clearHistory: () => {
    set((state) => {
      if (!state.currentProject) return state;
      const updatedProject = { ...state.currentProject, history: [] };
      return {
        currentProject: updatedProject,
        projects: state.projects.map((p) =>
          p.id === updatedProject.id ? updatedProject : p
        ),
      };
    });
  },

  restoreFromHistory: (historyId: string) => {
    set((state) => {
      if (!state.currentProject) return state;
      const historyEntry = state.currentProject.history.find((h) => h.id === historyId);
      if (!historyEntry) return state;

      const updatedProject = {
        ...state.currentProject,
        layout: JSON.parse(JSON.stringify(historyEntry.snapshot)),
        updatedAt: new Date(),
      };

      return {
        currentProject: updatedProject,
        projects: state.projects.map((p) =>
          p.id === updatedProject.id ? updatedProject : p
        ),
      };
    });
  },
});
