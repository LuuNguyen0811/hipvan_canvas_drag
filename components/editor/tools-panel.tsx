'use client'

import React from "react"
import { useState } from 'react'
import { useProjectStore } from '@/lib/store'
import { SECTION_TEMPLATES, COMPONENT_TYPES, type Component, type CollectionComponentData } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Type,
  AlignLeft,
  ImageIcon,
  Square,
  Minus,
  MoveVertical,
  CreditCard,
  List,
  Layout,
  Layers,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  GripVertical,
  Info,
  Grid2X2,
} from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  Type: <Type className="h-5 w-5" />,
  AlignLeft: <AlignLeft className="h-5 w-5" />,
  ImageIcon: <ImageIcon className="h-5 w-5" />,
  Image: <ImageIcon className="h-5 w-5" />,
  Square: <Square className="h-5 w-5" />,
  Minus: <Minus className="h-5 w-5" />,
  MoveVertical: <MoveVertical className="h-5 w-5" />,
  CreditCard: <CreditCard className="h-5 w-5" />,
  List: <List className="h-5 w-5" />,
  Grid2X2: <Grid2X2 className="h-5 w-5" />,
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export function ToolsPanel() {
  const { 
    currentProject, 
    addSection, 
    addComponent,
    removeSection,
    duplicateSection,
    moveSectionUp,
    moveSectionDown,
  } = useProjectStore()
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('sections')

  const handleAddSection = (templateId: string) => {
    const template = SECTION_TEMPLATES.find((t) => t.id === templateId)
    if (!template) return
    addSection(template.id, template)
  }

  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData('componentType', componentType)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleAddComponent = (type: string) => {
    const targetSection = selectedSection || currentProject?.layout[0]?.id
    if (!targetSection) return

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
      headerTitle: 'Shop Our Bestselling Collections',
    }

    const newComponent: Component = {
      id: generateId(),
      type: type as Component['type'],
      content: defaultContent[type] || '',
      styles: {},
      ...(type === 'collection' && { collectionData: defaultCollectionData }),
    }

    addComponent(targetSection, newComponent)
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold text-foreground">Tools</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Build your page with sections and elements
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-4 mt-4 grid w-auto grid-cols-3 shrink-0">
            <TabsTrigger value="sections" className="gap-1.5 text-xs">
              <Layout className="h-3.5 w-3.5" />
              Sections
            </TabsTrigger>
            <TabsTrigger value="components" className="gap-1.5 text-xs">
              <Square className="h-3.5 w-3.5" />
              Elements
            </TabsTrigger>
            <TabsTrigger value="layers" className="gap-1.5 text-xs">
              <Layers className="h-3.5 w-3.5" />
              Layers
            </TabsTrigger>
          </TabsList>

          {/* Sections Tab */}
          <TabsContent value="sections" className="flex-1 min-h-0 m-0 focus-visible:outline-none">
            <ScrollArea className="h-full w-full">
              <div className="p-4 pb-12">
                <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-medium text-foreground">
                    💡 Getting Started
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <strong>Step 1:</strong> Click any section below to add it to your page
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <strong>Step 2:</strong> Go to <strong>Elements</strong> tab to add content
                  </p>
                </div>
                <div className="grid gap-2">
                  {SECTION_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleAddSection(template.id)}
                      className="group flex w-full items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-all hover:border-primary hover:bg-accent hover:shadow-sm active:scale-[0.98]"
                    >
                      <div className="flex h-10 w-16 flex-shrink-0 items-center justify-center rounded bg-muted/50 p-1.5 transition-colors group-hover:bg-primary/10">
                        <div className="flex w-full h-full gap-1 items-stretch">
                          {(template.columnWidths || Array(template.columns).fill(`${100/template.columns}%`)).map((width, i) => (
                            <div 
                              key={i} 
                              style={{ width }} 
                              className={`rounded-sm bg-muted-foreground/30 transition-colors group-hover:bg-primary/30 ${
                                template.id === 'hero' ? 'flex items-center justify-center' : ''
                              }`}
                            >
                              {template.id === 'hero' && (
                                <div className="h-1.5 w-4 rounded-full bg-muted-foreground/20 group-hover:bg-primary/20" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground truncate">
                          {template.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {template.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="components" className="flex-1 min-h-0 m-0 focus-visible:outline-none">
            <ScrollArea className="h-full w-full">
              <div className="p-4 pb-12">
                {!currentProject || currentProject.layout.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
                    <Layout className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">No sections yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Go to <strong>Sections</strong> tab to add a layout first
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                      <p className="text-xs font-medium text-foreground">
                        🎨 Two Ways to Add
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <strong>Click:</strong> Add to selected section below
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        <strong>Drag:</strong> Drop into any section on the canvas
                      </p>
                    </div>
                    
                    {/* Section selector */}
                    <div className="mb-4">
                      <label className="mb-2 flex items-center gap-1 text-xs font-medium text-foreground">
                        Target Section
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help">
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="text-xs">
                                Click an element below to add it to this section
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <select
                        value={selectedSection || currentProject.layout[0]?.id || ''}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {currentProject.layout.map((section, index) => (
                          <option key={section.id} value={section.id}>
                            {section.name || `Section ${index + 1}`} ({section.columns} col)
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {COMPONENT_TYPES.map((comp) => (
                        <TooltipProvider key={comp.type}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                draggable
                                onDragStart={(e) => handleDragStart(e, comp.type)}
                                onClick={() => handleAddComponent(comp.type)}
                                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-background p-3 transition-all hover:border-primary hover:bg-accent hover:shadow-sm active:scale-95"
                              >
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10">
                                  {iconMap[comp.icon]}
                                </div>
                                <span className="text-xs font-medium text-foreground">
                                  {comp.label}
                                </span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p className="text-xs">
                                {comp.type === 'image' 
                                  ? 'Click to add, then upload/drag your image'
                                  : comp.type === 'spacer'
                                  ? 'Add vertical space (adjustable height)'
                                  : `Add a ${comp.label.toLowerCase()} to your page`
                                }
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Layers Tab */}
          <TabsContent value="layers" className="flex-1 min-h-0 m-0 focus-visible:outline-none">
            <ScrollArea className="h-full w-full">
              <div className="p-4 pb-12">
                <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-foreground">
                    📚 Layer Management
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Reorder, duplicate, or delete your sections
                  </p>
                </div>
                
                {!currentProject || currentProject.layout.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
                    <Layers className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">No sections yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add sections from the <strong>Sections</strong> tab
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentProject.layout.map((section, index) => (
                      <div
                        key={section.id}
                        className={`group rounded-lg border p-3 transition-all ${
                          selectedSection === section.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                          <button
                            onClick={() => setSelectedSection(section.id)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <div className="text-sm font-medium text-foreground">
                              {section.name || `Section ${index + 1}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {section.columns} column{section.columns > 1 ? 's' : ''} · {section.components.length} element{section.components.length !== 1 ? 's' : ''}
                            </div>
                          </button>
                          
                          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => moveSectionUp(section.id)}
                                    disabled={index === 0}
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Move up</TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => moveSectionDown(section.id)}
                                    disabled={index === currentProject.layout.length - 1}
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Move down</TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => duplicateSection(section.id)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Duplicate</TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => removeSection(section.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
