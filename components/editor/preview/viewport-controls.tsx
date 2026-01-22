import React from 'react'
import { Monitor, Tablet, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ViewportSize = 'desktop' | 'tablet' | 'mobile'

interface ViewportControlsProps {
  viewport: ViewportSize
  setViewport: (size: ViewportSize) => void
  showOnboarding: boolean
  hasLayout: boolean
  setShowOnboarding: (show: boolean) => void
}

export function ViewportControls({
  viewport,
  setViewport,
  showOnboarding,
  hasLayout,
  setShowOnboarding,
}: ViewportControlsProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2">
      <div className="flex items-center gap-1">
        <Button
          variant={viewport === 'desktop' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setViewport('desktop')}
        >
          <Monitor className="h-3.5 w-3.5" />
          <span className="text-xs">Desktop</span>
        </Button>
        <Button
          variant={viewport === 'tablet' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setViewport('tablet')}
        >
          <Tablet className="h-3.5 w-3.5" />
          <span className="text-xs">Tablet</span>
        </Button>
        <Button
          variant={viewport === 'mobile' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setViewport('mobile')}
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span className="text-xs">Mobile</span>
        </Button>
      </div>
      
      {showOnboarding && hasLayout && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setShowOnboarding(false)}
        >
          Hide Tips
        </Button>
      )}
    </div>
  )
}
