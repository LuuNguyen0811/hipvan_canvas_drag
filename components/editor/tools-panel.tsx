"use client";

import React from "react";
import { useState } from "react";
import { useProjectStore } from "@/lib/store";
import {
  SECTION_TEMPLATES,
  COMPONENT_TYPES,
  type Component,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  ChevronRight,
  Copy,
  Trash2,
  GripVertical,
  Info,
} from "lucide-react";

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
};

const generateId = () => Math.random().toString(36).substring(2, 9);

export function ToolsPanel() {
  const {
    currentProject,
    addSection,
    addComponent,
    removeSection,
    duplicateSection,
    moveSectionUp,
    moveSectionDown,
    moveComponent,
    setEditorTarget,
  } = useProjectStore();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("sections");
  const [expandedLayouts, setExpandedLayouts] = useState<
    Record<string, boolean>
  >({});
  const [layerInsertTarget, setLayerInsertTarget] = useState<{
    sectionId: string;
    parentLayoutId?: string | null;
    anchorId: string;
    placement: "before" | "after";
    insertIndex: number;
  } | null>(null);

  // Store dragging state for layer reordering (dataTransfer.getData() doesn't work during dragover)
  const [draggingLayer, setDraggingLayer] = useState<{
    componentId: string;
    fromSectionId: string;
    fromLayoutId: string | null;
  } | null>(null);

  const autoScrollNearestViewport = (
    e: React.DragEvent,
    opts?: { speed?: number; threshold?: number },
  ) => {
    const speed = opts?.speed ?? 18;
    const threshold = opts?.threshold ?? 48;
    const el = e.currentTarget as HTMLElement;
    const viewport = el.closest(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLElement | null;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const y = e.clientY;
    if (y < rect.top + threshold) {
      viewport.scrollTop -= speed;
    } else if (y > rect.bottom - threshold) {
      viewport.scrollTop += speed;
    }
  };

  const findComponentInTree = (
    components: Component[],
    componentId: string,
  ): Component | null => {
    for (const c of components) {
      if (c.id === componentId) return c;
      if (c.type === "layout" && c.children && c.children.length > 0) {
        const found = findComponentInTree(c.children, componentId);
        if (found) return found;
      }
    }
    return null;
  };

  const getContainerColumns = (
    sectionId: string,
    parentLayoutId?: string | null,
  ): number => {
    const section = currentProject?.layout.find((s) => s.id === sectionId);
    if (!section) return 1;
    if (!parentLayoutId) return section.columns || 1;
    const parent = findComponentInTree(section.components, parentLayoutId);
    if (parent && parent.type === "layout") return parent.columns || 1;
    return section.columns || 1;
  };

  const countComponentsInTree = (components: Component[]): number => {
    let count = 0;
    for (const c of components) {
      count += 1;
      if (c.type === "layout" && c.children && c.children.length > 0) {
        count += countComponentsInTree(c.children);
      }
    }
    return count;
  };

  const getLayerLabel = (component: Component) => {
    if (component.type === "heading") return component.content || "Heading";
    if (component.type === "paragraph") return component.content || "Paragraph";
    if (component.type === "image") return "Image";
    if (component.type === "button") return component.content || "Button";
    if (component.type === "divider") return "Divider";
    if (component.type === "spacer") return "Spacer";
    if (component.type === "list") return "List";
    if (component.type === "card") return component.content || "Card";
    if (component.type === "layout") return "Layout";
    return component.type;
  };

  const renderLayerItems = (
    components: Component[],
    sectionId: string,
    depth = 0,
    parentLayoutId?: string | null,
  ) => {
    return components.map((component) => {
      const isLayout = component.type === "layout";
      const hasChildren =
        isLayout && component.children && component.children.length > 0;
      const isExpanded = expandedLayouts[component.id] ?? true;
      const label = getLayerLabel(component);
      const indexInParent = components.findIndex((c) => c.id === component.id);
      const containerColumns = getContainerColumns(sectionId, parentLayoutId);
      const props = (component.props ?? {}) as Record<string, unknown>;
      const isFull = props.span === "full";
      const currentColumnIndex =
        typeof props.columnIndex === "number"
          ? (props.columnIndex as number)
          : 0;

      const setPlacement = (placement: { span: "full" } | { col: number }) => {
        moveComponent(sectionId, sectionId, component.id, indexInParent, {
          fromLayoutId: parentLayoutId || null,
          toLayoutId: parentLayoutId || null,
          targetSpan: "span" in placement ? "full" : undefined,
          targetColumnIndex: "col" in placement ? placement.col : undefined,
        });
      };
      const handleLayerDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData("componentId", component.id);
        e.dataTransfer.setData("fromSectionId", sectionId);
        if (parentLayoutId) {
          e.dataTransfer.setData("fromLayoutId", parentLayoutId);
        }
        e.dataTransfer.effectAllowed = "move";
        // Store in state so we can access during dragover (dataTransfer.getData() doesn't work during dragover)
        setDraggingLayer({
          componentId: component.id,
          fromSectionId: sectionId,
          fromLayoutId: parentLayoutId || null,
        });
      };

      const handleLayerDragEnd = () => {
        setDraggingLayer(null);
        setLayerInsertTarget(null);
      };

      const handleLayerDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        autoScrollNearestViewport(e);

        // Use state instead of dataTransfer (getData() doesn't work during dragover due to browser security)
        if (!draggingLayer) return;

        const { componentId: draggedId } = draggingLayer;
        
        // Don't allow dropping onto itself
        if (draggedId === component.id) return;
        
        // Don't allow dropping a parent into its own children
        if (isLayout && component.children) {
          const isChild = findComponentInTree(component.children, draggedId);
          if (isChild) return;
        }

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const before = e.clientY < rect.top + rect.height / 2;
        const idxWithin = components.findIndex((c) => c.id === component.id);
        if (idxWithin < 0) return;
        const insertIndex = before ? idxWithin : idxWithin + 1;

        setLayerInsertTarget({
          sectionId,
          parentLayoutId: parentLayoutId || null,
          anchorId: component.id,
          placement: before ? "before" : "after",
          insertIndex,
        });
      };

      const handleLayerDrop = (e: React.DragEvent) => {
        e.preventDefault();

        // Use state for reliability, with dataTransfer as fallback
        const draggedId = draggingLayer?.componentId || e.dataTransfer.getData("componentId");
        const fromSectionId = draggingLayer?.fromSectionId || e.dataTransfer.getData("fromSectionId");
        const fromLayoutId = draggingLayer?.fromLayoutId || e.dataTransfer.getData("fromLayoutId") || null;

        if (!draggedId || !fromSectionId) {
          setDraggingLayer(null);
          setLayerInsertTarget(null);
          return;
        }
        if (!layerInsertTarget) {
          setDraggingLayer(null);
          return;
        }
        
        // Don't allow dropping onto itself
        if (draggedId === component.id) {
          setDraggingLayer(null);
          setLayerInsertTarget(null);
          return;
        }

        // Use the target's section and parent layout from layerInsertTarget
        const targetSectionId = layerInsertTarget.sectionId;
        const targetLayoutId = layerInsertTarget.parentLayoutId;
        
        // Calculate the correct insert index
        let newIndex = layerInsertTarget.insertIndex;
        
        // If moving within the same container, adjust index if needed
        if (fromSectionId === targetSectionId && (fromLayoutId || null) === (targetLayoutId || null)) {
          const oldIndex = components.findIndex((c) => c.id === draggedId);
          if (oldIndex >= 0 && newIndex > oldIndex) newIndex -= 1;
        }

        moveComponent(fromSectionId, targetSectionId, draggedId, newIndex, {
          fromLayoutId: fromLayoutId,
          toLayoutId: targetLayoutId || null,
        });

        setDraggingLayer(null);
        setLayerInsertTarget(null);
      };

      return (
        <div key={component.id}>
          <div
            className="relative"
            onDragLeave={() => setLayerInsertTarget(null)}
          >
            {layerInsertTarget?.anchorId === component.id &&
              layerInsertTarget?.sectionId === sectionId &&
              (layerInsertTarget?.parentLayoutId || null) === (parentLayoutId || null) &&
              layerInsertTarget?.placement === "before" && (
                <div className="pointer-events-none absolute left-0 right-0 top-0 h-0.5 bg-primary" />
              )}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelectedSection(sectionId);
                setEditorTarget({ sectionId, componentId: component.id });
                if (isLayout) {
                  setExpandedLayouts((prev) => ({
                    ...prev,
                    [component.id]: !(prev[component.id] ?? true),
                  }));
                }
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                setSelectedSection(sectionId);
                setEditorTarget({ sectionId, componentId: component.id });
                if (isLayout) {
                  setExpandedLayouts((prev) => ({
                    ...prev,
                    [component.id]: !(prev[component.id] ?? true),
                  }));
                }
              }}
              draggable
              onDragStart={handleLayerDragStart}
              onDragEnd={handleLayerDragEnd}
              onDragOver={handleLayerDragOver}
              onDrop={handleLayerDrop}
              className={`group/layerrow flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs text-foreground hover:bg-accent ${
                draggingLayer?.componentId === component.id ? "opacity-50 bg-accent" : ""
              }`}
              style={{ paddingLeft: `${8 + depth * 12}px` }}
            >
              <div className="flex h-4 w-4 items-center justify-center text-muted-foreground opacity-80">
                <GripVertical className="h-3.5 w-3.5" />
              </div>
              {isLayout ? (
                hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-40" />
                )
              ) : (
                <span className="h-3.5 w-3.5" />
              )}
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {containerColumns > 1 && (
                <span className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/layerrow:opacity-100">
                  <Button
                    variant={isFull ? "secondary" : "ghost"}
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPlacement({ span: "full" });
                    }}
                  >
                    Full
                  </Button>
                  {Array.from({ length: containerColumns }).map((_, i) => (
                    <Button
                      key={i}
                      variant={
                        !isFull && currentColumnIndex === i
                          ? "secondary"
                          : "ghost"
                      }
                      size="sm"
                      className="h-6 w-6 p-0 text-[10px]"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPlacement({ col: i });
                      }}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </span>
              )}
              {indexInParent >= 0 && (
                <span className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover/layerrow:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={indexInParent <= 0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (indexInParent <= 0) return;
                      moveComponent(
                        sectionId,
                        sectionId,
                        component.id,
                        indexInParent - 1,
                        {
                          fromLayoutId: parentLayoutId || null,
                          toLayoutId: parentLayoutId || null,
                        },
                      );
                    }}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={
                      indexInParent < 0 ||
                      indexInParent >= components.length - 1
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (
                        indexInParent < 0 ||
                        indexInParent >= components.length - 1
                      )
                        return;
                      moveComponent(
                        sectionId,
                        sectionId,
                        component.id,
                        indexInParent + 1,
                        {
                          fromLayoutId: parentLayoutId || null,
                          toLayoutId: parentLayoutId || null,
                        },
                      );
                    }}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </span>
              )}
            </div>
            {layerInsertTarget?.anchorId === component.id &&
              layerInsertTarget?.sectionId === sectionId &&
              (layerInsertTarget?.parentLayoutId || null) === (parentLayoutId || null) &&
              layerInsertTarget?.placement === "after" && (
                <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-0.5 bg-primary" />
              )}
          </div>
          {hasChildren && isExpanded
            ? renderLayerItems(
                component.children || [],
                sectionId,
                depth + 1,
                component.id,
              )
            : null}
        </div>
      );
    });
  };

  const orderedSectionTemplates = [...SECTION_TEMPLATES].sort((a, b) => {
    const order: Record<string, number> = {
      "full-width": 0,
      "two-equal": 1,
      "three-equal": 2,
    };
    return (order[a.id] ?? 999) - (order[b.id] ?? 999);
  });

  const handleAddSection = (templateId: string) => {
    const template = SECTION_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    addSection(template.id, template);
  };

  const handleLayoutDragStart = (e: React.DragEvent, templateId: string) => {
    e.dataTransfer.setData("layoutTemplateId", templateId);
    e.dataTransfer.setData("dragType", "section");
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData("componentType", componentType);
    e.dataTransfer.setData("dragType", "element");
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleAddComponent = (type: string) => {
    const targetSection = selectedSection || currentProject?.layout[0]?.id;
    if (!targetSection) return;

    const defaultContent: Record<string, string> = {
      heading: "Your Heading Here",
      paragraph: "This is a paragraph. Click to edit and add your own content.",
      image: "Image Placeholder",
      button: "Click Me",
      divider: "",
      spacer: "",
      card: "Card Title",
      list: "Item 1, Item 2, Item 3",
    };

    const newComponent: Component = {
      id: generateId(),
      type: type as Component["type"],
      content: defaultContent[type] || "",
      styles: {},
      formatting:
        type === "heading" || type === "paragraph"
          ? { align: "center" }
          : undefined,
    };

    addComponent(targetSection, newComponent);
  };

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold text-foreground">Tools</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Build your page with sections and elements
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-1 flex-col"
        >
          <TabsList className="mx-4 mt-4 grid w-auto grid-cols-3">
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

          <ScrollArea className="flex-1">
            {/* Sections Tab - Add new section layouts */}
            <TabsContent value="sections" className="m-0 p-4">
              <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-medium text-foreground">
                  💡 Getting Started
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <strong>Step 1:</strong> Click any section below to add it to
                  your page
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <strong>Step 2:</strong> Go to <strong>Elements</strong> tab
                  to add content
                </p>
              </div>
              <div className="grid gap-2">
                {orderedSectionTemplates.map((template) => (
                  <button
                    key={template.id}
                    draggable
                    onDragStart={(e) => handleLayoutDragStart(e, template.id)}
                    onClick={() => handleAddSection(template.id)}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-all hover:border-primary hover:bg-accent hover:shadow-sm active:scale-[0.98]"
                  >
                    <div className="flex h-10 w-20 flex-shrink-0 items-center justify-center overflow-hidden whitespace-nowrap rounded bg-muted px-1 font-mono text-[10px] leading-none text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      {template.preview}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {template.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {template.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            {/* Components Tab - Drag elements */}
            <TabsContent value="components" className="m-0 p-4">
              {!currentProject || currentProject.layout.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
                  <Layout className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    No sections yet
                  </p>
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
                    </label>
                    <select
                      value={
                        selectedSection || currentProject.layout[0]?.id || ""
                      }
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {currentProject.layout.map((section, index) => (
                        <option key={section.id} value={section.id}>
                          {section.name || `Section ${index + 1}`} (
                          {section.columns} col)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {COMPONENT_TYPES.map((comp) => (
                      <Tooltip key={comp.type}>
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
                            {comp.type === "image"
                              ? "Click to add, then upload/drag your image"
                              : comp.type === "spacer"
                                ? "Add vertical space (adjustable height)"
                                : `Add a ${comp.label.toLowerCase()} to your page`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Layers Tab - Manage sections */}
            <TabsContent value="layers" className="m-0 p-4">
              <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium text-foreground">
                  📚 Layer Management
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Drag an element row to reorder, or use the up/down arrows
                </p>
              </div>

              {!currentProject || currentProject.layout.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
                  <Layers className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    No sections yet
                  </p>
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
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/50"
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
                            {section.columns} column
                            {section.columns > 1 ? "s" : ""} ·{" "}
                            {countComponentsInTree(section.components)} element
                            {countComponentsInTree(section.components) !== 1
                              ? "s"
                              : ""}
                          </div>
                        </button>

                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
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
                                disabled={
                                  index === currentProject.layout.length - 1
                                }
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
                        </div>
                      </div>

                      {selectedSection === section.id && (
                        <div className="mt-2 border-t border-border/60 pt-2">
                          {section.components.length === 0 ? (
                            <div 
                              className={`px-2 py-3 text-xs text-muted-foreground text-center rounded transition-colors ${
                                draggingLayer && layerInsertTarget?.sectionId === section.id && !layerInsertTarget?.parentLayoutId
                                  ? "bg-primary/10 border border-dashed border-primary"
                                  : ""
                              }`}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (draggingLayer) {
                                  setLayerInsertTarget({
                                    sectionId: section.id,
                                    parentLayoutId: null,
                                    anchorId: "",
                                    placement: "before",
                                    insertIndex: 0,
                                  });
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (!draggingLayer) return;
                                
                                moveComponent(
                                  draggingLayer.fromSectionId,
                                  section.id,
                                  draggingLayer.componentId,
                                  0,
                                  {
                                    fromLayoutId: draggingLayer.fromLayoutId,
                                    toLayoutId: null,
                                  }
                                );
                                setDraggingLayer(null);
                                setLayerInsertTarget(null);
                              }}
                              onDragLeave={() => setLayerInsertTarget(null)}
                            >
                              {draggingLayer ? "Drop here to add to section root" : "No elements yet"}
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              {renderLayerItems(section.components, section.id)}
                              {/* Drop zone at end of section */}
                              <div
                                className={`relative h-6 rounded transition-colors ${
                                  draggingLayer && layerInsertTarget?.sectionId === section.id && 
                                  !layerInsertTarget?.parentLayoutId && !layerInsertTarget?.anchorId
                                    ? "bg-primary/10"
                                    : ""
                                }`}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  if (draggingLayer) {
                                    setLayerInsertTarget({
                                      sectionId: section.id,
                                      parentLayoutId: null,
                                      anchorId: "",
                                      placement: "after",
                                      insertIndex: section.components.length,
                                    });
                                  }
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  if (!draggingLayer) return;
                                  
                                  moveComponent(
                                    draggingLayer.fromSectionId,
                                    section.id,
                                    draggingLayer.componentId,
                                    section.components.length,
                                    {
                                      fromLayoutId: draggingLayer.fromLayoutId,
                                      toLayoutId: null,
                                    }
                                  );
                                  setDraggingLayer(null);
                                  setLayerInsertTarget(null);
                                }}
                                onDragLeave={() => setLayerInsertTarget(null)}
                              >
                                {draggingLayer && layerInsertTarget?.sectionId === section.id && 
                                 !layerInsertTarget?.parentLayoutId && !layerInsertTarget?.anchorId && (
                                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <div className="h-0.5 flex-1 bg-primary rounded-full" />
                                    <span className="text-[10px] text-primary font-medium">Drop to section root</span>
                                    <div className="h-0.5 flex-1 bg-primary rounded-full" />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
