'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useProjectStore } from '@/lib/store'
import type { Component, LayoutSection, CollectionComponentData, CollectionItemData } from '@/lib/types'
import { saveImage, loadImage, deleteImage } from '@/lib/image-storage'
import { searchCollections, getCollectionById, getAllCollections, type Collection } from '@/lib/mock-collections'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Collection as CollectionUI,
  CollectionItem,
  CollectionItemImage,
  CollectionItemContent,
  CollectionItemTitle,
  CollectionItemSubtitle,
  CollectionItemCTA,
  CollectionItemBadge,
  CollectionHeader,
  CollectionTitle,
  CollectionAction,
} from '@/components/ui/collection'
import { Trash2, GripVertical, Pencil, Monitor, Tablet, Smartphone, Plus, GripHorizontal, Upload, Image as ImageIcon, MoveVertical, MoveHorizontal, Info, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Search, Grid2X2, LayoutList, X } from 'lucide-react'

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
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const [editingCollection, setEditingCollection] = useState<{ sectionId: string; component: Component } | null>(null)
  const [collectionSearchQuery, setCollectionSearchQuery] = useState('')
  const [collectionSearchResults, setCollectionSearchResults] = useState<Collection[]>([])
  const [editingCollectionData, setEditingCollectionData] = useState<CollectionComponentData | null>(null)
  
  // Resizing state
  const [resizingSection, setResizingSection] = useState<string | null>(null)
  const [resizingDivider, setResizingDivider] = useState<number | null>(null)
  const [resizingComponent, setResizingComponent] = useState<{ sectionId: string; componentId: string; direction: 'width' | 'height' } | null>(null)
  const [resizingSectionHeight, setResizingSectionHeight] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resizeAnimationFrameRef = useRef<number | null>(null)
  const pendingResizeRef = useRef<{x: number; y: number} | null>(null)

  // Load image URLs from IndexedDB on mount
  useEffect(() => {
    const loadAllImages = async () => {
      if (!currentProject) return
      
      const imageComponents = currentProject.layout.flatMap(section => 
        section.components.filter(c => c.type === 'image' && c.imageId)
      )
      
      const urls: Record<string, string> = {}
      await Promise.all(
        imageComponents.map(async (comp) => {
          if (comp.imageId) {
            const url = await loadImage(comp.imageId)
            if (url) urls[comp.imageId] = url
          }
        })
      )
      
      setImageUrls(urls)
    }
    
    loadAllImages()
  }, [currentProject?.id])

  // File upload handlers
  const handleFileUpload = async (file: File, sectionId: string, componentId: string) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, GIF, WebP)')
      return
    }

    // Check file size (warn if over 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      const shouldContinue = confirm(
        `This image is ${(file.size / 1024 / 1024).toFixed(1)}MB. It will be compressed to reduce storage usage. Continue?`
      )
      if (!shouldContinue) return
    }

    setUploadingImage(true)
    
    try {
      // Generate unique image ID
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      // Save to IndexedDB with compression
      const objectUrl = await saveImage(imageId, file)
      
      // Update component with image reference
      updateComponent(sectionId, componentId, { 
        imageId,
        content: file.name
      })
      
      // Store object URL for display
      setImageUrls(prev => ({ ...prev, [imageId]: objectUrl }))
      
      setImageUploadTarget(null)
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Failed to upload image. Please try a smaller file.')
    } finally {
      setUploadingImage(false)
    }
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
        collection: 'Collection',
      }

      const defaultCollectionData: CollectionComponentData = {
        layout: 'horizontal',
        sourceType: 'api',
        items: [],
        gap: '1rem',
        itemsPerRow: 4,
        showHeader: true,
        headerTitle: 'Shop Our Collections',
      }

      const newComponent: Component = {
        id: generateId(),
        type: componentType as Component['type'],
        content: defaultContent[componentType] || '',
        styles: {},
        props: columnIndex !== undefined ? { columnIndex } : undefined,
        width: componentType === 'image' ? '100%' : undefined,
        height: componentType === 'spacer' ? '4rem' : undefined,
        ...(componentType === 'collection' && { collectionData: defaultCollectionData }),
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
    
    // Store position for RAF processing
    pendingResizeRef.current = { x: e.clientX, y: e.clientY }
    
    // Use requestAnimationFrame for smooth, optimized updates
    if (resizeAnimationFrameRef.current === null) {
      resizeAnimationFrameRef.current = requestAnimationFrame(() => {
        if (!pendingResizeRef.current || !containerRef.current) {
          resizeAnimationFrameRef.current = null
          return
        }
        
        const { x } = pendingResizeRef.current
        const section = currentProject?.layout.find(s => s.id === resizingSection)
        if (!section || !section.columnWidths) {
          resizeAnimationFrameRef.current = null
          return
        }

        const sectionElement = containerRef.current.querySelector(`[data-section-id="${resizingSection}"]`)
        if (!sectionElement) {
          resizeAnimationFrameRef.current = null
          return
        }
        
        const sectionRect = sectionElement.getBoundingClientRect()
        const relativeX = x - sectionRect.left
        const sectionWidth = sectionRect.width
        
        // Calculate new widths as percentages
        const totalColumns = section.columns
        const percentage = Math.max(15, Math.min(85, (relativeX / sectionWidth) * 100))
        
        // For 2 columns, split at the divider position
        if (totalColumns === 2 && resizingDivider === 0) {
          const newWidths = [`${percentage}%`, `${100 - percentage}%`]
          updateSection(resizingSection, { columnWidths: newWidths }, true)
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
          updateSection(resizingSection, { columnWidths: newWidths }, true)
        }
        
        resizeAnimationFrameRef.current = null
      })
    }
  }, [resizingSection, resizingDivider, currentProject, updateSection])

  const handleResizeEnd = useCallback(() => {
    // Cancel any pending animation frame
    if (resizeAnimationFrameRef.current !== null) {
      cancelAnimationFrame(resizeAnimationFrameRef.current)
      resizeAnimationFrameRef.current = null
    }
    pendingResizeRef.current = null
    
    // Save to history when resize operation completes
    if (resizingSection || resizingComponent || resizingSectionHeight) {
      saveToHistory('Resized element')
    }
    
    setResizingSection(null)
    setResizingDivider(null)
    setResizingComponent(null)
    setResizingSectionHeight(null)
  }, [resizingSection, resizingComponent, resizingSectionHeight, saveToHistory])

  // Component resize handlers
  const handleComponentResizeStart = useCallback((e: React.MouseEvent, sectionId: string, componentId: string, direction: 'width' | 'height') => {
    e.preventDefault()
    e.stopPropagation()
    setResizingComponent({ sectionId, componentId, direction })
  }, [])

  const handleComponentResizeMove = useCallback((e: React.MouseEvent) => {
    if (!resizingComponent || !containerRef.current) return
    
    // Store position for RAF processing
    pendingResizeRef.current = { x: e.clientX, y: e.clientY }
    
    // Use requestAnimationFrame for smooth updates
    if (resizeAnimationFrameRef.current === null) {
      resizeAnimationFrameRef.current = requestAnimationFrame(() => {
        if (!pendingResizeRef.current) {
          resizeAnimationFrameRef.current = null
          return
        }
        
        const { x, y } = pendingResizeRef.current
        const section = currentProject?.layout.find(s => s.id === resizingComponent.sectionId)
        const component = section?.components.find(c => c.id === resizingComponent.componentId)
        if (!component) {
          resizeAnimationFrameRef.current = null
          return
        }

        const componentElement = document.querySelector(`[data-component-id="${resizingComponent.componentId}"]`)
        if (!componentElement) {
          resizeAnimationFrameRef.current = null
          return
        }

        const rect = componentElement.getBoundingClientRect()

        if (resizingComponent.direction === 'width') {
          const newWidth = Math.max(100, x - rect.left)
          updateComponent(resizingComponent.sectionId, resizingComponent.componentId, {
            width: `${newWidth}px`
          }, true)
        } else {
          const newHeight = Math.max(50, y - rect.top)
          updateComponent(resizingComponent.sectionId, resizingComponent.componentId, {
            height: `${newHeight}px`
          }, true)
        }
        
        resizeAnimationFrameRef.current = null
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
    
    // Store position for RAF processing
    pendingResizeRef.current = { x: e.clientX, y: e.clientY }
    
    // Use requestAnimationFrame for smooth updates
    if (resizeAnimationFrameRef.current === null) {
      resizeAnimationFrameRef.current = requestAnimationFrame(() => {
        if (!pendingResizeRef.current || !containerRef.current) {
          resizeAnimationFrameRef.current = null
          return
        }
        
        const { y } = pendingResizeRef.current
        const sectionElement = containerRef.current.querySelector(`[data-section-id="${resizingSectionHeight}"]`)
        if (!sectionElement) {
          resizeAnimationFrameRef.current = null
          return
        }

        const rect = sectionElement.getBoundingClientRect()
        const newHeight = Math.max(100, y - rect.top)
        updateSection(resizingSectionHeight, { minHeight: `${newHeight}px` }, true)
        
        resizeAnimationFrameRef.current = null
      })
    }
  }, [resizingSectionHeight, updateSection])

  const renderComponent = (component: Component, sectionId: string) => {
    const baseStyles = "relative group"
    const isResizing = resizingComponent?.componentId === component.id

    const componentContent = () => {
      switch (component.type) {
        case 'heading':
          return (
            <h2 
              className="text-2xl font-bold text-foreground"
              style={{
                fontWeight: component.formatting?.bold !== false ? 'bold' : 'normal',
                fontStyle: component.formatting?.italic ? 'italic' : 'normal',
                textDecoration: component.formatting?.underline ? 'underline' : 'none',
                textAlign: component.formatting?.align || 'left',
                fontSize: component.formatting?.fontSize || '1.5rem',
              }}
            >
              {component.content}
            </h2>
          )
        case 'paragraph':
          return (
            <p 
              className="leading-relaxed text-muted-foreground"
              style={{
                fontWeight: component.formatting?.bold ? 'bold' : 'normal',
                fontStyle: component.formatting?.italic ? 'italic' : 'normal',
                textDecoration: component.formatting?.underline ? 'underline' : 'none',
                textAlign: component.formatting?.align || 'left',
                fontSize: component.formatting?.fontSize || '1rem',
              }}
            >
              {component.content}
            </p>
          )
        case 'image':
          const imageUrl = component.imageId ? imageUrls[component.imageId] : null
          return (
            <div
              data-component-id={component.id}
              className={`relative overflow-hidden rounded-lg transition-all ${
                isDraggingFile ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              style={{
                width: component.width || '100%',
                height: component.height || (imageUrl ? 'auto' : '200px'),
                maxWidth: '100%',
                minHeight: imageUrl ? '200px' : '200px'
              }}
              onDrop={(e) => handleImageDrop(e, sectionId, component.id)}
              onDragOver={handleImageDragOver}
              onDragLeave={handleImageDragLeave}
            >
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={component.content}
                    className="h-full w-full object-contain"
                    style={{
                      maxHeight: component.height || '500px',
                      objectFit: 'contain'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setImageUploadTarget({ sectionId, componentId: component.id })}
                      disabled={uploadingImage}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Change Image
                    </Button>
                  </div>
                </>
              ) : uploadingImage && imageUploadTarget?.componentId === component.id ? (
                <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm font-medium text-foreground">Uploading & Compressing...</p>
                </div>
              ) : (
                <div 
                  className="flex h-full cursor-pointer flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground transition-colors hover:from-muted/80 hover:to-muted/30"
                  onClick={() => setImageUploadTarget({ sectionId, componentId: component.id })}
                >
                  <ImageIcon className="mb-2 h-12 w-12 opacity-50" />
                  <p className="text-sm font-medium">Click or drag image here</p>
                  <p className="mt-1 text-xs opacity-70">Supports JPG, PNG, GIF, WebP</p>
                  <p className="mt-1 text-xs opacity-50">Images are auto-compressed</p>
                </div>
              )}
              {/* Resize handles for images */}
              {imageUrl && (
                <>
                  {/* Corner resize handle */}
                  <div
                    className="absolute bottom-1 right-1 z-20 flex h-6 w-6 cursor-se-resize items-center justify-center rounded-sm bg-primary shadow-md opacity-0 transition-opacity hover:scale-110 group-hover:opacity-100"
                    onMouseDown={(e) => handleComponentResizeStart(e, sectionId, component.id, 'width')}
                  >
                    <MoveHorizontal className="h-4 w-4 rotate-45 text-white" />
                  </div>
                  {/* Side resize handle */}
                  <div
                    className="absolute bottom-1/2 right-0 z-20 flex h-12 w-3 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-l-md bg-primary/90 shadow-sm opacity-0 transition-all hover:w-4 group-hover:opacity-100"
                    onMouseDown={(e) => handleComponentResizeStart(e, sectionId, component.id, 'width')}
                  >
                    <MoveHorizontal className="h-4 w-4 text-white" />
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
                className="absolute bottom-0 left-1/2 z-20 flex h-3 w-16 -translate-x-1/2 cursor-ns-resize items-center justify-center rounded-t-md bg-primary/90 shadow-sm opacity-0 transition-all hover:h-4 group-hover:opacity-100"
                onMouseDown={(e) => handleComponentResizeStart(e, sectionId, component.id, 'height')}
              >
                <MoveVertical className="h-4 w-4 text-white" />
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
        case 'collection':
          const collectionData = component.collectionData
          const hasItems = collectionData && collectionData.items.length > 0
          return (
            <div className="w-full">
              {collectionData?.showHeader && collectionData.headerTitle && (
                <CollectionHeader>
                  <CollectionTitle>{collectionData.headerTitle}</CollectionTitle>
                  {collectionData.headerCtaText && (
                    <CollectionAction>
                      <a href={collectionData.headerCtaUrl || '#'} className="text-sm font-medium text-primary hover:underline">
                        {collectionData.headerCtaText}
                      </a>
                    </CollectionAction>
                  )}
                </CollectionHeader>
              )}
              {hasItems ? (
                <CollectionUI
                  layout={collectionData.layout}
                  itemsPerRow={collectionData.itemsPerRow || 4}
                  gap={collectionData.gap || '1rem'}
                >
                  {collectionData.items.map((item) => (
                    <CollectionItem key={item.id} layout={collectionData.layout}>
                      {item.badge && <CollectionItemBadge>{item.badge}</CollectionItemBadge>}
                      <CollectionItemImage src={item.image} alt={item.title} />
                      <CollectionItemContent>
                        <CollectionItemTitle>{item.title}</CollectionItemTitle>
                        {item.subtitle && <CollectionItemSubtitle>{item.subtitle}</CollectionItemSubtitle>}
                        <CollectionItemCTA href={item.ctaUrl}>{item.ctaText}</CollectionItemCTA>
                      </CollectionItemContent>
                    </CollectionItem>
                  ))}
                </CollectionUI>
              ) : (
                <div 
                  className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary hover:bg-muted/50"
                  onClick={() => {
                    setEditingCollection({ sectionId, component })
                    setEditingCollectionData(collectionData || {
                      layout: 'horizontal',
                      sourceType: 'api',
                      items: [],
                      gap: '1rem',
                      itemsPerRow: 4,
                      showHeader: true,
                      headerTitle: 'Shop Our Bestselling Collections',
                    })
                    setCollectionSearchQuery('')
                    setCollectionSearchResults(getAllCollections())
                  }}
                >
                  <Grid2X2 className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Click to configure collection</p>
                  <p className="mt-1 text-xs text-muted-foreground">Search or manually add items</p>
                </div>
              )}
            </div>
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
        style={{ minWidth: 0, maxWidth: '100%' }}
      >
        {componentContent()}
        <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              if (component.type === 'collection') {
                setEditingCollection({ sectionId, component })
                setEditingCollectionData(component.collectionData || {
                  layout: 'horizontal',
                  sourceType: 'api',
                  items: [],
                  gap: '1rem',
                  itemsPerRow: 4,
                  showHeader: true,
                  headerTitle: 'Shop Our Collections',
                })
                setCollectionSearchQuery('')
                setCollectionSearchResults(getAllCollections())
              } else {
                setEditingComponent({ sectionId, component })
              }
            }}
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
        minWidth: 0, // Prevents grid overflow
      }
    }
    
    const cols = section.columns || 1
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '0',
      minWidth: 0, // Prevents grid overflow
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
              style={{ minWidth: 0, overflow: 'hidden' }}
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
                    style={{ minWidth: 0, overflow: 'hidden' }}
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
                            className={`group/divider absolute top-8 bottom-0 z-10 flex w-6 -translate-x-1/2 cursor-col-resize items-center justify-center transition-colors ${
                              isResizing && resizingDivider === colIndex ? 'bg-primary/10' : 'hover:bg-primary/5'
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
                            <div className={`flex h-12 w-1.5 items-center justify-center rounded-full transition-all ${
                              isResizing && resizingDivider === colIndex 
                                ? 'bg-primary w-2' 
                                : 'bg-border group-hover/divider:bg-primary/70 group-hover/divider:w-2'
                            }`}>
                              <GripHorizontal className={`absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-90 transition-opacity ${
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
                className="absolute bottom-0 left-1/2 z-10 flex h-4 w-20 -translate-x-1/2 cursor-ns-resize items-center justify-center rounded-t-md bg-primary/10 opacity-0 transition-all hover:h-5 hover:bg-primary/20 group-hover/section:opacity-100"
                onMouseDown={(e) => handleSectionHeightResizeStart(e, section.id)}
              >
                <MoveVertical className={`h-4 w-4 transition-colors ${
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
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <div
              ref={containerRef}
              className={`mx-auto rounded-lg border border-border bg-background shadow-sm transition-all duration-300 ${
                resizingSection || resizingComponent || resizingSectionHeight ? 'select-none' : ''
              }`}
              style={{ 
                maxWidth: viewportWidths[viewport],
                width: '100%'
              }}
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
          </div>
        </ScrollArea>
      </div>

        {/* Edit Component Dialog */}
        <Dialog open={!!editingComponent} onOpenChange={() => setEditingComponent(null)}>
          <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {editingComponent?.component.type}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Rich Text Formatting Toolbar for text components */}
            {editingComponent?.component.type !== 'divider' &&
              editingComponent?.component.type !== 'spacer' &&
              editingComponent?.component.type !== 'image' &&
              editingComponent?.component.type !== 'button' && (
                <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-2">
                  <TooltipProvider>
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={editingComponent?.component.formatting?.bold ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              editingComponent &&
                              setEditingComponent({
                                ...editingComponent,
                                component: {
                                  ...editingComponent.component,
                                  formatting: {
                                    ...editingComponent.component.formatting,
                                    bold: !editingComponent.component.formatting?.bold,
                                  },
                                },
                              })
                            }
                          >
                            <Bold className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Bold</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={editingComponent?.component.formatting?.italic ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              editingComponent &&
                              setEditingComponent({
                                ...editingComponent,
                                component: {
                                  ...editingComponent.component,
                                  formatting: {
                                    ...editingComponent.component.formatting,
                                    italic: !editingComponent.component.formatting?.italic,
                                  },
                                },
                              })
                            }
                          >
                            <Italic className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Italic</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={editingComponent?.component.formatting?.underline ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              editingComponent &&
                              setEditingComponent({
                                ...editingComponent,
                                component: {
                                  ...editingComponent.component,
                                  formatting: {
                                    ...editingComponent.component.formatting,
                                    underline: !editingComponent.component.formatting?.underline,
                                  },
                                },
                              })
                            }
                          >
                            <Underline className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Underline</TooltipContent>
                      </Tooltip>
                    </div>

                    <div className="mx-1 h-8 w-px bg-border" />

                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={editingComponent?.component.formatting?.align === 'left' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              editingComponent &&
                              setEditingComponent({
                                ...editingComponent,
                                component: {
                                  ...editingComponent.component,
                                  formatting: {
                                    ...editingComponent.component.formatting,
                                    align: 'left',
                                  },
                                },
                              })
                            }
                          >
                            <AlignLeft className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Align Left</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={editingComponent?.component.formatting?.align === 'center' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              editingComponent &&
                              setEditingComponent({
                                ...editingComponent,
                                component: {
                                  ...editingComponent.component,
                                  formatting: {
                                    ...editingComponent.component.formatting,
                                    align: 'center',
                                  },
                                },
                              })
                            }
                          >
                            <AlignCenter className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Align Center</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={editingComponent?.component.formatting?.align === 'right' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              editingComponent &&
                              setEditingComponent({
                                ...editingComponent,
                                component: {
                                  ...editingComponent.component,
                                  formatting: {
                                    ...editingComponent.component.formatting,
                                    align: 'right',
                                  },
                                },
                              })
                            }
                          >
                            <AlignRight className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Align Right</TooltipContent>
                      </Tooltip>
                    </div>

                    <div className="mx-1 h-8 w-px bg-border" />

                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Size:</Label>
                      <select
                        value={editingComponent?.component.formatting?.fontSize || (editingComponent?.component.type === 'heading' ? '1.5rem' : '1rem')}
                        onChange={(e) =>
                          editingComponent &&
                          setEditingComponent({
                            ...editingComponent,
                            component: {
                              ...editingComponent.component,
                              formatting: {
                                ...editingComponent.component.formatting,
                                fontSize: e.target.value,
                              },
                            },
                          })
                        }
                        className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                      >
                        <option value="0.75rem">Small</option>
                        <option value="1rem">Normal</option>
                        <option value="1.25rem">Large</option>
                        <option value="1.5rem">X-Large</option>
                        <option value="2rem">2X-Large</option>
                        <option value="2.5rem">3X-Large</option>
                      </select>
                    </div>
                  </TooltipProvider>
                </div>
              )}

            {/* Content Input */}
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
                      rows={6}
                      className="font-inherit"
                      style={{
                        fontWeight: editingComponent.component.formatting?.bold ? 'bold' : 'normal',
                        fontStyle: editingComponent.component.formatting?.italic ? 'italic' : 'normal',
                        textDecoration: editingComponent.component.formatting?.underline ? 'underline' : 'none',
                        textAlign: editingComponent.component.formatting?.align || 'left',
                        fontSize: editingComponent.component.formatting?.fontSize || '1rem',
                      }}
                    />
                  ) : editingComponent?.component.type === 'heading' ? (
                    <Input
                      value={editingComponent?.component.content || ''}
                      onChange={(e) =>
                        editingComponent &&
                        setEditingComponent({
                          ...editingComponent,
                          component: { ...editingComponent.component, content: e.target.value },
                        })
                      }
                      placeholder="Enter heading..."
                      className="text-lg font-inherit"
                      style={{
                        fontWeight: editingComponent.component.formatting?.bold !== false ? 'bold' : 'normal',
                        fontStyle: editingComponent.component.formatting?.italic ? 'italic' : 'normal',
                        textDecoration: editingComponent.component.formatting?.underline ? 'underline' : 'none',
                        textAlign: editingComponent.component.formatting?.align || 'left',
                        fontSize: editingComponent.component.formatting?.fontSize || '1.5rem',
                      }}
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
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
          </DialogContent>
        </Dialog>

        {/* Image Upload Dialog */}
        <Dialog open={!!imageUploadTarget} onOpenChange={() => !uploadingImage && setImageUploadTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {uploadingImage ? (
                <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                  <div className="mb-3 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm font-medium text-foreground">Compressing image...</p>
                  <p className="mt-1 text-xs text-muted-foreground">This may take a moment for large files</p>
                </div>
              ) : (
                <>
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
                    <p className="mt-1 text-xs text-muted-foreground/70">Images will be automatically compressed</p>
                  </div>
                  <div className="rounded-lg bg-blue-500/10 p-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">💡 Tip:</p>
                    <p className="mt-1">Images are automatically resized to max 1920x1080 and compressed to save storage space.</p>
                  </div>
                </>
              )}
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
                <Button 
                  variant="outline" 
                  onClick={() => setImageUploadTarget(null)}
                  disabled={uploadingImage}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Collection Edit Dialog */}
        <Dialog 
          open={!!editingCollection} 
          onOpenChange={(open) => {
            if (!open) {
              setEditingCollection(null)
              setEditingCollectionData(null)
              setCollectionSearchQuery('')
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Configure Collection</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="search" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="search" className="gap-2">
                    <Search className="h-4 w-4" />
                    Search Collection
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="gap-2">
                    <LayoutList className="h-4 w-4" />
                    Manual Entry
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="search" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Search Collections</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Type to search collections..."
                        value={collectionSearchQuery}
                        onChange={(e) => {
                          setCollectionSearchQuery(e.target.value)
                          setCollectionSearchResults(searchCollections(e.target.value))
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {collectionSearchResults.map((collection) => (
                      <button
                        key={collection.id}
                        onClick={() => {
                          if (!editingCollectionData) return;
                          
                          const currentIds = editingCollectionData.collectionIds || (editingCollectionData.collectionId ? [editingCollectionData.collectionId] : []);
                          const isSelected = currentIds.includes(collection.id);
                          
                          let nextIds: string[];
                          if (isSelected) {
                            nextIds = currentIds.filter(id => id !== collection.id);
                          } else {
                            nextIds = [...currentIds, collection.id];
                          }
                          
                          // Fetch all selected collections to merge them
                          const selectedCollections = nextIds.map(id => getCollectionById(id)).filter(Boolean) as Collection[];
                          
                          // Map selected collections directly to items
                          const items: CollectionItemData[] = selectedCollections.map(col => ({
                            id: col.id,
                            title: col.name,
                            image: col.image,
                            ctaText: col.ctaText,
                            ctaUrl: col.ctaUrl,
                          }));
                          
                          setEditingCollectionData({
                            ...editingCollectionData,
                            sourceType: 'api',
                            collectionIds: nextIds,
                            collectionId: nextIds[0], // For backward compatibility
                            collectionName: selectedCollections.map(c => c.name).join(', '),
                            items,
                            headerTitle: 'Shop Our Bestselling Collections',
                            headerCtaText: undefined,
                            headerCtaUrl: undefined,
                          });
                        }}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all hover:border-primary hover:bg-accent ${
                          (editingCollectionData?.collectionIds?.includes(collection.id) || editingCollectionData?.collectionId === collection.id) ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          {collection.image && (
                            <img src={collection.image} alt={collection.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{collection.name}</div>
                          <div className="truncate text-xs text-muted-foreground">Category</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="manual" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Collection Items</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newItem: CollectionItemData = {
                            id: `item_${Date.now()}`,
                            title: 'New Item',
                            ctaText: 'Shop',
                            ctaUrl: '#',
                          }
                          setEditingCollectionData({
                            ...editingCollectionData!,
                            sourceType: 'manual',
                            items: [...(editingCollectionData?.items || []), newItem],
                          })
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </div>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {editingCollectionData?.items.map((item, index) => (
                        <div key={item.id} className="flex gap-3 rounded-lg border border-border p-3">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Item title"
                              value={item.title}
                              onChange={(e) => {
                                const newItems = [...(editingCollectionData?.items || [])]
                                newItems[index] = { ...newItems[index], title: e.target.value }
                                setEditingCollectionData({ ...editingCollectionData!, items: newItems })
                              }}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Image URL"
                                value={item.image || ''}
                                onChange={(e) => {
                                  const newItems = [...(editingCollectionData?.items || [])]
                                  newItems[index] = { ...newItems[index], image: e.target.value }
                                  setEditingCollectionData({ ...editingCollectionData!, items: newItems })
                                }}
                              />
                              <Input
                                placeholder="Subtitle (optional)"
                                value={item.subtitle || ''}
                                onChange={(e) => {
                                  const newItems = [...(editingCollectionData?.items || [])]
                                  newItems[index] = { ...newItems[index], subtitle: e.target.value }
                                  setEditingCollectionData({ ...editingCollectionData!, items: newItems })
                                }}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="CTA Text"
                                value={item.ctaText}
                                onChange={(e) => {
                                  const newItems = [...(editingCollectionData?.items || [])]
                                  newItems[index] = { ...newItems[index], ctaText: e.target.value }
                                  setEditingCollectionData({ ...editingCollectionData!, items: newItems })
                                }}
                              />
                              <Input
                                placeholder="CTA URL"
                                value={item.ctaUrl}
                                onChange={(e) => {
                                  const newItems = [...(editingCollectionData?.items || [])]
                                  newItems[index] = { ...newItems[index], ctaUrl: e.target.value }
                                  setEditingCollectionData({ ...editingCollectionData!, items: newItems })
                                }}
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              const newItems = editingCollectionData?.items.filter((_, i) => i !== index) || []
                              setEditingCollectionData({ ...editingCollectionData!, items: newItems })
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {(!editingCollectionData?.items || editingCollectionData.items.length === 0) && (
                        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border">
                          <p className="text-sm text-muted-foreground">No items yet. Click "Add Item" to start.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 space-y-4 border-t border-border pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Layout</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={editingCollectionData?.layout === 'horizontal' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setEditingCollectionData({ ...editingCollectionData!, layout: 'horizontal' })}
                        className="flex-1"
                      >
                        <LayoutList className="mr-2 h-4 w-4 rotate-90" />
                        Horizontal
                      </Button>
                      <Button
                        variant={editingCollectionData?.layout === 'vertical' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setEditingCollectionData({ ...editingCollectionData!, layout: 'vertical' })}
                        className="flex-1"
                      >
                        <Grid2X2 className="mr-2 h-4 w-4" />
                        Grid
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Items Per Row (Grid)</Label>
                    <div className="flex gap-2">
                      {[2, 3, 4, 5, 6].map((num) => (
                        <Button
                          key={num}
                          variant={editingCollectionData?.itemsPerRow === num ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEditingCollectionData({ ...editingCollectionData!, itemsPerRow: num })}
                          className="flex-1"
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Header Settings</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showHeader"
                      checked={editingCollectionData?.showHeader ?? true}
                      onChange={(e) => setEditingCollectionData({ ...editingCollectionData!, showHeader: e.target.checked })}
                      className="h-4 w-4 rounded border-border"
                    />
                    <label htmlFor="showHeader" className="text-sm">Show header</label>
                  </div>
                  {editingCollectionData?.showHeader && (
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Header title"
                        value={editingCollectionData?.headerTitle || ''}
                        onChange={(e) => setEditingCollectionData({ ...editingCollectionData!, headerTitle: e.target.value })}
                      />
                      <Input
                        placeholder="CTA text (optional)"
                        value={editingCollectionData?.headerCtaText || ''}
                        onChange={(e) => setEditingCollectionData({ ...editingCollectionData!, headerCtaText: e.target.value })}
                      />
                      <Input
                        placeholder="CTA URL"
                        value={editingCollectionData?.headerCtaUrl || ''}
                        onChange={(e) => setEditingCollectionData({ ...editingCollectionData!, headerCtaUrl: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 border-t border-border pt-4 mt-4">
              <Button variant="outline" onClick={() => {
                setEditingCollection(null)
                setEditingCollectionData(null)
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (editingCollection && editingCollectionData) {
                  updateComponent(
                    editingCollection.sectionId,
                    editingCollection.component.id,
                    { collectionData: editingCollectionData }
                  )
                  setEditingCollection(null)
                  setEditingCollectionData(null)
                }
              }}>
                Save Collection
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
