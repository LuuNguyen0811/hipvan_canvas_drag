'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProjectStore } from '@/lib/store'
import { EditorToolbar } from '@/components/editor/editor-toolbar'
import { ToolsPanel } from '@/components/editor/tools-panel'
import { PreviewPanel } from '@/components/editor/preview-panel'
import { HistoryPanel } from '@/components/editor/history-panel'

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const { projects, currentProject, setCurrentProject, _hasHydrated } = useProjectStore()
  const [activePanel, setActivePanel] = useState<'tools' | 'history'>('tools')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!_hasHydrated) return

    const projectId = params.id as string
    const project = projects.find((p) => p.id === projectId)
    
    if (project) {
      setCurrentProject(projectId)
      setIsLoading(false)
    } else {
      router.push('/')
    }
  }, [params.id, projects, setCurrentProject, router, _hasHydrated])

  if (isLoading || !currentProject) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <EditorToolbar 
        project={currentProject} 
        activePanel={activePanel}
        onPanelChange={setActivePanel}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Tools or History */}
        <div className="w-80 shrink-0 border-r border-border bg-card">
          {activePanel === 'tools' ? (
            <ToolsPanel />
          ) : (
            <HistoryPanel />
          )}
        </div>
        
        {/* Right Panel - Preview */}
        <div className="flex-1 overflow-hidden">
          <PreviewPanel />
        </div>
      </div>
    </div>
  )
}
