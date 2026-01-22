'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/lib/store'
import type { Project } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ArrowLeft,
  Wrench,
  History,
  Check,
  Pencil,
  Layers,
} from 'lucide-react'

interface EditorToolbarProps {
  project: Project
  activePanel: 'tools' | 'history'
  onPanelChange: (panel: 'tools' | 'history') => void
}

export function EditorToolbar({ project, activePanel, onPanelChange }: EditorToolbarProps) {
  const router = useRouter()
  const { updateProjectName, saveProject } = useProjectStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(project.name)

  const handleSaveName = () => {
    if (editedName.trim()) {
      updateProjectName(project.id, editedName.trim())
    } else {
      setEditedName(project.name)
    }
    setIsEditing(false)
  }

  const handleDone = () => {
    saveProject()
    router.push(`/preview/${project.id}`)
  }

  return (
    <TooltipProvider>
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to Dashboard</TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Layers className="h-4 w-4 text-primary-foreground" />
            </div>
            
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="h-8 w-48"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-foreground hover:bg-muted"
              >
                {project.name}
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Center Section - Panel Toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <Button
            variant={activePanel === 'tools' ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => onPanelChange('tools')}
          >
            <Wrench className="h-4 w-4" />
            Tools
          </Button>
          <Button
            variant={activePanel === 'history' ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => onPanelChange('history')}
          >
            <History className="h-4 w-4" />
            History
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <Button onClick={handleDone} className="gap-2">
            <Check className="h-4 w-4" />
            Done
          </Button>
        </div>
      </header>
    </TooltipProvider>
  )
}
