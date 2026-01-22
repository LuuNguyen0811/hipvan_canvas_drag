'use client'

import { useProjectStore } from '@/lib/store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { History, RotateCcw, Layers } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function HistoryPanel() {
  const { currentProject, restoreFromHistory } = useProjectStore()

  if (!currentProject) return null

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="font-semibold text-foreground">History</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Restore previous versions
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {currentProject.history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <History className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                No history yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Changes will appear here as you edit
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentProject.history.map((entry, index) => (
                <div
                  key={entry.id}
                  className="group flex items-start gap-3 rounded-lg border border-border bg-background p-3 transition-all hover:border-primary/50"
                >
                  <div className="relative flex flex-col items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                    {index < currentProject.history.length - 1 && (
                      <div className="mt-1 h-full w-px bg-border" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {entry.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Layers className="h-3 w-3" />
                      {entry.snapshot.length} section{entry.snapshot.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => restoreFromHistory(entry.id)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
