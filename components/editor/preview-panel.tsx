'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useProjectStore } from '@/lib/store'
import type { Component, LayoutSection } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Trash2, GripVertical, Pencil, Monitor, Tablet, Smartphone, Plus, GripHorizontal, Upload, Image as ImageIcon, MoveVertical, MoveHorizontal, Info } from 'lucide-react'

const generateId = () => Math.random().toString(36).substring(2, 9)

type ViewportSize = 'desktop' | 'tablet' | 'mobile'

const viewportWidths: Record<ViewportSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
}

export function PreviewPanel() {
  const { currentProject, addComponent, removeComponent, updateComponent, moveComponent, removeSection, updateSection, saveToHistory } = useProjectStore()
  const [editingComponent, setEditingComponent] = useState<{ sectionId: string; component: Component } | null>(null)
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [dragOverSection, setDragOverSection] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null)
  const [imageUploadTarget, setImageUploadTarget] = useState<{ sectionId: string; componentId: string } | null>(null)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)
  
  // Resizing state
  const [resizingSection, setResizingSection] = useState<string | null>(null)
  const [resizingDivider, setResizingDivider] = useState<number | null>(null)
  const [resizingComponent, setResizingComponent] = useState<{ sectionId: string; componentId: string; direction: 'width' | 'height' } | null>(null)
  const [resizingSectionHeight, setResizingSectionHeight] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // File upload handlers
  const handleFileUpload = (file: File, sectionId: string, componentId: string) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      updateComponent(sectionId, componentId, { 
        imageUrl,
        content: file.name
      })
      setImageUploadTarget(null)
    }
    reader.readAsDataURL(file)
  }

  const handleImageDrop = (e: React.DragEvent, sectionId: string, componentId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file, sectionId, componentId)
    }
  }

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(true)
  }

  const handleImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFile(false)
  }

  const handleDrop = (e: React.DragEvent, sectionId: string, columnIndex?: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverSection(null)
    setDragOverColumn(null)

    const componentType = e.dataTransfer.getData('componentType')
    const draggedComponentId = e.dataTransfer.getData('componentId')
    const fromSectionId = e.dataTransfer.getData('fromSectionId')

    if (componentType) {
      const defaultContent: Record<string, string> = {
        heading: 'Your Heading Here',
        paragraph: 'This is a paragraph. Click to edit and add your own content.',
        image: 'Image Placeholder',
        button: 'Click Me',
        divider: '',
        spacer: '',
        card: 'Card Title',
        list: 'Item 1, Item 2, Item 3',
      }

      const newComponent: Component = {
        id: generateId(),
        type: componentType as Component['type'],
        content: defaultContent[componentType] || '',
        styles: {},
        props: columnIndex !== undefined ? { columnIndex } : undefined,
        width: componentType === 'image' ? '100%' : undefined,
        height: componentType === 'spacer' ? '4rem' : undefined,
      }

      addComponent(sectionId, newComponent)
      
      // Hide onboarding after first interaction
      if (showOnboarding) setShowOnboarding(false)
    } else if (draggedComponentId && fromSectionId) {
      const section = currentProject?.layout.find((s) => s.id === sectionId)
      const newIndex = section?.components.length || 0
      moveComponent(fromSectionId, sectionId, draggedComponentId, newIndex)
    }
  }

  const handleDragOver = (e: React.DragEvent, sectionId: string, columnIndex?: number) => {
    e.preventDefault()
    setDragOverSection(sectionId)
    if (columnIndex !== undefined) setDragOverColumn(columnIndex)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverSection(null)
    setDragOverColumn(null)
  }

  const handleComponentDragStart = (e: React.DragEvent, sectionId: string, componentId: string) => {
    e.dataTransfer.setData('componentId', componentId)
    e.dataTransfer.setData('fromSectionId', sectionId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleSaveEdit = () => {
    if (!editingComponent) return
    updateComponent(
      editingComponent.sectionId,
      editingComponent.component.id,
      editingComponent.component
    )
    setEditingComponent(null)
  }

  // Column resizing handlers
  const handleResizeStart = useCallback((sectionId: string, dividerIndex: number, e: React.MouseEvent) => {
    e.preventDefault()
    setResizingSection(sectionId)
    setResizingDivider(dividerIndex)
  }, [])

  const handleResizeMove = useCallback((e: React.MouseEvent) => {
    if (!resizingSection || resizingDivider === null || !containerRef.current) return
    
    const section = currentProject?.layout.find(s => s.id === resizingSection)
    if (!section || !section.columnWidths) return

    const sectionElement = containerRef.current.querySelector(`[data-section-id="${resizingSection}"]`)
    if (!sectionElement) return
    
    const sectionRect = sectionElement.getBoundingClientRect()
    const relativeX = e.clientX - sectionRect.left
    const sectionWidth = sectionRect.width
    
    // Calculate new widths as percentages
    const totalColumns = section.columns
    const percentage = Math.max(15, Math.min(85, (relativeX / sectionWidth) * 100))
    
    // For 2 columns, split at the divider position
    if (totalColumns === 2 && resizingDivider === 0) {
      const newWidths = [`${percentage}%`, `${100 - percentage}%`]
      updateSection(resizingSection, { columnWidths: newWidths }, true) // Skip history during resize
    }
    // For 3+ columns, adjust adjacent columns
    else if (totalColumns > 2) {
      const colWidth = sectionWidth / totalColumns
      const targetPercentage = ((resizingDivider + 1) * colWidth / sectionWidth) * 100
      const diff = percentage - targetPercentage
      
      const newWidths = section.columnWidths.map((w, i) => {
        const currentVal = parseFloat(w) || (100 / totalColumns)
        if (i === resizingDivider) return `${currentVal + diff}%`
        if (i === resizingDivider + 1) return `${Math.max(15, currentVal - diff)}%`
        return w
      })
      updateSection(resizingSection, { columnWidths: newWidths }, true) // Skip history during resize
    }
  }, [resizingSection, resizingDivider, currentProject, updateSection])

  const handleResizeEnd = useCallback(() => {
    setResizingSection(null)
    setResizingDivider(null)
    setResizingComponent(null)
    setResizingSectionHeight(null)
  }, [])

  // Component resize handlers
  const handleComponentResizeStart = useCallback((e: React.MouseEvent, sectionId: string, componentId: string, direction: 'width' | 'height') => {
    e.preventDefault()
    e.stopPropagation()
    setResizingComponent({ sectionId, componentId, direction })
  }, [])

  const handleComponentResizeMove = useCallback((e: React.MouseEvent) => {
    if (!resizingComponent || !containerRef.current) return
    
    const section = currentProject?.layout.find(s => s.id === resizingComponent.sectionId)
    const component = section?.components.find(c => c.id === resizingComponent.componentId)
    if (!component) return

    const componentElement = document.querySelector(`[data-component-id="${resizingComponent.componentId}"]`)
    if (!componentElement) return

    const rect = componentElement.getBoundingClientRect()

    if (resizingComponent.direction === 'width') {
      const newWidth = Math.max(100, e.clientX - rect.left)
      updateComponent(resizingComponent.sectionId, resizingComponent.componentId, {
        width: `${newWidth}px`
      })
    } else {
      const newHeight = Math.max(50, e.clientY - rect.top)
      updateComponent(resizingComponent.sectionId, resizingComponent.componentId, {
        height: `${newHeight}px`
      })
    }
  }, [resizingComponent, currentProject, updateComponent])

  // Section height resize handlers
  const handleSectionHeightResizeStart = useCallback((e: React.MouseEvent, sectionId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingSectionHeight(sectionId)
  }, [])

  const handleSectionHeightResizeMove = useCallback((e: React.MouseEvent) => {
    if (!resizingSectionHeight || !containerRef.current) return
    
    const sectionElement = containerRef.current.querySelector(`[data-section-id="${resizingSectionHeight}"]`)
    if (!sectionElement) return

    const rect = sectionElement.getBoundingClientRect()
    const newHeight = Math.max(100, e.clientY - rect.top)
    updateSection(resizingSectionHeight, { minHeight: `${newHeight}px` })
  }, [resizingSectionHeight, updateSection])

  const renderComponent = (component: Component, sectionId: string) => {
    const baseStyles = "relative group"
    const isResizing = resizingComponent?.componentId === component.id

    const componentContent = () => {
      switch (component.type) {
        case 'heading':
          return (
            <h2 className="text-2xl font-bold text-foreground">
              {component.content}
            </h2>
          )
        case 'paragraph':
          return (
            <p className="leading-relaxed text-muted-foreground">
              {component.content}
            </p>
          )
        case 'image':
          return (
            <div
              data-component-id={component.id}
              className={`relative overflow-hidden rounded-lg transition-all ${
                isDraggingFile ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              style={{
                width: component.width || '100%',
                height: component.height || 'auto',
                minHeight: component.imageUrl ? 'auto' : '200px'
              }}
              onDrop={(e) => handleImageDrop(e, sectionId, component.id)}
              onDragOver={handleImageDragOver}
              onDragLeave={handleImageDragLeave}
            >
              {component.imageUrl ? (
                <>
                  <img
                    src={component.imageUrl}
                    alt={component.content}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setImageUploadTarget({ sectionId, componentId: component.id })}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Change Image
                    </Button>
                  </div>
                </>
              ) : (
                <div 
                  className="flex h-full cursor-pointer flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground transition-colors hover:from-muted/80 hover:to-muted/30"
                  onClick={() => setImageUploadTarget({ sectionId, componentId: component.id })}
                >
                  <ImageIcon className="mb-2 h-12 w-12 opacity-50" />
                  <p className="text-sm font-medium">Click or drag image here</p>
                  <p className="mt-1 text-xs opacity-70">Supports JPG, PNG, GIF, WebP</p>
                </div>
              )}
              {/* Resize handles for images */}
              {component.imageUrl && (
                <>
                  <div
                    className="absolute bottom-0 right-0 z-20 h-3 w-3 cursor-se-resize rounded-tl-sm bg-primary opacity-0 transition-opacity group-hover:opacity-100"
                    onMouseDown={(e) => handleComponentResizeStart(e, sectionId, component.id, 'width')}
                  />
                  <div
                    className="absolute bottom-1/2 right-0 z-20 h-6 w-2 -translate-y-1/2 cursor-ew-resize rounded-l-sm bg-primary/70 opacity-0 transition-opacity group-hover:opacity-100"
                    onMouseDown={(e) => handleComponentResizeStart(e, sectionId, component.id, 'width')}
                  >
                    <MoveHorizontal className="h-full w-full text-white p-0.5" />
                  </div>
                </>
              )}
            </div>
          )
        case 'button':
          return (
            <button className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              {component.content}
            </button>
          )
        case 'divider':
          return <hr className="border-border" />
        case 'spacer':
          return (
            <div 
              className="relative flex items-center justify-center border-2 border-dashed border-transparent transition-colors group-hover:border-muted-foreground/20"
              style={{ height: component.height || '4rem' }}
              data-component-id={component.id}
            >
              <span className="text-xs text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100">
                Spacer ({component.height || '4rem'})
              </span>
              {/* Height resize handle */}
              <div
                className="absolute bottom-0 left-1/2 z-20 h-2 w-12 -translate-x-1/2 cursor-ns-resize rounded-t-sm bg-primary/70 opacity-0 transition-opacity group-hover:opacity-100"
                onMouseDown={(e) => handleComponentResizeStart(e, sectionId, component.id, 'height')}
              >
                <MoveVertical className="h-full w-full text-white" />
              </div>
            </div>
          )
        case 'card':
          return (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-foreground">{component.content}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Card content goes here. Click to edit.
              </p>
            </div>
          )
        case 'list':
          return (
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              {component.content.split(',').map((item, i) => (
                <li key={i}>{item.trim()}</li>
              ))}
            </ul>
          )
        default:
          return <div>{component.content}</div>
      }
    }

    return (
      <div
        key={component.id}
        draggable
        onDragStart={(e) => handleComponentDragStart(e, sectionId, component.id)}
        className={`${baseStyles} cursor-move rounded-lg border border-transparent p-3 transition-all hover:border-border hover:bg-accent/50 ${
          isResizing ? 'ring-2 ring-primary' : ''
        }`}
      >
        {componentContent()}
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            onClick={() => setEditingComponent({ sectionId, component })}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            onClick={() => removeComponent(sectionId, component.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-muted-foreground">
            <GripVertical className="h-3 w-3" />
          </div>
        </div>
      </div>
    )
  }

  const getGridStyle = (section: LayoutSection): React.CSSProperties => {
    if (viewport === 'mobile') {
      return {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }
    }
    
    if (section.columnWidths && section.columnWidths.length > 0) {
      return {
        display: 'grid',
        gridTemplateColumns: section.columnWidths.join(' '),
        gap: '0',
      }
    }
    
    const cols = section.columns || 1
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '0',
    }
  }

  const renderSection = (section: LayoutSection, index: number) => {
    const isDragOver = dragOverSection === section.id
    const isHeroSection = section.layoutType === 'hero'
    const isResizing = resizingSection === section.id
    const isResizingHeight = resizingSectionHeight === section.id
    
    // Group components by column
    const componentsByColumn: Record<number, Component[]> = {}
    for (let i = 0; i < section.columns; i++) {
      componentsByColumn[i] = []
    }
    section.components.forEach((comp) => {
      const colIndex = (comp.props?.columnIndex as number) ?? 0
      const targetCol = Math.min(colIndex, section.columns - 1)
      if (!componentsByColumn[targetCol]) componentsByColumn[targetCol] = []
      componentsByColumn[targetCol].push(comp)
    })

    const isEmpty = section.components.length === 0

    return (
      <section
        key={section.id}
        data-section-id={section.id}
        className={`group/section relative rounded-lg border transition-all ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/30'
        } ${isHeroSection ? 'min-h-48 bg-gradient-to-br from-muted/30 to-muted/10' : 'bg-background'} ${
          isResizingHeight ? 'ring-2 ring-primary' : ''
        }`}
        style={{ 
          backgroundColor: section.backgroundColor,
          minHeight: section.minHeight || 'auto'
        }}
      >
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {section.name || `Section ${index + 1}`}
              <span className="ml-2 opacity-60">
                {section.columns} col{section.columns > 1 ? 's' : ''}
              </span>
            </span>
            {isEmpty && showOnboarding && (
              <TooltipProvider>
                <Tooltip open={true}>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-primary animate-pulse" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-xs">
                      👋 Drag elements from the <strong>Elements</strong> tab or click them to add here!
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 transition-opacity group-hover/section:opacity-100"
            onClick={() => removeSection(section.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Section Content with Resizable Columns */}
        <div 
          className="relative p-2" 
          style={getGridStyle(section)}
        >
          {section.columns === 1 ? (
            // Single column
            <div
              onDrop={(e) => handleDrop(e, section.id)}
              onDragOver={(e) => handleDragOver(e, section.id)}
              onDragLeave={handleDragLeave}
              className={`min-h-20 rounded-md border border-dashed p-2 transition-all ${
                isDragOver ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border'
              }`}
            >
              {section.components.length === 0 ? (
                <div className="flex h-16 flex-col items-center justify-center text-xs text-muted-foreground">
                  <Plus className="mb-1 h-5 w-5" />
                  <span>Drop elements here</span>
                  <span className="mt-0.5 text-[10px] opacity-70">or click elements in the panel</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {section.components.map((comp) => renderComponent(comp, section.id))}
                </div>
              )}
            </div>
          ) : (
            // Multi-column layout with resizable dividers
            <>
              {Array.from({ length: section.columns }).map((_, colIndex) => (
                <React.Fragment key={colIndex}>
                  <div
                    onDrop={(e) => handleDrop(e, section.id, colIndex)}
                    onDragOver={(e) => handleDragOver(e, section.id, colIndex)}
                    onDragLeave={handleDragLeave}
                    className={`min-h-20 rounded-md border border-dashed p-2 transition-all ${
                      isDragOver && dragOverColumn === colIndex
                        ? 'border-primary bg-primary/5'
                        : 'border-border/40 hover:border-border'
                    }`}
                  >
                    {componentsByColumn[colIndex]?.length === 0 ? (
                      <div className="flex h-16 flex-col items-center justify-center text-xs text-muted-foreground">
                        <Plus className="mb-1 h-4 w-4" />
                        <span>Col {colIndex + 1}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {componentsByColumn[colIndex]?.map((comp) => renderComponent(comp, section.id))}
                      </div>
                    )}
                  </div>
                  
                  {/* Resizable Divider */}
                  {colIndex < section.columns - 1 && viewport !== 'mobile' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`group/divider absolute top-8 bottom-0 z-10 flex w-4 -translate-x-1/2 cursor-col-resize items-center justify-center transition-colors ${
                              isResizing && resizingDivider === colIndex ? 'bg-primary/10' : 'hover:bg-muted/30'
                            }`}
                            style={{
                              left: section.columnWidths 
                                ? `calc(${section.columnWidths.slice(0, colIndex + 1).reduce((acc, w) => {
                                    const val = parseFloat(w)
                                    return acc + (isNaN(val) ? 100 / section.columns : val)
                                  }, 0)}%)`
                                : `${((colIndex + 1) / section.columns) * 100}%`
                            }}
                            onMouseDown={(e) => handleResizeStart(section.id, colIndex, e)}
                          >
                            <div className={`h-8 w-1 rounded-full transition-all ${
                              isResizing && resizingDivider === colIndex 
                                ? 'bg-primary' 
                                : 'bg-border group-hover/divider:bg-primary/60'
                            }`}>
                              <GripHorizontal className={`absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-90 transition-opacity ${
                                isResizing && resizingDivider === colIndex 
                                  ? 'text-primary opacity-100' 
                                  : 'text-muted-foreground opacity-0 group-hover/divider:opacity-100'
                              }`} />
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Drag to resize columns</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </React.Fragment>
              ))}
            </>
          )}
        </div>

        {/* Section Height Resize Handle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute bottom-0 left-1/2 z-10 h-3 w-16 -translate-x-1/2 cursor-ns-resize rounded-t-md bg-primary/0 opacity-0 transition-all hover:bg-primary/10 group-hover/section:opacity-100"
                onMouseDown={(e) => handleSectionHeightResizeStart(e, section.id)}
              >
                <MoveVertical className={`absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transition-colors ${
                  isResizingHeight ? 'text-primary' : 'text-muted-foreground'
                }`} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Drag to adjust section height</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </section>
    )
  }

  return (
    <TooltipProvider>
      <div 
        className="flex h-full flex-col bg-muted/20"
        onMouseMove={(e) => {
          if (resizingSection) handleResizeMove(e)
          if (resizingComponent) handleComponentResizeMove(e)
          if (resizingSectionHeight) handleSectionHeightResizeMove(e)
        }}
        onMouseUp={handleResizeEnd}
        onMouseLeave={handleResizeEnd}
      >
        {/* Viewport Controls */}
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
          
          {showOnboarding && currentProject && currentProject.layout.length > 0 && (
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

        {/* Preview Area */}
        <ScrollArea className="flex-1 p-4">
          <div
            ref={containerRef}
            className={`mx-auto rounded-lg border border-border bg-background shadow-sm transition-all duration-300 ${
              resizingSection || resizingComponent || resizingSectionHeight ? 'select-none' : ''
            }`}
            style={{ maxWidth: viewportWidths[viewport] }}
          >
            <div className="p-4">
              {!currentProject || currentProject.layout.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <div className="mb-3 rounded-full bg-muted p-3">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">Start Building</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add sections from the <strong>Sections</strong> tab on the left
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    💡 Tip: Click any section template to add it
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentProject.layout.map((section, index) =>
                    renderSection(section, index)
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Edit Component Dialog */}
        <Dialog open={!!editingComponent} onOpenChange={() => setEditingComponent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Edit {editingComponent?.component.type}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {editingComponent?.component.type !== 'divider' &&
                editingComponent?.component.type !== 'spacer' && (
                  <>
                    {editingComponent?.component.type === 'paragraph' ? (
                      <Textarea
                        value={editingComponent.component.content}
                        onChange={(e) =>
                          setEditingComponent({
                            ...editingComponent,
                            component: { ...editingComponent.component, content: e.target.value },
                          })
                        }
                        placeholder="Enter content..."
                        rows={4}
                      />
                    ) : (
                      <Input
                        value={editingComponent?.component.content || ''}
                        onChange={(e) =>
                          editingComponent &&
                          setEditingComponent({
                            ...editingComponent,
                            component: { ...editingComponent.component, content: e.target.value },
                          })
                        }
                        placeholder="Enter content..."
                      />
                    )}
                  </>
                )}
              {editingComponent?.component.type === 'spacer' && (
                <div className="space-y-2">
                  <Label>Height</Label>
                  <Input
                    value={editingComponent.component.height || '4rem'}
                    onChange={(e) =>
                      setEditingComponent({
                        ...editingComponent,
                        component: { ...editingComponent.component, height: e.target.value },
                      })
                    }
                    placeholder="e.g., 4rem, 100px"
                  />
                  <p className="text-xs text-muted-foreground">Use units like rem, px, vh</p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingComponent(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Upload Dialog */}
        <Dialog open={!!imageUploadTarget} onOpenChange={() => setImageUploadTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div
                className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file && imageUploadTarget) {
                    handleFileUpload(file, imageUploadTarget.sectionId, imageUploadTarget.componentId)
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <Upload className="mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Drop image here or click to browse</p>
                <p className="mt-1 text-xs text-muted-foreground">Supports JPG, PNG, GIF, WebP</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file && imageUploadTarget) {
                    handleFileUpload(file, imageUploadTarget.sectionId, imageUploadTarget.componentId)
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setImageUploadTarget(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
