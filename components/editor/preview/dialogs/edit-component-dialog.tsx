import React, { useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Smartphone,
  Monitor,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Component } from "@/lib/types";

interface EditComponentDialogProps {
  editingComponent: { sectionId: string; component: Component } | null;
  setEditingComponent: (
    state: { sectionId: string; component: Component } | null,
  ) => void;
  handleSaveEdit: () => void;
  imageUrls?: Record<string, string>;
  onUploadMobileImage?: (sectionId: string, componentId: string) => void;
  onRemoveMobileImage?: (sectionId: string, componentId: string) => void;
}

export function EditComponentDialog({
  editingComponent,
  setEditingComponent,
  handleSaveEdit,
  imageUrls = {},
  onUploadMobileImage,
  onRemoveMobileImage,
}: EditComponentDialogProps) {
  if (!editingComponent) return null;

  const paragraphRef = useRef<HTMLTextAreaElement | null>(null);
  const headingRef = useRef<HTMLTextAreaElement | null>(null);

  const { sectionId, component } = editingComponent;
  
  const desktopImageUrl = component.imageId ? imageUrls[component.imageId] : null;
  const mobileImageUrl = component.mobileImageId ? imageUrls[component.mobileImageId] : null;
  const hasMobileImage = !!component.mobileImageId;

  const applyBoldToSelection = () => {
    const type = component.type;
    if (type !== "paragraph" && type !== "heading") {
      setEditingComponent({
        ...editingComponent,
        component: {
          ...component,
          formatting: {
            ...component.formatting,
            bold: !component.formatting?.bold,
          },
        },
      });
      return;
    }

    const ref =
      type === "paragraph" ? paragraphRef.current : headingRef.current;
    if (!ref) {
      setEditingComponent({
        ...editingComponent,
        component: {
          ...component,
          formatting: {
            ...component.formatting,
            bold: !component.formatting?.bold,
          },
        },
      });
      return;
    }

    const start = ref.selectionStart ?? 0;
    const end = ref.selectionEnd ?? 0;
    const content = component.content || "";

    // If no selection, keep the old behavior (toggle whole component bold)
    if (start === end) {
      setEditingComponent({
        ...editingComponent,
        component: {
          ...component,
          formatting: {
            ...component.formatting,
            bold: !component.formatting?.bold,
          },
        },
      });
      return;
    }

    const hasWrap =
      start >= 2 &&
      end + 2 <= content.length &&
      content.slice(start - 2, start) === "**" &&
      content.slice(end, end + 2) === "**";

    const newContent = hasWrap
      ? content.slice(0, start - 2) +
        content.slice(start, end) +
        content.slice(end + 2)
      : content.slice(0, start) +
        "**" +
        content.slice(start, end) +
        "**" +
        content.slice(end);

    const nextStart = hasWrap ? start - 2 : start + 2;
    const nextEnd = hasWrap ? end - 2 : end + 2;

    setEditingComponent({
      ...editingComponent,
      component: {
        ...component,
        content: newContent,
        // Ensure we don't keep the whole component bold when doing selection-based bold.
        formatting: {
          ...component.formatting,
          bold: false,
        },
      },
    });

    requestAnimationFrame(() => {
      try {
        ref.focus();
        ref.setSelectionRange(nextStart, nextEnd);
      } catch {
        // ignore
      }
    });
  };

  const handleTextKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      applyBoldToSelection();
    }
  };

  return (
    <Dialog
      open={!!editingComponent}
      onOpenChange={() => setEditingComponent(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {component.type}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {/* Rich Text Formatting Toolbar */}
          {component.type !== "divider" &&
            component.type !== "spacer" &&
            component.type !== "image" &&
            component.type !== "button" && (
              <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-2">
                <TooltipProvider>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            component.formatting?.bold ? "secondary" : "ghost"
                          }
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={applyBoldToSelection}
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            component.formatting?.italic ? "secondary" : "ghost"
                          }
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
                          variant={
                            component.formatting?.underline
                              ? "secondary"
                              : "ghost"
                          }
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
                          variant={
                            component.formatting?.align === "left"
                              ? "secondary"
                              : "ghost"
                          }
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setEditingComponent({
                              ...editingComponent,
                              component: {
                                ...component,
                                formatting: {
                                  ...component.formatting,
                                  align: "left",
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
                          variant={
                            component.formatting?.align === "center"
                              ? "secondary"
                              : "ghost"
                          }
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setEditingComponent({
                              ...editingComponent,
                              component: {
                                ...component,
                                formatting: {
                                  ...component.formatting,
                                  align: "center",
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
                          variant={
                            component.formatting?.align === "right"
                              ? "secondary"
                              : "ghost"
                          }
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setEditingComponent({
                              ...editingComponent,
                              component: {
                                ...component,
                                formatting: {
                                  ...component.formatting,
                                  align: "right",
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
                      value={
                        component.formatting?.fontSize ||
                        (component.type === "heading" ? "1.5rem" : "1rem")
                      }
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
          {component.type !== "divider" && component.type !== "spacer" && (
            <>
              {component.type === "paragraph" ? (
                <Textarea
                  ref={paragraphRef}
                  value={component.content}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      component: { ...component, content: e.target.value },
                    })
                  }
                  onKeyDown={handleTextKeyDown}
                  placeholder="Enter content..."
                  rows={6}
                  className="font-inherit"
                  style={{
                    fontWeight: component.formatting?.bold ? "bold" : "normal",
                    fontStyle: component.formatting?.italic
                      ? "italic"
                      : "normal",
                    textDecoration: component.formatting?.underline
                      ? "underline"
                      : "none",
                    textAlign: component.formatting?.align || "left",
                    fontSize: component.formatting?.fontSize || "1rem",
                  }}
                />
              ) : component.type === "heading" ? (
                <Textarea
                  ref={headingRef}
                  value={component.content || ""}
                  onChange={(e) =>
                    setEditingComponent({
                      ...editingComponent,
                      component: { ...component, content: e.target.value },
                    })
                  }
                  onKeyDown={handleTextKeyDown}
                  placeholder="Enter heading..."
                  rows={2}
                  className="text-lg font-inherit resize-none"
                  style={{
                    fontWeight:
                      component.formatting?.bold !== false ? "bold" : "normal",
                    fontStyle: component.formatting?.italic
                      ? "italic"
                      : "normal",
                    textDecoration: component.formatting?.underline
                      ? "underline"
                      : "none",
                    textAlign: component.formatting?.align || "left",
                    fontSize: component.formatting?.fontSize || "1.5rem",
                  }}
                />
              ) : (
                <Input
                  value={component.content || ""}
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
          {component.type === "spacer" && (
            <div className="space-y-2">
              <Label>Height</Label>
              <Input
                value={component.height || "4rem"}
                onChange={(e) =>
                  setEditingComponent({
                    ...editingComponent,
                    component: { ...component, height: e.target.value },
                  })
                }
                placeholder="e.g., 4rem, 100px"
              />
              <p className="text-xs text-muted-foreground">
                Use units like rem, px, vh
              </p>
            </div>
          )}

          {/* Image Options */}
          {component.type === "image" && (
            <div className="space-y-3">
              {/* Border Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="border-toggle" className="cursor-pointer">
                    Show Border
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Add a border around the image
                  </p>
                </div>
                <Switch
                  id="border-toggle"
                  checked={component.border ?? false}
                  onCheckedChange={(checked) =>
                    setEditingComponent({
                      ...editingComponent,
                      component: { ...component, border: checked },
                    })
                  }
                />
              </div>
              
              {/* Mobile Image Option */}
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <Label className="font-medium">Mobile Image</Label>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Show a different image on mobile devices (e.g., vertical crop for banners)
                </p>
                
                {/* Image Previews */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Desktop Preview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Monitor className="h-3 w-3" />
                      <span>Desktop</span>
                    </div>
                    <div className="aspect-video rounded-md border border-border bg-muted/30 overflow-hidden">
                      {desktopImageUrl ? (
                        <img 
                          src={desktopImageUrl} 
                          alt="Desktop preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Mobile Preview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Smartphone className="h-3 w-3" />
                      <span>Mobile</span>
                    </div>
                    <div className="aspect-video rounded-md border border-border bg-muted/30 overflow-hidden relative group/mobile">
                      {mobileImageUrl ? (
                        <>
                          <img 
                            src={mobileImageUrl} 
                            alt="Mobile preview" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => onRemoveMobileImage?.(sectionId, component.id)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover/mobile:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onUploadMobileImage?.(sectionId, component.id)}
                          className="w-full h-full flex flex-col items-center justify-center text-xs text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mb-1" />
                          <span>Add mobile</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {hasMobileImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onUploadMobileImage?.(sectionId, component.id)}
                  >
                    <Upload className="h-3 w-3 mr-2" />
                    Change Mobile Image
                  </Button>
                )}
              </div>
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
  );
}
