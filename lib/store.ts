'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, LayoutSection, Component, HistoryEntry, SectionLayoutType, SectionTemplate } from './types'
import { deleteImage } from './image-storage'

interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  _hasHydrated: boolean
  
  // Hydration action
  setHasHydrated: (state: boolean) => void
  
  // Project actions
  createProject: (name: string) => string
  deleteProject: (id: string) => void
  duplicateProject: (id: string) => void
  setCurrentProject: (id: string) => void
  updateProjectName: (id: string, name: string) => void
  
  // Layout actions
  setLayout: (sections: LayoutSection[]) => void
  
  // Section actions
  addSection: (layoutType: SectionLayoutType, template: SectionTemplate) => void
  updateSection: (sectionId: string, updates: Partial<LayoutSection>, skipHistory?: boolean) => void
  removeSection: (sectionId: string) => void
  duplicateSection: (sectionId: string) => void
  moveSectionUp: (sectionId: string) => void
  moveSectionDown: (sectionId: string) => void
  
  // Component actions
  addComponent: (sectionId: string, component: Component) => void
  addComponentToColumn: (sectionId: string, columnIndex: number, component: Component) => void
  updateComponent: (sectionId: string, componentId: string, updates: Partial<Component>, skipHistory?: boolean) => void
  removeComponent: (sectionId: string, componentId: string) => void
  moveComponent: (fromSectionId: string, toSectionId: string, componentId: string, newIndex: number) => void
  
  // History actions
  saveToHistory: (action: string) => void
  restoreFromHistory: (historyId: string) => void
  clearHistory: () => void
  
  // Save project
  saveProject: () => void
}

// Throttle helper to prevent too many saves
let lastHistorySave = 0
const HISTORY_THROTTLE_MS = 1000 // Only save history once per second max

const generateId = () => Math.random().toString(36).substring(2, 9)

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state })
      },
      
      createProject: (name: string) => {
        const id = generateId()
        const newProject: Project = {
          id,
          name,
          layout: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          history: []
        }
        set((state) => ({
          projects: [newProject, ...state.projects],
          currentProject: newProject
        }))
        return id
      },
      
      deleteProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject
        }))
      },
      
      duplicateProject: (id: string) => {
        const project = get().projects.find((p) => p.id === id)
        if (project) {
          const newProject: Project = {
            ...project,
            id: generateId(),
            name: `${project.name} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
            history: []
          }
          set((state) => ({
            projects: [newProject, ...state.projects]
          }))
        }
      },
      
      setCurrentProject: (id: string) => {
        const project = get().projects.find((p) => p.id === id)
        set({ currentProject: project || null })
      },
      
      updateProjectName: (id: string, name: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name, updatedAt: new Date() } : p
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, name, updatedAt: new Date() }
              : state.currentProject
        }))
      },
      
      setLayout: (sections: LayoutSection[]) => {
        set((state) => {
          if (!state.currentProject) return state
          const updatedProject = {
            ...state.currentProject,
            layout: sections,
            updatedAt: new Date()
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            )
          }
        })
        get().saveToHistory('Layout changed')
      },
      
      addSection: (layoutType: SectionLayoutType, template: SectionTemplate) => {
        set((state) => {
          if (!state.currentProject) return state
          const newSection: LayoutSection = {
            id: generateId(),
            layoutType,
            columns: template.columns,
            columnWidths: template.columnWidths,
            components: [],
            name: template.name
          }
          const updatedProject = {
            ...state.currentProject,
            layout: [...state.currentProject.layout, newSection],
            updatedAt: new Date()
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            )
          }
        })
        get().saveToHistory(`Added ${template.name} section`)
      },
      
      updateSection: (sectionId: string, updates: Partial<LayoutSection>, skipHistory = false) => {
        set((state) => {
          if (!state.currentProject) return state
          const updatedLayout = state.currentProject.layout.map((section) =>
            section.id === sectionId ? { ...section, ...updates } : section
          )
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date()
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            )
          }
        })
        if (!skipHistory) {
          get().saveToHistory('Updated section')
        }
      },
      
      removeSection: (sectionId: string) => {
        set((state) => {
          if (!state.currentProject) return state
          const updatedLayout = state.currentProject.layout.filter((s) => s.id !== sectionId)
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date()
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            )
          }
        })
        get().saveToHistory('Removed section')
      },
      
      duplicateSection: (sectionId: string) => {
        set((state) => {
          if (!state.currentProject) return state
          const sectionIndex = state.currentProject.layout.findIndex((s) => s.id === sectionId)
          if (sectionIndex === -1) return state
          const section = state.currentProject.layout[sectionIndex]
          const duplicated: LayoutSection = {
            ...JSON.parse(JSON.stringify(section)),
            id: generateId(),
            name: section.name ? `${section.name} (Copy)` : undefined
          }
          const updatedLayout = [...state.currentProject.layout]
          updatedLayout.splice(sectionIndex + 1, 0, duplicated)
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date()
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            )
          }
        })
        get().saveToHistory('Duplicated section')
      },
      
      moveSectionUp: (sectionId: string) => {
        set((state) => {
          if (!state.currentProject) return state
          const index = state.currentProject.layout.findIndex((s) => s.id === sectionId)
          if (index <= 0) return state
          const updatedLayout = [...state.currentProject.layout]
          ;[updatedLayout[index - 1], updatedLayout[index]] = [updatedLayout[index], updatedLayout[index - 1]]
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date()
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            )
          }
        })
        get().saveToHistory('Moved section up')
      },
      
      moveSectionDown: (sectionId: string) => {
        set((state) => {
          if (!state.currentProject) return state
          const index = state.currentProject.layout.findIndex((s) => s.id === sectionId)
          if (index === -1 || index >= state.currentProject.layout.length - 1) return state
          const updatedLayout = [...state.currentProject.layout]
          ;[updatedLayout[index], updatedLayout[index + 1]] = [updatedLayout[index + 1], updatedLayout[index]]
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date()
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            )
          }
        })
        get().saveToHistory('Moved section down')
      },
      
      addComponent: (sectionId: string, component: Component) => {
        set((state) => {
          if (!state.currentProject) return state
          const updatedLayout = state.currentProject.layout.map((section) =>
            section.id === sectionId
              ? { ...section, components: [...section.components, component] }
              : section
          )
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date()
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            )
          }
        })
        get().saveToHistory(`Added ${component.type}`)
      },
      
      addComponentToColumn: (sectionId: string, columnIndex: number, component: Component) => {
        const componentWithColumn = { ...component, props: { ...component.props, columnIndex } }
        get().addComponent(sectionId, componentWithColumn)
      },
      
      updateComponent: (sectionId: string, componentId: string, updates: Partial<Component>, skipHistory = false) => {
        set((state) => {
          if (!state.currentProject) return state
          const updatedLayout = state.currentProject.layout.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  components: section.components.map((c) =>
                    c.id === componentId ? { ...c, ...updates } : c
                  )
                }
              : section
          )
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date()
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            )
          }
        })
        if (!skipHistory) {
          get().saveToHistory('Updated component')
        }
      },
      
      removeComponent: (sectionId: string, componentId: string) => {
        // Get component to check for image
        const section = get().currentProject?.layout.find(s => s.id === sectionId)
        const component = section?.components.find(c => c.id === componentId)
        
        // Delete associated image if exists
        if (component?.imageId) {
          deleteImage(component.imageId).catch(console.error)
        }
        
        set((state) => {
          if (!state.currentProject) return state
          const updatedLayout = state.currentProject.layout.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  components: section.components.filter((c) => c.id !== componentId)
                }
              : section
          )
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date()
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            )
          }
        })
        get().saveToHistory('Removed component')
      },
      
      moveComponent: (fromSectionId: string, toSectionId: string, componentId: string, newIndex: number) => {
        set((state) => {
          if (!state.currentProject) return state
          
          let movedComponent: Component | null = null
          let updatedLayout = state.currentProject.layout.map((section) => {
            if (section.id === fromSectionId) {
              const comp = section.components.find((c) => c.id === componentId)
              if (comp) movedComponent = comp
              return {
                ...section,
                components: section.components.filter((c) => c.id !== componentId)
              }
            }
            return section
          })
          
          if (movedComponent) {
            updatedLayout = updatedLayout.map((section) => {
              if (section.id === toSectionId) {
                const newComponents = [...section.components]
                newComponents.splice(newIndex, 0, movedComponent!)
                return { ...section, components: newComponents }
              }
              return section
            })
          }
          
          const updatedProject = {
            ...state.currentProject,
            layout: updatedLayout,
            updatedAt: new Date()
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            )
          }
        })
        get().saveToHistory('Moved component')
      },
      
      saveToHistory: (action: string) => {
        // Throttle history saves to prevent overwhelming storage
        const now = Date.now()
        if (now - lastHistorySave < HISTORY_THROTTLE_MS) {
          return // Skip this save, too soon since last one
        }
        lastHistorySave = now
        
        try {
          set((state) => {
            if (!state.currentProject) return state
            
            // Limit history entries to prevent storage overflow
            const maxHistoryEntries = 5 // Very conservative limit
            
            const historyEntry: HistoryEntry = {
              id: generateId(),
              timestamp: new Date(),
              action,
              snapshot: JSON.parse(JSON.stringify(state.currentProject.layout))
            }
            const updatedProject = {
              ...state.currentProject,
              history: [historyEntry, ...state.currentProject.history].slice(0, maxHistoryEntries)
            }
            return {
              currentProject: updatedProject,
              projects: state.projects.map((p) =>
                p.id === updatedProject.id ? updatedProject : p
              )
            }
          })
        } catch (error) {
          // If quota exceeded, clear all history and try again
          if (error instanceof Error && error.name === 'QuotaExceededError') {
            console.warn('Storage quota exceeded, clearing history to free space...')
            get().clearHistory()
            
            // Try one more time with empty history
            try {
              set((state) => {
                if (!state.currentProject) return state
                
                const historyEntry: HistoryEntry = {
                  id: generateId(),
                  timestamp: new Date(),
                  action,
                  snapshot: JSON.parse(JSON.stringify(state.currentProject.layout))
                }
                const updatedProject = {
                  ...state.currentProject,
                  history: [historyEntry]
                }
                return {
                  currentProject: updatedProject,
                  projects: state.projects.map((p) =>
                    p.id === updatedProject.id ? updatedProject : p
                  )
                }
              })
            } catch (retryError) {
              console.error('Still unable to save after clearing history. Storage may be critically full.')
            }
          } else {
            console.error('Error saving to history:', error)
          }
        }
      },
      
      clearHistory: () => {
        set((state) => {
          if (!state.currentProject) return state
          
          const updatedProject = {
            ...state.currentProject,
            history: []
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            )
          }
        })
      },
      
      restoreFromHistory: (historyId: string) => {
        set((state) => {
          if (!state.currentProject) return state
          const historyEntry = state.currentProject.history.find((h) => h.id === historyId)
          if (!historyEntry) return state
          const updatedProject = {
            ...state.currentProject,
            layout: JSON.parse(JSON.stringify(historyEntry.snapshot)),
            updatedAt: new Date()
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            )
          }
        })
      },
      
      saveProject: () => {
        set((state) => {
          if (!state.currentProject) return state
          return {
            projects: state.projects.map((p) =>
              p.id === state.currentProject!.id
                ? { ...state.currentProject!, updatedAt: new Date() }
                : p
            )
          }
        })
      }
    }),
    {
      name: 'website-builder-storage',
      partialize: (state) => ({ projects: state.projects }),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true)
      }
    }
  )
)
