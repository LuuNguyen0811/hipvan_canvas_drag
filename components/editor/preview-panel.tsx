'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useProjectStore } from '@/lib/store'
import type { Component, LayoutSection, CollectionComponentData } from '@/lib/types'
import { saveImage, loadImage } from '@/lib/image-storage'
import { getAllCollections } from '@/lib/mock-collections'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus } from 'lucide-react'

// Internal Sub-components
import { ViewportControls, type ViewportSize } from './preview/viewport-controls'
import { SectionRenderer } from './preview/section-renderer'
import { ComponentRenderer } from './preview/component-renderer'
import { EditComponentDialog } from './preview/dialogs/edit-component-dialog'
import { ImageUploadDialog } from './preview/dialogs/image-upload-dialog'
import { CollectionEditDialog } from './preview/dialogs/collection-edit-dialog'

const generateId = () => Math.random().toString(36).substring(2, 9)

const viewportWidths: Record<ViewportSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
}

export function PreviewPanel() {
  const { 
    currentProject, 
    addComponent, 
    removeComponent, 
    updateComponent, 
    moveComponent, 
    reorderCollectionItems, 
    removeSection, 
    updateSection, 
    saveToHistory 
  } = useProjectStore()

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
  const [collectionSearchResults, setCollectionSearchResults] = useState<any[]>([])
  const [editingCollectionData, setEditingCollectionData] = useState<CollectionComponentData | null>(null)
  const [draggingCollectionItemIndex, setDraggingCollectionItemIndex] = useState<{ sectionId: string; componentId: string; index: number } | null>(null)
  
  // Resizing state
  const [resizingSection, setResizingSection] = useState<string | null>(null)
  const [resizingDivider, setResizingDivider] = useState<number | null>(null)
  const [resizingComponent, setResizingComponent] = useState<{ sectionId: string; componentId: string; direction: 'width' | 'height' } | null>(null)
  const [resizingSectionHeight, setResizingSectionHeight] = useState<string | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
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

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      const shouldContinue = confirm(
        `This image is ${(file.size / 1024 / 1024).toFixed(1)}MB. It will be compressed to reduce storage usage. Continue?`
      )
      if (!shouldContinue) return
    }

    setUploadingImage(true)
    
    try {
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`
      const objectUrl = await saveImage(imageId, file)
      
      updateComponent(sectionId, componentId, { 
        imageId,
        content: file.name
      })
      
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

  const handleCollectionItemDragStart = (e: React.DragEvent, sectionId: string, componentId: string, itemIndex: number) => {
    e.stopPropagation()
    e.dataTransfer.setData('collectionItemIndex', itemIndex.toString())
    e.dataTransfer.setData('sectionId', sectionId)
    e.dataTransfer.setData('componentId', componentId)
    e.dataTransfer.effectAllowed = 'move'
    
    setDraggingCollectionItemIndex({ sectionId, componentId, index: itemIndex })
    
    setTimeout(() => {
      const target = e.target as HTMLElement;
      if (target) target.style.opacity = '0.2';
    }, 0);
  }

  const handleCollectionItemDragOver = (e: React.DragEvent, sectionId: string, componentId: string, hoverIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'

    if (!draggingCollectionItemIndex) return;
    
    const { sectionId: sourceSectionId, componentId: sourceComponentId, index: draggedIndex } = draggingCollectionItemIndex;
    
    if (sourceSectionId === sectionId && sourceComponentId === componentId && draggedIndex !== hoverIndex) {
      reorderCollectionItems(sectionId, componentId, draggedIndex, hoverIndex);
      setDraggingCollectionItemIndex({ sectionId, componentId, index: hoverIndex });
    }
  }

  const handleCollectionItemDragEnd = (e: React.DragEvent) => {
    setDraggingCollectionItemIndex(null);
    const target = e.target as HTMLElement;
    if (target) target.style.opacity = '';
  }

  const handleCollectionItemDrop = (e: React.DragEvent, sectionId: string, componentId: string, targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingCollectionItemIndex(null);
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

  const handleSaveCollection = () => {
    if (!editingCollection || !editingCollectionData) return
    updateComponent(
      editingCollection.sectionId,
      editingCollection.component.id,
      { collectionData: editingCollectionData }
    )
    setEditingCollection(null)
    setEditingCollectionData(null)
  }

  const handleResizeStart = useCallback((sectionId: string, dividerIndex: number, e: React.MouseEvent) => {
    e.preventDefault()
    setResizingSection(sectionId)
    setResizingDivider(dividerIndex)
  }, [])

  const handleResizeMove = useCallback((e: React.MouseEvent) => {
    if (!resizingSection || resizingDivider === null || !containerRef.current) return
    pendingResizeRef.current = { x: e.clientX, y: e.clientY }
    
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
        const percentage = Math.max(15, Math.min(85, (relativeX / sectionWidth) * 100))
        
        if (section.columns === 2 && resizingDivider === 0) {
          const newWidths = [`${percentage}%`, `${100 - percentage}%`]
          updateSection(resizingSection, { columnWidths: newWidths }, true)
        } else if (section.columns > 2) {
          const colWidth = sectionWidth / section.columns
          const targetPercentage = ((resizingDivider + 1) * colWidth / sectionWidth) * 100
          const diff = percentage - targetPercentage
          
          const newWidths = section.columnWidths.map((w, i) => {
            const currentVal = parseFloat(w) || (100 / section.columns)
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

  const handleComponentResizeStart = useCallback((e: React.MouseEvent, sectionId: string, componentId: string, direction: 'width' | 'height') => {
    e.preventDefault()
    e.stopPropagation()
    setResizingComponent({ sectionId, componentId, direction })
  }, [])

  const handleComponentResizeMove = useCallback((e: React.MouseEvent) => {
    if (!resizingComponent || !containerRef.current) return
    pendingResizeRef.current = { x: e.clientX, y: e.clientY }
    
    if (resizeAnimationFrameRef.current === null) {
      resizeAnimationFrameRef.current = requestAnimationFrame(() => {
        if (!pendingResizeRef.current) {
          resizeAnimationFrameRef.current = null
          return
        }
        
        const { x, y } = pendingResizeRef.current
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
  }, [resizingComponent, updateComponent])

  const handleSectionHeightResizeStart = useCallback((e: React.MouseEvent, sectionId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingSectionHeight(sectionId)
  }, [])

  const handleSectionHeightResizeMove = useCallback((e: React.MouseEvent) => {
    if (!resizingSectionHeight || !containerRef.current) return
    pendingResizeRef.current = { x: e.clientX, y: e.clientY }
    
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

  const handleResizeEnd = useCallback(() => {
    if (resizeAnimationFrameRef.current !== null) {
      cancelAnimationFrame(resizeAnimationFrameRef.current)
      resizeAnimationFrameRef.current = null
    }
    pendingResizeRef.current = null
    
    if (resizingSection || resizingComponent || resizingSectionHeight) {
      saveToHistory('Resized element')
    }
    
    setResizingSection(null)
    setResizingDivider(null)
    setResizingComponent(null)
    setResizingSectionHeight(null)
  }, [resizingSection, resizingComponent, resizingSectionHeight, saveToHistory])

  const getGridStyle = (section: LayoutSection): React.CSSProperties => {
    if (viewport === 'mobile') {
      return { display: 'flex', flexDirection: 'column', gap: '1rem' }
    }
    
    if (section.columnWidths && section.columnWidths.length > 0) {
      return {
        display: 'grid',
        gridTemplateColumns: section.columnWidths.join(' '),
        gap: '0',
        minWidth: 0,
      }
    }
    
    const cols = section.columns || 1
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '0',
      minWidth: 0,
    }
  }

  return (
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
      <ViewportControls 
        viewport={viewport}
        setViewport={setViewport}
        showOnboarding={showOnboarding}
        hasLayout={!!currentProject && currentProject.layout.length > 0}
        setShowOnboarding={setShowOnboarding}
      />

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
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentProject.layout.map((section, index) => (
                      <SectionRenderer 
                        key={section.id}
                        section={section}
                        index={index}
                        viewport={viewport}
                        dragOverSection={dragOverSection}
                        dragOverColumn={dragOverColumn}
                        isResizing={resizingSection === section.id}
                        resizingDivider={resizingDivider}
                        isResizingHeight={resizingSectionHeight === section.id}
                        handleDrop={handleDrop}
                        handleDragOver={handleDragOver}
                        handleDragLeave={handleDragLeave}
                        handleResizeStart={handleResizeStart}
                        handleSectionHeightResizeStart={handleSectionHeightResizeStart}
                        removeSection={removeSection}
                        getGridStyle={getGridStyle}
                        renderComponent={(comp, sId) => (
                          <ComponentRenderer 
                            key={comp.id}
                            component={comp}
                            sectionId={sId}
                            imageUrls={imageUrls}
                            uploadingImage={uploadingImage}
                            imageUploadTarget={imageUploadTarget}
                            draggingCollectionItemIndex={draggingCollectionItemIndex}
                            resizingComponent={resizingComponent}
                            isDraggingFile={isDraggingFile}
                            handleComponentDragStart={handleComponentDragStart}
                            handleCollectionItemDragStart={handleCollectionItemDragStart}
                            handleCollectionItemDragOver={handleCollectionItemDragOver}
                            handleCollectionItemDragEnd={handleCollectionItemDragEnd}
                            handleCollectionItemDrop={handleCollectionItemDrop}
                            handleImageDrop={handleImageDrop}
                            handleImageDragOver={handleImageDragOver}
                            handleImageDragLeave={handleImageDragLeave}
                            handleComponentResizeStart={handleComponentResizeStart}
                            setEditingComponent={setEditingComponent}
                            setEditingCollection={setEditingCollection}
                            setEditingCollectionData={setEditingCollectionData}
                            setCollectionSearchQuery={setCollectionSearchQuery}
                            setCollectionSearchResults={setCollectionSearchResults}
                            getAllCollections={getAllCollections}
                            removeComponent={removeComponent}
                            setImageUploadTarget={setImageUploadTarget}
                          />
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      <EditComponentDialog 
        editingComponent={editingComponent}
        setEditingComponent={setEditingComponent}
        handleSaveEdit={handleSaveEdit}
      />

      <ImageUploadDialog 
        isOpen={!!imageUploadTarget}
        onClose={() => setImageUploadTarget(null)}
        uploadingImage={uploadingImage}
        handleFileUpload={(file) => {
          if (imageUploadTarget) {
            handleFileUpload(file, imageUploadTarget.sectionId, imageUploadTarget.componentId)
          }
        }}
      />

      <CollectionEditDialog 
        isOpen={!!editingCollection}
        onClose={() => {
          setEditingCollection(null)
          setEditingCollectionData(null)
          setCollectionSearchQuery('')
        }}
        editingCollectionData={editingCollectionData}
        setEditingCollectionData={setEditingCollectionData}
        collectionSearchQuery={collectionSearchQuery}
        setCollectionSearchQuery={setCollectionSearchQuery}
        collectionSearchResults={collectionSearchResults}
        setCollectionSearchResults={setCollectionSearchResults}
        handleSaveCollection={handleSaveCollection}
      />
    </div>
  )
}
