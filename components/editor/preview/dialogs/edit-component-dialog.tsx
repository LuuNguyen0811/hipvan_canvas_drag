import React from 'react'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import type { Component } from '@/lib/types'

interface EditComponentDialogProps {
  editingComponent: { sectionId: string; component: Component } | null
  setEditingComponent: (state: { sectionId: string; component: Component } | null) => void
  handleSaveEdit: () => void
}

export function EditComponentDialog({
  editingComponent,
  setEditingComponent,
  handleSaveEdit,
}: EditComponentDialogProps) {
  if (!editingComponent) return null

  const { component } = editingComponent

  return (
    <Dialog open={!!editingComponent} onOpenChange={() => setEditingComponent(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit {component.type}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {/* Rich Text Formatting Toolbar */}
          {component.type !== 'divider' &&
            component.type !== 'spacer' &&
            component.type !== 'image' &&
            component.type !== 'button' && (
              <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-2">
                <TooltipProvider>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={component.formatting?.bold ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setEditingComponent({
                              ...editingComponent,
                              component: {
                                ...component,
                                formatting: {
                                  ...component.formatting,
                                  bold: !component.formatting?.bold,
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
                          variant={component.formatting?.italic ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setEditingComponent({
                              ...editingComponent,
                              component: {
                                ...component,
                                formatting: {
                                  ...component.formatting,
                                  italic: !component.formatting?.italic,
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
                          variant={component.formatting?.underline ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setEditingComponent({
                              ...editingComponent,
                              component: {
                                ...component,
                                formatting: {
                                  ...component.formatting,
                                  underline: !component.formatting?.underline,
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
                          variant={component.formatting?.align === 'left' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setEditingComponent({
                              ...editingComponent,
                              component: {
                                ...component,
                                formatting: {
                                  ...component.formatting,
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
                          variant={component.formatting?.align === 'center' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setEditingComponent({
                              ...editingComponent,
                              component: {
                                ...component,
                                formatting: {
                                  ...component.formatting,
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
                          variant={component.formatting?.align === 'right' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setEditingComponent({
                              ...editingComponent,
                              component: {
                                ...component,
                                formatting: {
                                  ...component.formatting,
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
                      value={component.formatting?.fontSize || (component.type === 'heading' ? '1.5rem' : '1rem')}
                      onChange={(e) =>
                        setEditingComponent({
                          ...editingComponent,
                          component: {
                            ...component,
                            formatting: {
                              ...component.formatting,
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
          {component.type !== 'divider' &&
            component.type !== 'spacer' && (
              <>
                {component.type === 'paragraph' ? (
                  <Textarea
                    value={component.content}
                    onChange={(e) =>
                      setEditingComponent({
                        ...editingComponent,
                        component: { ...component, content: e.target.value },
                      })
                    }
                    placeholder="Enter content..."
                    rows={6}
                    className="font-inherit"
                    style={{
                      fontWeight: component.formatting?.bold ? 'bold' : 'normal',
                      fontStyle: component.formatting?.italic ? 'italic' : 'normal',
                      textDecoration: component.formatting?.underline ? 'underline' : 'none',
                      textAlign: component.formatting?.align || 'left',
                      fontSize: component.formatting?.fontSize || '1rem',
                    }}
                  />
                ) : component.type === 'heading' ? (
                  <Input
                    value={component.content || ''}
                    onChange={(e) =>
                      setEditingComponent({
                        ...editingComponent,
                        component: { ...component, content: e.target.value },
                      })
                    }
                    placeholder="Enter heading..."
                    className="text-lg font-inherit"
                    style={{
                      fontWeight: component.formatting?.bold !== false ? 'bold' : 'normal',
                      fontStyle: component.formatting?.italic ? 'italic' : 'normal',
                      textDecoration: component.formatting?.underline ? 'underline' : 'none',
                      textAlign: component.formatting?.align || 'left',
                      fontSize: component.formatting?.fontSize || '1.5rem',
                    }}
                  />
                ) : (
                  <Input
                    value={component.content || ''}
                    onChange={(e) =>
                      setEditingComponent({
                        ...editingComponent,
                        component: { ...component, content: e.target.value },
                      })
                    }
                    placeholder="Enter content..."
                  />
                )}
              </>
            )}
          {component.type === 'spacer' && (
            <div className="space-y-2">
              <Label>Height</Label>
              <Input
                value={component.height || '4rem'}
                onChange={(e) =>
                  setEditingComponent({
                    ...editingComponent,
                    component: { ...component, height: e.target.value },
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
  )
}
