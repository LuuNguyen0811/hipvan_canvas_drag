import React from 'react'
import { Trash2, Pencil, GripVertical, Upload, Image as ImageIcon, MoveHorizontal, MoveVertical, Grid2X2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/collection'
import type { Component, CollectionComponentData } from '@/lib/types'

interface ComponentRendererProps {
  component: Component
  sectionId: string
  imageUrls: Record<string, string>
  uploadingImage: boolean
  imageUploadTarget: { sectionId: string; componentId: string } | null
  draggingCollectionItemIndex: { sectionId: string; componentId: string; index: number } | null
  resizingComponent: { sectionId: string; componentId: string; direction: 'width' | 'height' } | null
  isDraggingFile: boolean
  handleComponentDragStart: (e: React.DragEvent, sectionId: string, componentId: string) => void
  handleCollectionItemDragStart: (e: React.DragEvent, sectionId: string, componentId: string, itemIndex: number) => void
  handleCollectionItemDragOver: (e: React.DragEvent, sectionId: string, componentId: string, hoverIndex: number) => void
  handleCollectionItemDragEnd: (e: React.DragEvent) => void
  handleCollectionItemDrop: (e: React.DragEvent, sectionId: string, componentId: string, targetIndex: number) => void
  handleImageDrop: (e: React.DragEvent, sectionId: string, componentId: string) => void
  handleImageDragOver: (e: React.DragEvent) => void
  handleImageDragLeave: (e: React.DragEvent) => void
  handleComponentResizeStart: (e: React.MouseEvent, sectionId: string, componentId: string, direction: 'width' | 'height') => void
  setEditingComponent: (state: { sectionId: string; component: Component } | null) => void
  setEditingCollection: (state: { sectionId: string; component: Component } | null) => void
  setEditingCollectionData: (data: CollectionComponentData | null) => void
  setCollectionSearchQuery: (query: string) => void
  setCollectionSearchResults: (results: any[]) => void
  getAllCollections: () => any[]
  removeComponent: (sectionId: string, componentId: string) => void
  setImageUploadTarget: (target: { sectionId: string; componentId: string } | null) => void
}

export function ComponentRenderer({
  component,
  sectionId,
  imageUrls,
  uploadingImage,
  imageUploadTarget,
  draggingCollectionItemIndex,
  resizingComponent,
  isDraggingFile,
  handleComponentDragStart,
  handleCollectionItemDragStart,
  handleCollectionItemDragOver,
  handleCollectionItemDragEnd,
  handleCollectionItemDrop,
  handleImageDrop,
  handleImageDragOver,
  handleImageDragLeave,
  handleComponentResizeStart,
  setEditingComponent,
  setEditingCollection,
  setEditingCollectionData,
  setCollectionSearchQuery,
  setCollectionSearchResults,
  getAllCollections,
  removeComponent,
  setImageUploadTarget,
}: ComponentRendererProps) {
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
              </CollectionHeader>
            )}
            {hasItems ? (
              <CollectionUI
                layout={collectionData.layout}
                itemsPerRow={collectionData.itemsPerRow || 4}
                gap={collectionData.gap || '1rem'}
              >
                {collectionData.items.map((item, itemIndex) => (
                  <CollectionItem 
                    key={item.id} 
                    layout={collectionData.layout}
                    style={{
                      backgroundColor: item.itemBgColor || collectionData.itemBgColor
                    }}
                    draggable
                    onDragStart={(e) => handleCollectionItemDragStart(e, sectionId, component.id, itemIndex)}
                    onDragOver={(e) => handleCollectionItemDragOver(e, sectionId, component.id, itemIndex)}
                    onDragEnd={handleCollectionItemDragEnd}
                    onDrop={(e) => handleCollectionItemDrop(e, sectionId, component.id, itemIndex)}
                    isDragging={draggingCollectionItemIndex?.sectionId === sectionId && 
                                draggingCollectionItemIndex?.componentId === component.id && 
                                draggingCollectionItemIndex?.index === itemIndex}
                  >
                    {item.badge && <CollectionItemBadge>{item.badge}</CollectionItemBadge>}
                    <CollectionItemImage src={item.image} alt={item.title} />
                    <CollectionItemContent>
                      <CollectionItemTitle>{item.title}</CollectionItemTitle>
                      {item.subtitle && <CollectionItemSubtitle>{item.subtitle}</CollectionItemSubtitle>}
                      <CollectionItemCTA 
                        href={item.ctaUrl}
                        style={{
                          backgroundColor: item.ctaBgColor || collectionData.itemCtaBgColor,
                          color: item.ctaTextColor || collectionData.itemCtaTextColor || ((item.ctaBgColor || collectionData.itemCtaBgColor) ? 'white' : undefined)
                        }}
                      >
                        {item.ctaText || collectionData.itemCtaText || 'Shop'}
                      </CollectionItemCTA>
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
