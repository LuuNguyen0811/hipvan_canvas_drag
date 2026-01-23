"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useProjectStore } from "@/lib/store";
import type { Component, LayoutSection } from "@/lib/types";
import { SECTION_TEMPLATES } from "@/lib/types";
import { saveImage, loadImage, deleteImage } from "@/lib/image-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Trash2,
  GripVertical,
  Pencil,
  Monitor,
  Tablet,
  Smartphone,
  Plus,
  GripHorizontal,
  Upload,
  Image as ImageIcon,
  MoveVertical,
  MoveHorizontal,
  Info,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
} from "lucide-react";

const generateId = () => Math.random().toString(36).substring(2, 9);

const findComponentInTree = (
  components: Component[],
  componentId: string,
): Component | null => {
  for (const component of components) {
    if (component.id === componentId) return component;
    if (
      component.type === "layout" &&
      component.children &&
      component.children.length > 0
    ) {
      const found = findComponentInTree(component.children, componentId);
      if (found) return found;
    }
  }
  return null;
};

const collectImageComponentsInTree = (components: Component[]): Component[] => {
  const out: Component[] = [];
  for (const component of components) {
    if (component.type === "image" && component.imageId) out.push(component);
    if (
      component.type === "layout" &&
      component.children &&
      component.children.length > 0
    ) {
      out.push(...collectImageComponentsInTree(component.children));
    }
  }
  return out;
};

const shouldInsertFullWidth = (
  e: React.DragEvent,
  columns: number,
  thresholdPx = 24,
) => {
  if (columns <= 1) return false;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  return e.clientY >= rect.bottom - thresholdPx;
};

const renderWithLineBreaks = (text: string, keyBase: string) => {
  const parts = text.split("\n");
  return parts.flatMap((part, idx) => {
    const key = `${keyBase}-${idx}`;
    if (idx === parts.length - 1)
      return [<React.Fragment key={key}>{part}</React.Fragment>];
    return [
      <React.Fragment key={key}>{part}</React.Fragment>,
      <br key={`${key}-br`} />,
    ];
  });
};

const renderRichText = (text: string) => {
  const tokens = text.split(/(\*\*[^*]+\*\*)/g);
  return tokens.map((t, i) => {
    if (t.startsWith("**") && t.endsWith("**") && t.length >= 4) {
      const inner = t.slice(2, -2);
      return (
        <strong key={`b-${i}`}>{renderWithLineBreaks(inner, `b-${i}`)}</strong>
      );
    }
    return (
      <React.Fragment key={`n-${i}`}>
        {renderWithLineBreaks(t, `n-${i}`)}
      </React.Fragment>
    );
  });
};

type ViewportSize = "desktop" | "tablet" | "mobile";

const viewportWidths: Record<ViewportSize, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export function PreviewPanel() {
  const {
    currentProject,
    editorTarget,
    clearEditorTarget,
    addSection,
    addComponent,
    addComponentToLayout,
    removeComponent,
    updateComponent,
    moveComponent,
    removeSection,
    updateSection,
    saveToHistory,
  } = useProjectStore();
  const [editingComponent, setEditingComponent] = useState<{
    sectionId: string;
    component: Component;
  } | null>(null);
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  const [dragOverLayout, setDragOverLayout] = useState<string | null>(null);
  const [dragOverLayoutColumn, setDragOverLayoutColumn] = useState<
    number | null
  >(null);
  const [imageUploadTarget, setImageUploadTarget] = useState<{
    sectionId: string;
    componentId: string;
  } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showBorders, setShowBorders] = useState(true);
  const [bordersTouched, setBordersTouched] = useState(false);
  const [insertTarget, setInsertTarget] = useState<{
    sectionId: string;
    layoutId?: string;
    insertIndex: number;
    columnIndex?: number;
    span?: "full" | "column";
    anchorId?: string;
    placement?: "before" | "after";
  } | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const paragraphTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const headingInputRef = useRef<HTMLInputElement | null>(null);
  
  // Section-level insertion state
  const [sectionInsertTarget, setSectionInsertTarget] = useState<{
    index: number;
    placement: "before" | "after";
  } | null>(null);
  
  // Track what's being dragged for better visual feedback
  const [draggingType, setDraggingType] = useState<"section" | "element" | "component" | null>(null);

  const autoScrollNearestViewport = (
    e: React.DragEvent,
    opts?: { speed?: number; threshold?: number },
  ) => {
    const speed = opts?.speed ?? 18;
    const threshold = opts?.threshold ?? 64;
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

  useEffect(() => {
    if (bordersTouched) return;
    setShowBorders(viewport !== "mobile");
  }, [viewport, bordersTouched]);

  useEffect(() => {
    if (!editorTarget || !currentProject) return;
    const section = currentProject.layout.find(
      (s) => s.id === editorTarget.sectionId,
    );
    if (!section) {
      clearEditorTarget();
      return;
    }
    const comp = findComponentInTree(
      section.components,
      editorTarget.componentId,
    );
    if (!comp) {
      clearEditorTarget();
      return;
    }
    setEditingComponent({ sectionId: editorTarget.sectionId, component: comp });
    clearEditorTarget();
  }, [editorTarget, currentProject, clearEditorTarget]);

  const computeGroupedInsertIndex = (
    components: Component[],
    opts: {
      targetSpan: "full" | "column";
      targetColumnIndex?: number;
      desiredIndexWithin: number;
      maxColumns: number;
    },
  ) => {
    let count = 0;
    for (let i = 0; i < components.length; i++) {
      const c = components[i];
      const isFull =
        (c.props as Record<string, unknown> | undefined)?.span === "full";
      const colIndex = (c.props?.columnIndex as number) ?? 0;
      const targetCol = Math.min(colIndex, Math.max(0, opts.maxColumns - 1));
      const isTarget =
        opts.targetSpan === "full"
          ? isFull
          : !isFull && targetCol === (opts.targetColumnIndex ?? 0);
      if (isTarget) {
        if (count === opts.desiredIndexWithin) return i;
        count += 1;
      }
    }
    return components.length;
  };

  // Resizing state
  const [resizingSection, setResizingSection] = useState<string | null>(null);
  const [resizingDivider, setResizingDivider] = useState<number | null>(null);
  const [resizingComponent, setResizingComponent] = useState<{
    sectionId: string;
    componentId: string;
    direction: "width" | "height";
  } | null>(null);
  const [resizingSectionHeight, setResizingSectionHeight] = useState<
    string | null
  >(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resizeAnimationFrameRef = useRef<number | null>(null);
  const pendingResizeRef = useRef<{ x: number; y: number } | null>(null);

  // Load image URLs from IndexedDB on mount
  useEffect(() => {
    const loadAllImages = async () => {
      if (!currentProject) return;

      const imageComponents = currentProject.layout.flatMap((section) =>
        collectImageComponentsInTree(section.components),
      );

      const urls: Record<string, string> = {};
      await Promise.all(
        imageComponents.map(async (comp) => {
          if (comp.imageId) {
            const url = await loadImage(comp.imageId);
            if (url) urls[comp.imageId] = url;
          }
        }),
      );

      setImageUrls(urls);
    };

    loadAllImages();
  }, [currentProject?.id]);

  // File upload handlers
  const handleFileUpload = async (
    file: File,
    sectionId: string,
    componentId: string,
  ) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG, GIF, WebP)");
      return;
    }

    // Check file size (warn if over 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const shouldContinue = confirm(
        `This image is ${(file.size / 1024 / 1024).toFixed(1)}MB. It will be compressed to reduce storage usage. Continue?`,
      );
      if (!shouldContinue) return;
    }

    setUploadingImage(true);

    try {
      // Generate unique image ID
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Save to IndexedDB with compression
      const objectUrl = await saveImage(imageId, file);

      // Update component with image reference
      updateComponent(sectionId, componentId, {
        imageId,
        content: file.name,
      });

      // Store object URL for display
      setImageUrls((prev) => ({ ...prev, [imageId]: objectUrl }));

      setImageUploadTarget(null);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try a smaller file.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDrop = (
    e: React.DragEvent,
    sectionId: string,
    componentId: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file, sectionId, componentId);
    }
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (
    e: React.DragEvent,
    sectionId: string,
    columnIndex?: number,
    layoutId?: string,
    span?: "full" | "column",
    insertIndex?: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSection(null);
    setDragOverColumn(null);
    setDragOverLayout(null);
    setDragOverLayoutColumn(null);
    setInsertTarget(null);

    const componentType = e.dataTransfer.getData("componentType");
    const layoutTemplateId = e.dataTransfer.getData("layoutTemplateId");
    const draggedComponentId = e.dataTransfer.getData("componentId");
    const fromSectionId = e.dataTransfer.getData("fromSectionId");
    const fromLayoutId = e.dataTransfer.getData("fromLayoutId");

    if (layoutTemplateId) {
      const template = SECTION_TEMPLATES.find((t) => t.id === layoutTemplateId);
      if (!template) return;

      const layoutProps =
        span === "full"
          ? { span: "full" }
          : columnIndex !== undefined
            ? { span: "column", columnIndex }
            : undefined;

      const newLayout: Component = {
        id: generateId(),
        type: "layout",
        content: "",
        styles: {},
        layoutType: template.id,
        columns: template.columns,
        columnWidths: template.columnWidths,
        children: [],
        props: layoutProps,
      };

      if (layoutId) {
        addComponentToLayout(sectionId, layoutId, newLayout);
      } else {
        addComponent(sectionId, newLayout);
      }

      if (showOnboarding) setShowOnboarding(false);
      return;
    }

    if (componentType) {
      const defaultContent: Record<string, string> = {
        heading: "Your Heading Here",
        paragraph:
          "This is a paragraph. Click to edit and add your own content.",
        image: "Image Placeholder",
        button: "Click Me",
        divider: "",
        spacer: "",
        card: "Card Title",
        list: "Item 1, Item 2, Item 3",
      };

      const componentProps =
        span === "full"
          ? { span: "full" }
          : columnIndex !== undefined
            ? { span: "column", columnIndex }
            : undefined;

      const newComponent: Component = {
        id: generateId(),
        type: componentType as Component["type"],
        content: defaultContent[componentType] || "",
        styles: {},
        props: componentProps,
        formatting:
          componentType === "heading" || componentType === "paragraph"
            ? { align: "center" }
            : undefined,
        width: componentType === "image" ? "100%" : undefined,
        height: componentType === "spacer" ? "4rem" : undefined,
      };

      if (layoutId) {
        addComponentToLayout(sectionId, layoutId, newComponent, insertIndex);
      } else {
        addComponent(sectionId, newComponent, insertIndex);
      }

      // Hide onboarding after first interaction
      if (showOnboarding) setShowOnboarding(false);
    } else if (draggedComponentId && fromSectionId) {
      const section = currentProject?.layout.find((s) => s.id === sectionId);
      let newIndex =
        insertIndex ??
        (layoutId
          ? (() => {
              const layoutComp = section
                ? findComponentInTree(section.components, layoutId)
                : null;
              if (layoutComp && layoutComp.type === "layout") {
                return layoutComp.children?.length || 0;
              }
              return 0;
            })()
          : section?.components.length || 0);

      if (insertIndex !== undefined && fromSectionId === sectionId) {
        if (layoutId) {
          const layoutComp = section
            ? findComponentInTree(section.components, layoutId)
            : null;
          const oldIndex =
            layoutComp && layoutComp.type === "layout"
              ? (layoutComp.children || []).findIndex(
                  (c) => c.id === draggedComponentId,
                )
              : -1;
          if (oldIndex >= 0 && newIndex > oldIndex) newIndex -= 1;
        } else {
          const oldIndex = section
            ? section.components.findIndex((c) => c.id === draggedComponentId)
            : -1;
          if (oldIndex >= 0 && newIndex > oldIndex) newIndex -= 1;
        }
      }

      moveComponent(fromSectionId, sectionId, draggedComponentId, newIndex, {
        targetColumnIndex: span === "full" ? undefined : columnIndex,
        targetSpan: span === "full" ? "full" : "column",
        fromLayoutId: fromLayoutId || null,
        toLayoutId: layoutId || null,
      });
    }
  };

  const handleDragOver = (
    e: React.DragEvent,
    sectionId: string,
    columnIndex?: number,
    layoutId?: string,
    span?: "full" | "column",
  ) => {
    e.preventDefault();
    autoScrollNearestViewport(e);
    
    // Clear section insertion target when dragging into a section (element drag)
    setSectionInsertTarget(null);
    
    if (layoutId) {
      setDragOverSection(null);
      setDragOverColumn(null);
      setDragOverLayout(layoutId);
      if (span === "full") {
        setDragOverLayoutColumn(-1);
      } else if (columnIndex !== undefined) {
        setDragOverLayoutColumn(columnIndex);
      } else {
        setDragOverLayoutColumn(null);
      }
    } else {
      setDragOverLayout(null);
      setDragOverLayoutColumn(null);
      setDragOverSection(sectionId);
      if (span === "full") {
        setDragOverColumn(-1);
      } else if (columnIndex !== undefined) {
        setDragOverColumn(columnIndex);
      } else {
        setDragOverColumn(null);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSection(null);
    setDragOverColumn(null);
    setDragOverLayout(null);
    setDragOverLayoutColumn(null);
    setInsertTarget(null);
    setSectionInsertTarget(null);
  };

  const handleComponentDragStart = (
    e: React.DragEvent,
    sectionId: string,
    componentId: string,
    fromLayoutId?: string | null,
  ) => {
    e.dataTransfer.setData("componentId", componentId);
    e.dataTransfer.setData("fromSectionId", sectionId);
    if (fromLayoutId) {
      e.dataTransfer.setData("fromLayoutId", fromLayoutId);
    }
    e.dataTransfer.effectAllowed = "move";
    setDraggingType("component");
  };

  // Handle section-level drag events for precise insertion
  const handleSectionSlotDragOver = (e: React.DragEvent, index: number, placement: "before" | "after") => {
    e.preventDefault();
    e.stopPropagation();
    autoScrollNearestViewport(e);
    
    // Check if it's a section template being dragged
    // Note: Can only check types array during dragover, not getData()
    const types = e.dataTransfer.types;
    const hasLayoutTemplate = types.includes("layouttemplateid") || types.some(t => t.toLowerCase() === "layouttemplateid");
    const hasDragType = types.includes("dragtype") || types.some(t => t.toLowerCase() === "dragtype");
    
    // If dragging a section template, show section insertion indicator
    if (hasLayoutTemplate || (hasDragType && draggingType === "section")) {
      setSectionInsertTarget({ index, placement });
      setDragOverSection(null);
      setDragOverColumn(null);
      setDragOverLayout(null);
      setDragOverLayoutColumn(null);
    }
  };

  const handleSectionSlotDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const layoutTemplateId = e.dataTransfer.getData("layoutTemplateId");
    
    if (layoutTemplateId) {
      const template = SECTION_TEMPLATES.find((t) => t.id === layoutTemplateId);
      if (template) {
        addSection(template.id, template, index);
        if (showOnboarding) setShowOnboarding(false);
      }
    }
    
    setSectionInsertTarget(null);
    setDraggingType(null);
  };

  const handleGlobalDragEnd = () => {
    setDraggingType(null);
    setSectionInsertTarget(null);
    setDragOverSection(null);
    setDragOverColumn(null);
    setDragOverLayout(null);
    setDragOverLayoutColumn(null);
    setInsertTarget(null);
  };

  const handleSaveEdit = () => {
    if (!editingComponent) return;
    updateComponent(
      editingComponent.sectionId,
      editingComponent.component.id,
      editingComponent.component,
    );
    setEditingComponent(null);
  };

  // Column resizing handlers
  const handleResizeStart = useCallback(
    (sectionId: string, dividerIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      setResizingSection(sectionId);
      setResizingDivider(dividerIndex);
    },
    [],
  );

  const handleResizeMove = useCallback(
    (e: React.MouseEvent) => {
      if (!resizingSection || resizingDivider === null || !containerRef.current)
        return;

      // Store position for RAF processing
      pendingResizeRef.current = { x: e.clientX, y: e.clientY };

      // Use requestAnimationFrame for smooth, optimized updates
      if (resizeAnimationFrameRef.current === null) {
        resizeAnimationFrameRef.current = requestAnimationFrame(() => {
          if (!pendingResizeRef.current || !containerRef.current) {
            resizeAnimationFrameRef.current = null;
            return;
          }

          const { x } = pendingResizeRef.current;
          const section = currentProject?.layout.find(
            (s) => s.id === resizingSection,
          );
          if (!section || !section.columnWidths) {
            resizeAnimationFrameRef.current = null;
            return;
          }

          const sectionElement = containerRef.current.querySelector(
            `[data-section-id="${resizingSection}"]`,
          );
          if (!sectionElement) {
            resizeAnimationFrameRef.current = null;
            return;
          }

          const sectionRect = sectionElement.getBoundingClientRect();
          const relativeX = x - sectionRect.left;
          const sectionWidth = sectionRect.width;

          // Calculate new widths as percentages
          const totalColumns = section.columns;
          const percentage = Math.max(
            15,
            Math.min(85, (relativeX / sectionWidth) * 100),
          );

          // For 2 columns, split at the divider position
          if (totalColumns === 2 && resizingDivider === 0) {
            const newWidths = [`${percentage}%`, `${100 - percentage}%`];
            updateSection(resizingSection, { columnWidths: newWidths }, true);
          }
          // For 3+ columns, adjust adjacent columns
          else if (totalColumns > 2) {
            const colWidth = sectionWidth / totalColumns;
            const targetPercentage =
              (((resizingDivider + 1) * colWidth) / sectionWidth) * 100;
            const diff = percentage - targetPercentage;

            const newWidths = section.columnWidths.map((w, i) => {
              const currentVal = parseFloat(w) || 100 / totalColumns;
              if (i === resizingDivider) return `${currentVal + diff}%`;
              if (i === resizingDivider + 1)
                return `${Math.max(15, currentVal - diff)}%`;
              return w;
            });
            updateSection(resizingSection, { columnWidths: newWidths }, true);
          }

          resizeAnimationFrameRef.current = null;
        });
      }
    },
    [resizingSection, resizingDivider, currentProject, updateSection],
  );

  const handleResizeEnd = useCallback(() => {
    // Cancel any pending animation frame
    if (resizeAnimationFrameRef.current !== null) {
      cancelAnimationFrame(resizeAnimationFrameRef.current);
      resizeAnimationFrameRef.current = null;
    }
    pendingResizeRef.current = null;

    // Save to history when resize operation completes
    if (resizingSection || resizingComponent || resizingSectionHeight) {
      saveToHistory("Resized element");
    }

    setResizingSection(null);
    setResizingDivider(null);
    setResizingComponent(null);
    setResizingSectionHeight(null);
  }, [
    resizingSection,
    resizingComponent,
    resizingSectionHeight,
    saveToHistory,
  ]);

  // Component resize handlers
  const handleComponentResizeStart = useCallback(
    (
      e: React.MouseEvent,
      sectionId: string,
      componentId: string,
      direction: "width" | "height",
    ) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingComponent({ sectionId, componentId, direction });
    },
    [],
  );

  const handleComponentResizeMove = useCallback(
    (e: React.MouseEvent) => {
      if (!resizingComponent || !containerRef.current) return;

      // Store position for RAF processing
      pendingResizeRef.current = { x: e.clientX, y: e.clientY };

      // Use requestAnimationFrame for smooth updates
      if (resizeAnimationFrameRef.current === null) {
        resizeAnimationFrameRef.current = requestAnimationFrame(() => {
          if (!pendingResizeRef.current) {
            resizeAnimationFrameRef.current = null;
            return;
          }

          const { x, y } = pendingResizeRef.current;
          const section = currentProject?.layout.find(
            (s) => s.id === resizingComponent.sectionId,
          );
          const component = section
            ? findComponentInTree(
                section.components,
                resizingComponent.componentId,
              )
            : null;
          if (!component) {
            resizeAnimationFrameRef.current = null;
            return;
          }

          const componentElement = document.querySelector(
            `[data-component-id="${resizingComponent.componentId}"]`,
          );
          if (!componentElement) {
            resizeAnimationFrameRef.current = null;
            return;
          }

          const rect = componentElement.getBoundingClientRect();

          if (resizingComponent.direction === "width") {
            const newWidth = Math.max(100, x - rect.left);
            updateComponent(
              resizingComponent.sectionId,
              resizingComponent.componentId,
              {
                width: `${newWidth}px`,
              },
              true,
            );
          } else {
            const newHeight = Math.max(50, y - rect.top);
            updateComponent(
              resizingComponent.sectionId,
              resizingComponent.componentId,
              {
                height: `${newHeight}px`,
              },
              true,
            );
          }

          resizeAnimationFrameRef.current = null;
        });
      }
    },
    [resizingComponent, currentProject, updateComponent],
  );

  // Section height resize handlers
  const handleSectionHeightResizeStart = useCallback(
    (e: React.MouseEvent, sectionId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingSectionHeight(sectionId);
    },
    [],
  );

  const handleSectionHeightResizeMove = useCallback(
    (e: React.MouseEvent) => {
      if (!resizingSectionHeight || !containerRef.current) return;

      // Store position for RAF processing
      pendingResizeRef.current = { x: e.clientX, y: e.clientY };

      // Use requestAnimationFrame for smooth updates
      if (resizeAnimationFrameRef.current === null) {
        resizeAnimationFrameRef.current = requestAnimationFrame(() => {
          if (!pendingResizeRef.current || !containerRef.current) {
            resizeAnimationFrameRef.current = null;
            return;
          }

          const { y } = pendingResizeRef.current;
          const sectionElement = containerRef.current.querySelector(
            `[data-section-id="${resizingSectionHeight}"]`,
          );
          if (!sectionElement) {
            resizeAnimationFrameRef.current = null;
            return;
          }

          const rect = sectionElement.getBoundingClientRect();
          const newHeight = Math.max(100, y - rect.top);
          updateSection(
            resizingSectionHeight,
            { minHeight: `${newHeight}px` },
            true,
          );

          resizeAnimationFrameRef.current = null;
        });
      }
    },
    [resizingSectionHeight, updateSection],
  );

  const renderComponent = (
    component: Component,
    sectionId: string,
    parentLayoutId?: string | null,
  ) => {
    const baseStyles = "relative group";
    const isResizing = resizingComponent?.componentId === component.id;
    const componentProps = (component.props ?? {}) as Record<string, unknown>;

    const componentContent = () => {
      switch (component.type) {
        case "layout":
          const cols = component.columns || 1;
          const children = component.children || [];
          const childrenByColumn: Record<number, Component[]> = {};
          const fullWidthChildren: Component[] = [];
          for (let i = 0; i < cols; i++) childrenByColumn[i] = [];
          children.forEach((child) => {
            if (
              (child.props as Record<string, unknown> | undefined)?.span ===
              "full"
            ) {
              fullWidthChildren.push(child);
              return;
            }
            const colIndex = (child.props?.columnIndex as number) ?? 0;
            const targetCol = Math.min(colIndex, cols - 1);
            if (!childrenByColumn[targetCol]) childrenByColumn[targetCol] = [];
            childrenByColumn[targetCol].push(child);
          });

          const gridStyle: React.CSSProperties =
            viewport === "mobile"
              ? { display: "flex", flexDirection: "column", gap: "1rem" }
              : component.columnWidths && component.columnWidths.length > 0
                ? {
                    display: "grid",
                    gridTemplateColumns: component.columnWidths.join(" "),
                    gap: "0",
                    minWidth: 0, // Prevents grid overflow
                  }
                : {
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: "0",
                    minWidth: 0, // Prevents grid overflow
                  };

          const renderLayoutChildWithInsert = (
            child: Component,
            idxWithinGroup: number,
            groupType:
              | { span: "full" }
              | { span: "column"; columnIndex: number },
          ) => {
            return (
              <div
                key={child.id}
                className="relative"
                onDragOver={(e) => {
                  const rect = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect();
                  const before = e.clientY < rect.top + rect.height / 2;
                  const desired = before ? idxWithinGroup : idxWithinGroup + 1;
                  const insertAt = computeGroupedInsertIndex(children, {
                    targetSpan: groupType.span,
                    targetColumnIndex:
                      groupType.span === "column"
                        ? groupType.columnIndex
                        : undefined,
                    desiredIndexWithin: desired,
                    maxColumns: cols,
                  });
                  setInsertTarget({
                    sectionId,
                    layoutId: component.id,
                    insertIndex: insertAt,
                    columnIndex:
                      groupType.span === "column"
                        ? groupType.columnIndex
                        : undefined,
                    span: groupType.span,
                    anchorId: child.id,
                    placement: before ? "before" : "after",
                  });
                  handleDragOver(
                    e,
                    sectionId,
                    groupType.span === "column"
                      ? groupType.columnIndex
                      : undefined,
                    component.id,
                    groupType.span === "full" ? "full" : undefined,
                  );
                }}
                onDrop={(e) => {
                  const rect = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect();
                  const before = e.clientY < rect.top + rect.height / 2;
                  const desired = before ? idxWithinGroup : idxWithinGroup + 1;
                  const insertAt = computeGroupedInsertIndex(children, {
                    targetSpan: groupType.span,
                    targetColumnIndex:
                      groupType.span === "column"
                        ? groupType.columnIndex
                        : undefined,
                    desiredIndexWithin: desired,
                    maxColumns: cols,
                  });
                  handleDrop(
                    e,
                    sectionId,
                    groupType.span === "column"
                      ? groupType.columnIndex
                      : undefined,
                    component.id,
                    groupType.span === "full" ? "full" : undefined,
                    insertAt,
                  );
                }}
                onDragLeave={handleDragLeave}
              >
                {insertTarget?.layoutId === component.id &&
                  insertTarget.anchorId === child.id &&
                  insertTarget.placement === "before" && (
                    <div className="pointer-events-none absolute left-0 right-0 top-0 h-0.5 bg-primary" />
                  )}
                {renderComponent(child, sectionId, component.id)}
                {insertTarget?.layoutId === component.id &&
                  insertTarget.anchorId === child.id &&
                  insertTarget.placement === "after" && (
                    <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-0.5 bg-primary" />
                  )}
              </div>
            );
          };

          return (
            <div
              className={
                showBorders
                  ? `relative rounded-lg border border-border bg-muted/20 ${
                      viewport === "mobile" ? "p-0" : "p-2"
                    }`
                  : "relative"
              }
              style={{ minWidth: 0 }}
            >
              {parentLayoutId !== undefined && (
                <>
                  <div
                    className="absolute left-0 right-0 top-0 h-3"
                    onDrop={(e) => {
                      const dragFromLayoutId =
                        e.dataTransfer.getData("fromLayoutId");
                      if (dragFromLayoutId !== component.id) return;
                      const parentSpan = (
                        component.props as Record<string, unknown> | undefined
                      )?.span;
                      const parentColIndex =
                        (component.props?.columnIndex as number | undefined) ??
                        0;
                      handleDrop(
                        e,
                        sectionId,
                        parentSpan === "full" ? undefined : parentColIndex,
                        parentLayoutId || undefined,
                        parentSpan === "full" ? "full" : undefined,
                      );
                    }}
                    onDragOver={(e) => {
                      const dragFromLayoutId =
                        e.dataTransfer.getData("fromLayoutId");
                      if (dragFromLayoutId !== component.id) return;
                      const parentSpan = (
                        component.props as Record<string, unknown> | undefined
                      )?.span;
                      const parentColIndex =
                        (component.props?.columnIndex as number | undefined) ??
                        0;
                      handleDragOver(
                        e,
                        sectionId,
                        parentSpan === "full" ? undefined : parentColIndex,
                        parentLayoutId || undefined,
                        parentSpan === "full" ? "full" : undefined,
                      );
                    }}
                    onDragLeave={handleDragLeave}
                  />
                  <div
                    className="absolute left-0 right-0 bottom-0 h-3"
                    onDrop={(e) => {
                      const dragFromLayoutId =
                        e.dataTransfer.getData("fromLayoutId");
                      if (dragFromLayoutId !== component.id) return;
                      const parentSpan = (
                        component.props as Record<string, unknown> | undefined
                      )?.span;
                      const parentColIndex =
                        (component.props?.columnIndex as number | undefined) ??
                        0;
                      handleDrop(
                        e,
                        sectionId,
                        parentSpan === "full" ? undefined : parentColIndex,
                        parentLayoutId || undefined,
                        parentSpan === "full" ? "full" : undefined,
                      );
                    }}
                    onDragOver={(e) => {
                      const dragFromLayoutId =
                        e.dataTransfer.getData("fromLayoutId");
                      if (dragFromLayoutId !== component.id) return;
                      const parentSpan = (
                        component.props as Record<string, unknown> | undefined
                      )?.span;
                      const parentColIndex =
                        (component.props?.columnIndex as number | undefined) ??
                        0;
                      handleDragOver(
                        e,
                        sectionId,
                        parentSpan === "full" ? undefined : parentColIndex,
                        parentLayoutId || undefined,
                        parentSpan === "full" ? "full" : undefined,
                      );
                    }}
                    onDragLeave={handleDragLeave}
                  />
                </>
              )}
              <div className="relative" style={gridStyle}>
                {dragOverLayout === component.id &&
                  dragOverLayoutColumn === -1 && (
                    <div
                      className="pointer-events-none absolute left-1 right-1 top-full h-0.5 bg-primary"
                      style={{ marginTop: "6px" }}
                    />
                  )}
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    onDrop={(e) => {
                      const isFull = shouldInsertFullWidth(e, cols);
                      handleDrop(
                        e,
                        sectionId,
                        isFull ? undefined : colIndex,
                        component.id,
                        isFull ? "full" : undefined,
                      );
                    }}
                    onDragOver={(e) => {
                      const isFull = shouldInsertFullWidth(e, cols);
                      handleDragOver(
                        e,
                        sectionId,
                        isFull ? undefined : colIndex,
                        component.id,
                        isFull ? "full" : undefined,
                      );
                    }}
                    onDragLeave={handleDragLeave}
                    className={`min-h-20 rounded-md border ${
                      viewport === "mobile" ? "p-0" : "p-2"
                    } ${showBorders ? "border-dashed" : "border-transparent"} transition-all ${
                      dragOverLayout === component.id &&
                      dragOverLayoutColumn === colIndex
                        ? "border-primary bg-primary/5"
                        : showBorders
                          ? "border-border/40 hover:border-border"
                          : ""
                    }`}
                    style={{ minWidth: 0, overflow: "hidden" }}
                  >
                    {childrenByColumn[colIndex]?.length === 0 ? (
                      <div className="flex h-16 flex-col items-center justify-center text-xs text-muted-foreground">
                        <Plus className="mb-1 h-4 w-4" />
                        <span>Col {colIndex + 1}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {childrenByColumn[colIndex]?.map((child, i) =>
                          renderLayoutChildWithInsert(child, i, {
                            span: "column",
                            columnIndex: colIndex,
                          }),
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {cols > 1 && (
                <div
                  style={
                    viewport === "mobile"
                      ? { minWidth: 0 }
                      : { gridColumn: "1 / -1", minWidth: 0 }
                  }
                >
                  {fullWidthChildren.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {fullWidthChildren.map((child, i) =>
                        renderLayoutChildWithInsert(child, i, { span: "full" }),
                      )}
                    </div>
                  )}
                  <div
                    onDrop={(e) =>
                      handleDrop(e, sectionId, undefined, component.id, "full")
                    }
                    onDragOver={(e) =>
                      handleDragOver(
                        e,
                        sectionId,
                        undefined,
                        component.id,
                        "full",
                      )
                    }
                    onDragLeave={handleDragLeave}
                    className="h-4"
                  />
                </div>
              )}
            </div>
          );
        case "heading":
          return (
            <h2
              contentEditable
              suppressContentEditableWarning
              className="text-2xl font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1 cursor-text"
              style={{
                fontWeight:
                  component.formatting?.bold !== false ? "bold" : "normal",
                fontStyle: component.formatting?.italic ? "italic" : "normal",
                textDecoration: component.formatting?.underline
                  ? "underline"
                  : "none",
                textAlign: component.formatting?.align || "center",
                fontSize: component.formatting?.fontSize || "1.5rem",
              }}
              onBlur={(e) => {
                const newContent = e.currentTarget.textContent || "";
                if (newContent !== component.content) {
                  updateComponent(sectionId, component.id, { content: newContent });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.currentTarget.blur();
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {component.content || "Click to edit..."}
            </h2>
          );
        case "paragraph":
          return (
            <p
              contentEditable
              suppressContentEditableWarning
              className="leading-relaxed text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1 cursor-text whitespace-pre-wrap"
              style={{
                fontWeight: component.formatting?.bold ? "bold" : "normal",
                fontStyle: component.formatting?.italic ? "italic" : "normal",
                textDecoration: component.formatting?.underline
                  ? "underline"
                  : "none",
                textAlign: component.formatting?.align || "center",
                fontSize: component.formatting?.fontSize || "1rem",
              }}
              onBlur={(e) => {
                const newContent = e.currentTarget.textContent || "";
                if (newContent !== component.content) {
                  updateComponent(sectionId, component.id, { content: newContent });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.currentTarget.blur();
                }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {component.content || "Click to edit..."}
            </p>
          );
        case "image":
          const imageUrl = component.imageId
            ? imageUrls[component.imageId]
            : null;
          const hasFixedHeight = !!component.height;
          const imageHasBorder =
            (componentProps.imageBorder as boolean) ?? false;
          const imageRounded =
            (componentProps.imageRounded as boolean) ?? true; // Default to rounded
          return (
            <div
              data-component-id={component.id}
              className={`relative transition-all ${
                imageRounded ? "overflow-hidden rounded-lg" : ""
              } ${imageHasBorder ? "border border-border" : ""} ${
                isDraggingFile ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
              style={{
                width: component.width || "100%",
                height: component.height || "auto",
                maxWidth: "100%",
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
                    className={
                      hasFixedHeight
                        ? "h-full w-full object-contain"
                        : "h-auto w-full"
                    }
                    style={{
                      maxHeight: hasFixedHeight
                        ? (component.height as string)
                        : "none",
                      objectFit: hasFixedHeight ? "contain" : undefined,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setImageUploadTarget({
                          sectionId,
                          componentId: component.id,
                        })
                      }
                      disabled={uploadingImage}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Change Image
                    </Button>
                  </div>
                </>
              ) : uploadingImage &&
                imageUploadTarget?.componentId === component.id ? (
                <div className="flex h-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
                  <div className="mb-2 h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-xs font-medium text-primary">
                    Uploading...
                  </p>
                </div>
              ) : (
                <div
                  className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5"
                  onClick={() =>
                    setImageUploadTarget({
                      sectionId,
                      componentId: component.id,
                    })
                  }
                >
                  <ImageIcon className="mb-1.5 h-8 w-8 opacity-40" />
                  <p className="text-xs font-medium">
                    Click to add image
                  </p>
                  <p className="mt-0.5 text-[10px] opacity-60">
                    or drag & drop
                  </p>
                </div>
              )}
              {/* Resize handles for images */}
              {imageUrl && (
                <>
                  {/* Corner resize handle */}
                  <div
                    className="absolute bottom-1 right-1 z-20 flex h-6 w-6 cursor-se-resize items-center justify-center rounded-sm bg-primary shadow-md opacity-0 transition-opacity hover:scale-110 group-hover:opacity-100"
                    onMouseDown={(e) =>
                      handleComponentResizeStart(
                        e,
                        sectionId,
                        component.id,
                        "width",
                      )
                    }
                  >
                    <MoveHorizontal className="h-4 w-4 rotate-45 text-white" />
                  </div>
                  {/* Side resize handle */}
                  <div
                    className="absolute bottom-1/2 right-0 z-20 flex h-12 w-3 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-l-md bg-primary/90 shadow-sm opacity-0 transition-all hover:w-4 group-hover:opacity-100"
                    onMouseDown={(e) =>
                      handleComponentResizeStart(
                        e,
                        sectionId,
                        component.id,
                        "width",
                      )
                    }
                  >
                    <MoveHorizontal className="h-4 w-4 text-white" />
                  </div>
                </>
              )}
            </div>
          );
        case "button":
          return (
            <button
              className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const newContent = e.currentTarget.textContent || "";
                if (newContent !== component.content) {
                  updateComponent(sectionId, component.id, { content: newContent });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape" || e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {component.content || "Button"}
            </button>
          );
        case "divider":
          return <hr className="border-border" />;
        case "spacer":
          return (
            <div
              className="relative flex items-center justify-center border-2 border-dashed border-transparent transition-colors group-hover:border-muted-foreground/20"
              style={{ height: component.height || "4rem" }}
              data-component-id={component.id}
            >
              <span className="text-xs text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100">
                Spacer ({component.height || "4rem"})
              </span>
              {/* Height resize handle */}
              <div
                className="absolute bottom-0 left-1/2 z-20 flex h-3 w-16 -translate-x-1/2 cursor-ns-resize items-center justify-center rounded-t-md bg-primary/90 shadow-sm opacity-0 transition-all hover:h-4 group-hover:opacity-100"
                onMouseDown={(e) =>
                  handleComponentResizeStart(
                    e,
                    sectionId,
                    component.id,
                    "height",
                  )
                }
              >
                <MoveVertical className="h-4 w-4 text-white" />
              </div>
            </div>
          );
        case "card":
          return (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3
                contentEditable
                suppressContentEditableWarning
                className="font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1"
                onBlur={(e) => {
                  const newContent = e.currentTarget.textContent || "";
                  if (newContent !== component.content) {
                    updateComponent(sectionId, component.id, { content: newContent });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape" || e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {component.content || "Card Title"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Card content goes here. Click to edit.
              </p>
            </div>
          );
        case "list":
          return (
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              {component.content.split(",").map((item, i) => (
                <li key={i}>{item.trim()}</li>
              ))}
            </ul>
          );

        // Form Components
        case "input":
          return (
            <div className="space-y-1.5">
              {component.label && (
                <label className="text-sm font-medium text-foreground">
                  {component.label}
                  {component.required && <span className="text-destructive ml-1">*</span>}
                </label>
              )}
              <input
                type="text"
                placeholder={component.placeholder || "Enter text..."}
                disabled={component.disabled}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>
          );

        case "textareaField":
          return (
            <div className="space-y-1.5">
              {component.label && (
                <label className="text-sm font-medium text-foreground">
                  {component.label}
                  {component.required && <span className="text-destructive ml-1">*</span>}
                </label>
              )}
              <textarea
                placeholder={component.placeholder || "Enter message..."}
                disabled={component.disabled}
                rows={4}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 resize-none"
              />
            </div>
          );

        case "select":
          return (
            <div className="space-y-1.5">
              {component.label && (
                <label className="text-sm font-medium text-foreground">
                  {component.label}
                  {component.required && <span className="text-destructive ml-1">*</span>}
                </label>
              )}
              <select
                disabled={component.disabled}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              >
                <option value="">Select an option...</option>
                {component.options?.map((opt, i) => (
                  <option key={i} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );

        case "checkbox":
          return (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={component.disabled}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <label className="text-sm text-foreground">
                {component.content || component.label || "Checkbox"}
              </label>
            </div>
          );

        case "radio":
          return (
            <div className="space-y-2">
              {component.label && (
                <label className="text-sm font-medium text-foreground">{component.label}</label>
              )}
              <div className="space-y-1.5">
                {component.options?.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`radio-${component.id}`}
                      disabled={component.disabled}
                      className="h-4 w-4 border-border text-primary focus:ring-primary/20"
                    />
                    <label className="text-sm text-foreground">{opt.label}</label>
                  </div>
                ))}
              </div>
            </div>
          );

        case "form":
          return (
            <div className="rounded-lg border border-border bg-card p-4 space-y-4">
              <div className="text-sm font-medium text-foreground">Form Container</div>
              <p className="text-xs text-muted-foreground">
                Drag form elements here to build your form
              </p>
            </div>
          );

        // Navigation Components
        case "navbar":
          const navItems = component.items || [
            { title: "Home", content: "/" },
            { title: "About", content: "/about" },
            { title: "Contact", content: "/contact" },
          ];
          return (
            <nav className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <div className="font-bold text-foreground">{component.content || "Logo"}</div>
              <div className="flex items-center gap-4">
                {navItems.map((item, i) => (
                  <a
                    key={i}
                    href={item.content}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </nav>
          );

        case "menu":
          return (
            <div className="rounded-lg border border-border bg-card p-2 space-y-1">
              {component.content.split(",").map((item, i) => (
                <div
                  key={i}
                  className="px-3 py-2 text-sm text-foreground rounded-md hover:bg-accent cursor-pointer"
                >
                  {item.trim()}
                </div>
              ))}
            </div>
          );

        case "breadcrumb":
          return (
            <nav className="flex items-center gap-2 text-sm">
              {component.content.split(",").map((item, i, arr) => (
                <React.Fragment key={i}>
                  <span
                    className={
                      i === arr.length - 1
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground cursor-pointer"
                    }
                  >
                    {item.trim()}
                  </span>
                  {i < arr.length - 1 && (
                    <span className="text-muted-foreground">/</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          );

        case "footer":
          return (
            <footer className="rounded-lg border border-border bg-card px-4 py-6">
              <div className="text-center text-sm text-muted-foreground">
                {component.content || "© 2024 Your Company. All rights reserved."}
              </div>
            </footer>
          );

        case "link":
          return (
            <a
              href={component.href || "#"}
              target={component.target || "_self"}
              className="text-primary hover:underline cursor-pointer"
            >
              {component.content || "Click here"}
            </a>
          );

        // Media Components
        case "video":
          return (
            <div className="rounded-lg overflow-hidden border border-border bg-muted/30">
              {component.src ? (
                <video
                  src={component.src}
                  poster={component.poster}
                  controls={component.controls !== false}
                  autoPlay={component.autoplay}
                  className="w-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <svg
                    className="h-12 w-12 mb-2 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm">Video Player</p>
                  <p className="text-xs opacity-70">Add video URL in properties</p>
                </div>
              )}
            </div>
          );

        case "audio":
          return (
            <div className="rounded-lg border border-border bg-card p-4">
              {component.src ? (
                <audio
                  src={component.src}
                  controls={component.controls !== false}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Audio Player</p>
                    <p className="text-xs">Add audio URL in properties</p>
                  </div>
                </div>
              )}
            </div>
          );

        case "embed":
          return (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <svg
                  className="h-10 w-10 mb-2 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                <p className="text-sm font-medium">Embed Content</p>
                <p className="text-xs opacity-70">Add embed code in properties</p>
              </div>
            </div>
          );

        case "icon":
          return (
            <div className="flex items-center justify-center p-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
            </div>
          );

        // Data Display Components
        case "table":
          const tableHeaders = component.headers || ["Column 1", "Column 2", "Column 3"];
          const tableRows = component.rows || [
            ["Cell 1", "Cell 2", "Cell 3"],
            ["Cell 4", "Cell 5", "Cell 6"],
          ];
          return (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {tableHeaders.map((header, i) => (
                      <th
                        key={i}
                        className="px-4 py-2 text-left text-sm font-medium text-foreground"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t border-border">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-2 text-sm text-muted-foreground"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );

        case "badge":
          const badgeVariants: Record<string, string> = {
            default: "bg-primary text-primary-foreground",
            secondary: "bg-secondary text-secondary-foreground",
            destructive: "bg-destructive text-destructive-foreground",
            outline: "border border-border text-foreground",
          };
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                badgeVariants[component.badgeVariant || "default"]
              }`}
            >
              {component.content || "Badge"}
            </span>
          );

        case "avatar":
          return (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
              {component.initials || "AB"}
            </div>
          );

        case "progress":
          const progressValue = component.value ?? 50;
          const progressMax = component.max ?? 100;
          const percentage = (progressValue / progressMax) * 100;
          return (
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {progressValue}/{progressMax}
              </p>
            </div>
          );

        // Advanced Layout Components
        case "grid":
          return (
            <div className="grid grid-cols-3 gap-2 rounded-lg border border-dashed border-border p-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="flex h-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground"
                >
                  Grid {n}
                </div>
              ))}
            </div>
          );

        case "flex":
          return (
            <div className="flex gap-2 rounded-lg border border-dashed border-border p-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="flex h-16 flex-1 items-center justify-center rounded bg-muted text-xs text-muted-foreground"
                >
                  Flex {n}
                </div>
              ))}
            </div>
          );

        case "accordion":
          const accordionItems = component.items || [
            { title: "Section 1", content: "Content for section 1" },
            { title: "Section 2", content: "Content for section 2" },
          ];
          return (
            <div className="rounded-lg border border-border divide-y divide-border">
              {accordionItems.map((item, i) => (
                <div key={i}>
                  <button className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-accent">
                    {item.title}
                    <svg
                      className="h-4 w-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {i === 0 && (
                    <div className="px-4 py-3 text-sm text-muted-foreground bg-muted/30">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );

        case "tabs":
          const tabItems = component.items || [
            { title: "Tab 1", content: "Content for tab 1" },
            { title: "Tab 2", content: "Content for tab 2" },
          ];
          const activeTab = component.activeIndex ?? 0;
          return (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex border-b border-border bg-muted/30">
                {tabItems.map((item, i) => (
                  <button
                    key={i}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      i === activeTab
                        ? "text-foreground bg-background border-b-2 border-primary -mb-px"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
              <div className="p-4 text-sm text-muted-foreground">
                {tabItems[activeTab]?.content || "Tab content"}
              </div>
            </div>
          );

        default:
          return <div>{component.content}</div>;
      }
    };

    return (
      <div
        key={component.id}
        draggable
        onDragStart={(e) =>
          handleComponentDragStart(e, sectionId, component.id, parentLayoutId)
        }
        className={`${baseStyles} cursor-move rounded-lg border border-transparent ${
          component.type === "image" ? "p-0" : "p-3"
        } transition-all ${
          component.type === "image"
            ? "hover:border-transparent hover:bg-transparent"
            : "hover:border-border hover:bg-accent/50"
        } ${isResizing ? "ring-2 ring-primary" : ""}`}
        style={{ minWidth: 0, maxWidth: "100%" }}
      >
        {componentContent()}
        <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
    );
  };

  const getGridStyle = (section: LayoutSection): React.CSSProperties => {
    if (viewport === "mobile") {
      return {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      };
    }

    if (section.columnWidths && section.columnWidths.length > 0) {
      return {
        display: "grid",
        gridTemplateColumns: section.columnWidths.join(" "),
        gap: "0",
        minWidth: 0, // Prevents grid overflow
      };
    }

    const cols = section.columns || 1;
    return {
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: "0",
      minWidth: 0, // Prevents grid overflow
    };
  };

  const renderSection = (section: LayoutSection, index: number) => {
    const isDragOver = dragOverSection === section.id;
    const isResizing = resizingSection === section.id;
    const isResizingHeight = resizingSectionHeight === section.id;

    // Group components by column
    const componentsByColumn: Record<number, Component[]> = {};
    const fullWidthComponents: Component[] = [];
    for (let i = 0; i < section.columns; i++) {
      componentsByColumn[i] = [];
    }
    section.components.forEach((comp) => {
      if (
        (comp.props as Record<string, unknown> | undefined)?.span === "full"
      ) {
        fullWidthComponents.push(comp);
        return;
      }
      const colIndex = (comp.props?.columnIndex as number) ?? 0;
      const targetCol = Math.min(colIndex, section.columns - 1);
      if (!componentsByColumn[targetCol]) componentsByColumn[targetCol] = [];
      componentsByColumn[targetCol].push(comp);
    });

    const isEmpty = section.components.length === 0;

    const renderSectionComponentWithInsert = (
      comp: Component,
      idxWithinGroup: number,
      groupType: { span: "full" } | { span: "column"; columnIndex?: number },
    ) => {
      return (
        <div
          key={comp.id}
          className="relative"
          onDragOver={(e) => {
            const rect = (
              e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            const before = e.clientY < rect.top + rect.height / 2;
            const desired = before ? idxWithinGroup : idxWithinGroup + 1;
            const insertAt =
              section.columns <= 1
                ? desired
                : computeGroupedInsertIndex(section.components, {
                    targetSpan: groupType.span,
                    targetColumnIndex:
                      groupType.span === "column"
                        ? (groupType.columnIndex ?? 0)
                        : undefined,
                    desiredIndexWithin: desired,
                    maxColumns: section.columns,
                  });
            setInsertTarget({
              sectionId: section.id,
              insertIndex: insertAt,
              columnIndex:
                groupType.span === "column" ? groupType.columnIndex : undefined,
              span: groupType.span,
              anchorId: comp.id,
              placement: before ? "before" : "after",
            });
            handleDragOver(
              e,
              section.id,
              groupType.span === "column" ? groupType.columnIndex : undefined,
              undefined,
              groupType.span === "full" ? "full" : undefined,
            );
          }}
          onDrop={(e) => {
            const rect = (
              e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            const before = e.clientY < rect.top + rect.height / 2;
            const desired = before ? idxWithinGroup : idxWithinGroup + 1;
            const insertAt =
              section.columns <= 1
                ? desired
                : computeGroupedInsertIndex(section.components, {
                    targetSpan: groupType.span,
                    targetColumnIndex:
                      groupType.span === "column"
                        ? (groupType.columnIndex ?? 0)
                        : undefined,
                    desiredIndexWithin: desired,
                    maxColumns: section.columns,
                  });
            handleDrop(
              e,
              section.id,
              groupType.span === "column" ? groupType.columnIndex : undefined,
              undefined,
              groupType.span === "full" ? "full" : undefined,
              insertAt,
            );
          }}
          onDragLeave={handleDragLeave}
        >
          {insertTarget?.sectionId === section.id &&
            !insertTarget.layoutId &&
            insertTarget.anchorId === comp.id &&
            insertTarget.placement === "before" && (
              <div className="pointer-events-none absolute left-0 right-0 top-0 h-0.5 bg-primary" />
            )}
          {renderComponent(comp, section.id)}
          {insertTarget?.sectionId === section.id &&
            !insertTarget.layoutId &&
            insertTarget.anchorId === comp.id &&
            insertTarget.placement === "after" && (
              <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-0.5 bg-primary" />
            )}
        </div>
      );
    };

    return (
      <section
        key={section.id}
        data-section-id={section.id}
        className={
          showBorders
            ? `group/section relative rounded-lg border transition-all ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              } bg-background ${isResizingHeight ? "ring-2 ring-primary" : ""}`
            : `group/section relative ${
                isDragOver ? "ring-2 ring-primary/30" : ""
              }`
        }
        style={{
          backgroundColor: section.backgroundColor,
          minHeight: section.minHeight || "auto",
        }}
      >
        {showBorders && (
          <>
            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {section.name || `Section ${index + 1}`}
                  <span className="ml-2 opacity-60">
                    {section.columns} col{section.columns > 1 ? "s" : ""}
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
                          👋 Drag elements from the <strong>Elements</strong>{" "}
                          tab or click them to add here!
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
          </>
        )}

        {/* Section Content with Resizable Columns */}
        <div
          className={`relative ${viewport === "mobile" ? "p-0" : "p-2"}`}
          style={getGridStyle(section)}
        >
          {section.columns === 1 ? (
            // Single column
            <div
              onDrop={(e) => handleDrop(e, section.id)}
              onDragOver={(e) => handleDragOver(e, section.id)}
              onDragLeave={handleDragLeave}
              className={`min-h-20 rounded-md border ${
                viewport === "mobile" ? "p-0" : "p-2"
              } ${showBorders ? "border-dashed" : "border-transparent"} transition-all ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : showBorders
                    ? "border-transparent hover:border-border"
                    : ""
              }`}
              style={{ minWidth: 0, overflow: "hidden" }}
            >
              {section.components.length === 0 ? (
                <div className="flex h-16 flex-col items-center justify-center text-xs text-muted-foreground">
                  <Plus className="mb-1 h-5 w-5" />
                  <span>Drop elements here</span>
                  <span className="mt-0.5 text-[10px] opacity-70">
                    or click elements in the panel
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {section.components.map((comp, i) =>
                    renderSectionComponentWithInsert(comp, i, {
                      span: "column",
                    }),
                  )}
                </div>
              )}
            </div>
          ) : (
            // Multi-column layout with resizable dividers
            <>
              {Array.from({ length: section.columns }).map((_, colIndex) => (
                <React.Fragment key={colIndex}>
                  <div
                    onDrop={(e) => {
                      const isFull = shouldInsertFullWidth(e, section.columns);
                      handleDrop(
                        e,
                        section.id,
                        isFull ? undefined : colIndex,
                        undefined,
                        isFull ? "full" : undefined,
                      );
                    }}
                    onDragOver={(e) => {
                      const isFull = shouldInsertFullWidth(e, section.columns);
                      handleDragOver(
                        e,
                        section.id,
                        isFull ? undefined : colIndex,
                        undefined,
                        isFull ? "full" : undefined,
                      );
                    }}
                    onDragLeave={handleDragLeave}
                    className={`min-h-20 rounded-md border ${
                      viewport === "mobile" ? "p-0" : "p-2"
                    } ${showBorders ? "border-dashed" : "border-transparent"} transition-all ${
                      isDragOver && dragOverColumn === colIndex
                        ? "border-primary bg-primary/5"
                        : showBorders
                          ? "border-border/40 hover:border-border"
                          : ""
                    }`}
                    style={{ minWidth: 0, overflow: "hidden" }}
                  >
                    {componentsByColumn[colIndex]?.length === 0 ? (
                      <div className="flex h-16 flex-col items-center justify-center text-xs text-muted-foreground">
                        <Plus className="mb-1 h-4 w-4" />
                        <span>Col {colIndex + 1}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {componentsByColumn[colIndex]?.map((comp, i) =>
                          renderSectionComponentWithInsert(comp, i, {
                            span: "column",
                            columnIndex: colIndex,
                          }),
                        )}
                      </div>
                    )}
                  </div>

                  {/* Resizable Divider */}
                  {colIndex < section.columns - 1 && viewport !== "mobile" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`group/divider absolute top-8 bottom-0 z-10 flex w-6 -translate-x-1/2 cursor-col-resize items-center justify-center transition-colors ${
                              isResizing && resizingDivider === colIndex
                                ? "bg-primary/10"
                                : "hover:bg-primary/5"
                            }`}
                            style={{
                              left: section.columnWidths
                                ? `calc(${section.columnWidths
                                    .slice(0, colIndex + 1)
                                    .reduce((acc, w) => {
                                      const val = parseFloat(w);
                                      return (
                                        acc +
                                        (isNaN(val)
                                          ? 100 / section.columns
                                          : val)
                                      );
                                    }, 0)}%)`
                                : `${((colIndex + 1) / section.columns) * 100}%`,
                            }}
                            onMouseDown={(e) =>
                              handleResizeStart(section.id, colIndex, e)
                            }
                          >
                            <div
                              className={`flex h-12 w-1.5 items-center justify-center rounded-full transition-all ${
                                isResizing && resizingDivider === colIndex
                                  ? "bg-primary w-2"
                                  : "bg-border group-hover/divider:bg-primary/70 group-hover/divider:w-2"
                              }`}
                            >
                              <GripHorizontal
                                className={`absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-90 transition-opacity ${
                                  isResizing && resizingDivider === colIndex
                                    ? "text-primary opacity-100"
                                    : "text-muted-foreground opacity-0 group-hover/divider:opacity-100"
                                }`}
                              />
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

              {isDragOver && dragOverColumn === -1 && (
                <div className="pointer-events-none absolute left-3 right-3 bottom-1.5 h-0.5 bg-primary" />
              )}

              <div
                style={
                  viewport === "mobile"
                    ? { minWidth: 0 }
                    : { gridColumn: "1 / -1", minWidth: 0 }
                }
              >
                {fullWidthComponents.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {fullWidthComponents.map((comp, i) =>
                      renderSectionComponentWithInsert(comp, i, {
                        span: "full",
                      }),
                    )}
                  </div>
                )}
                <div
                  onDrop={(e) =>
                    handleDrop(e, section.id, undefined, undefined, "full")
                  }
                  onDragOver={(e) =>
                    handleDragOver(e, section.id, undefined, undefined, "full")
                  }
                  onDragLeave={handleDragLeave}
                  className="h-4"
                />
              </div>
            </>
          )}
        </div>

        {/* Section Height Resize Handle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute bottom-0 left-1/2 z-10 flex h-4 w-20 -translate-x-1/2 cursor-ns-resize items-center justify-center rounded-t-md bg-primary/10 opacity-0 transition-all hover:h-5 hover:bg-primary/20 group-hover/section:opacity-100"
                onMouseDown={(e) =>
                  handleSectionHeightResizeStart(e, section.id)
                }
              >
                <MoveVertical
                  className={`h-4 w-4 transition-colors ${
                    isResizingHeight ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Drag to adjust section height</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </section>
    );
  };

  return (
    <TooltipProvider>
      <div
        className="flex h-full flex-col bg-muted/20"
        onMouseMove={(e) => {
          if (resizingSection) handleResizeMove(e);
          if (resizingComponent) handleComponentResizeMove(e);
          if (resizingSectionHeight) handleSectionHeightResizeMove(e);
        }}
        onMouseUp={handleResizeEnd}
        onMouseLeave={handleResizeEnd}
      >
        {/* Viewport Controls */}
        <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2">
          <div className="flex items-center gap-1">
            <Button
              variant={viewport === "desktop" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setViewport("desktop")}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="text-xs">Desktop</span>
            </Button>
            <Button
              variant={viewport === "tablet" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setViewport("tablet")}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span className="text-xs">Tablet</span>
            </Button>
            <Button
              variant={viewport === "mobile" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setViewport("mobile")}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="text-xs">Mobile</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1">
                  <Checkbox
                    checked={showBorders}
                    onCheckedChange={(checked) => {
                      setBordersTouched(true);
                      setShowBorders(checked === true);
                    }}
                  />
                  <span className="text-xs text-foreground">Borders</span>
                </label>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Toggle editor borders/frames</p>
              </TooltipContent>
            </Tooltip>

            {showOnboarding &&
              currentProject &&
              currentProject.layout.length > 0 && (
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
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div
                ref={containerRef}
                className={`mx-auto rounded-lg border border-border bg-background shadow-sm transition-all duration-300 ${
                  resizingSection || resizingComponent || resizingSectionHeight
                    ? "select-none"
                    : ""
                }`}
                style={{
                  maxWidth: viewportWidths[viewport],
                  width: "100%",
                }}
              >
                <div className="p-4">
                  {!currentProject || currentProject.layout.length === 0 ? (
                    <div 
                      className={`flex h-48 flex-col items-center justify-center text-center border-2 border-dashed rounded-lg transition-all ${
                        sectionInsertTarget ? "border-primary bg-primary/5" : "border-transparent"
                      }`}
                      onDragOver={(e) => handleSectionSlotDragOver(e, 0, "before")}
                      onDrop={(e) => handleSectionSlotDrop(e, 0)}
                      onDragLeave={handleDragLeave}
                    >
                      {sectionInsertTarget ? (
                        <>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white mb-3">
                            <Plus className="h-5 w-5" />
                          </div>
                          <p className="font-medium text-primary">
                            Drop Section Here
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="mb-3 rounded-full bg-muted p-3">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="font-medium text-foreground">
                            Start Building
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Add sections from the <strong>Sections</strong> tab on
                            the left
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground/70">
                            💡 Tip: Drag and drop section templates here
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div 
                      className="space-y-4"
                      onDragEnd={handleGlobalDragEnd}
                    >
                      {currentProject.layout.map((section, index) => (
                        <React.Fragment key={section.id}>
                          {/* Section insertion indicator - before */}
                          <div
                            className={`relative transition-all ${
                              sectionInsertTarget?.index === index && sectionInsertTarget?.placement === "before"
                                ? "h-3"
                                : "h-0"
                            }`}
                            onDragOver={(e) => handleSectionSlotDragOver(e, index, "before")}
                            onDrop={(e) => handleSectionSlotDrop(e, index)}
                            onDragLeave={handleDragLeave}
                          >
                            {sectionInsertTarget?.index === index && sectionInsertTarget?.placement === "before" && (
                              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <div className="h-0.5 flex-1 bg-primary rounded-full" />
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs">
                                  <Plus className="h-3 w-3" />
                                </div>
                                <div className="h-0.5 flex-1 bg-primary rounded-full" />
                              </div>
                            )}
                          </div>
                          
                          {/* Invisible drop zone above each section */}
                          <div
                            className="h-2 -mb-2 relative z-10"
                            onDragOver={(e) => handleSectionSlotDragOver(e, index, "before")}
                            onDrop={(e) => handleSectionSlotDrop(e, index)}
                            onDragLeave={handleDragLeave}
                          />
                          
                          {renderSection(section, index)}
                          
                          {/* Invisible drop zone below each section (only for last item) */}
                          {index === currentProject.layout.length - 1 && (
                            <>
                              <div
                                className="h-2 -mt-2 relative z-10"
                                onDragOver={(e) => handleSectionSlotDragOver(e, index + 1, "before")}
                                onDrop={(e) => handleSectionSlotDrop(e, index + 1)}
                                onDragLeave={handleDragLeave}
                              />
                              {/* Section insertion indicator - after last */}
                              <div
                                className={`relative transition-all ${
                                  sectionInsertTarget?.index === index + 1
                                    ? "h-3"
                                    : "h-0"
                                }`}
                                onDragOver={(e) => handleSectionSlotDragOver(e, index + 1, "before")}
                                onDrop={(e) => handleSectionSlotDrop(e, index + 1)}
                                onDragLeave={handleDragLeave}
                              >
                                {sectionInsertTarget?.index === index + 1 && (
                                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <div className="h-0.5 flex-1 bg-primary rounded-full" />
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs">
                                      <Plus className="h-3 w-3" />
                                    </div>
                                    <div className="h-0.5 flex-1 bg-primary rounded-full" />
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Edit Component Dialog */}
        <Dialog
          open={!!editingComponent}
          onOpenChange={() => setEditingComponent(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {editingComponent?.component.type}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Rich Text Formatting Toolbar for text components */}
              {editingComponent?.component.type !== "divider" &&
                editingComponent?.component.type !== "spacer" &&
                editingComponent?.component.type !== "image" &&
                editingComponent?.component.type !== "button" && (
                  <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-2">
                    <TooltipProvider>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={
                                editingComponent?.component.formatting?.bold
                                  ? "secondary"
                                  : "ghost"
                              }
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                if (!editingComponent) return;
                                const type = editingComponent.component.type;
                                if (
                                  type === "paragraph" ||
                                  type === "heading"
                                ) {
                                  const ref =
                                    type === "paragraph"
                                      ? paragraphTextareaRef.current
                                      : headingInputRef.current;
                                  if (!ref) return;
                                  const start = ref.selectionStart ?? 0;
                                  const end = ref.selectionEnd ?? 0;
                                  const content =
                                    editingComponent.component.content || "";
                                  if (start === end) {
                                    setEditingComponent({
                                      ...editingComponent,
                                      component: {
                                        ...editingComponent.component,
                                        formatting: {
                                          ...editingComponent.component
                                            .formatting,
                                          bold: !editingComponent.component
                                            .formatting?.bold,
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
                                  const nextStart = hasWrap
                                    ? start - 2
                                    : start + 2;
                                  const nextEnd = hasWrap ? end - 2 : end + 2;
                                  setEditingComponent({
                                    ...editingComponent,
                                    component: {
                                      ...editingComponent.component,
                                      content: newContent,
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
                                  return;
                                }

                                setEditingComponent({
                                  ...editingComponent,
                                  component: {
                                    ...editingComponent.component,
                                    formatting: {
                                      ...editingComponent.component.formatting,
                                      bold: !editingComponent.component
                                        .formatting?.bold,
                                    },
                                  },
                                });
                              }}
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
                                editingComponent?.component.formatting?.italic
                                  ? "secondary"
                                  : "ghost"
                              }
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
                                      italic:
                                        !editingComponent.component.formatting
                                          ?.italic,
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
                                editingComponent?.component.formatting
                                  ?.underline
                                  ? "secondary"
                                  : "ghost"
                              }
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
                                      underline:
                                        !editingComponent.component.formatting
                                          ?.underline,
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
                                editingComponent?.component.formatting
                                  ?.align === "left"
                                  ? "secondary"
                                  : "ghost"
                              }
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
                                editingComponent?.component.formatting
                                  ?.align === "center"
                                  ? "secondary"
                                  : "ghost"
                              }
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
                                editingComponent?.component.formatting
                                  ?.align === "right"
                                  ? "secondary"
                                  : "ghost"
                              }
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
                            editingComponent?.component.formatting?.fontSize ||
                            (editingComponent?.component.type === "heading"
                              ? "1.5rem"
                              : "1rem")
                          }
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
              {editingComponent?.component.type !== "divider" &&
                editingComponent?.component.type !== "spacer" &&
                editingComponent?.component.type !== "image" && (
                  <>
                    {editingComponent?.component.type === "paragraph" ? (
                      <Textarea
                        ref={paragraphTextareaRef}
                        value={editingComponent.component.content}
                        onChange={(e) =>
                          setEditingComponent({
                            ...editingComponent,
                            component: {
                              ...editingComponent.component,
                              content: e.target.value,
                            },
                          })
                        }
                        placeholder="Enter content..."
                        rows={6}
                        className="font-inherit"
                        style={{
                          fontWeight: editingComponent.component.formatting
                            ?.bold
                            ? "bold"
                            : "normal",
                          fontStyle: editingComponent.component.formatting
                            ?.italic
                            ? "italic"
                            : "normal",
                          textDecoration: editingComponent.component.formatting
                            ?.underline
                            ? "underline"
                            : "none",
                          textAlign:
                            editingComponent.component.formatting?.align ||
                            "center",
                          fontSize:
                            editingComponent.component.formatting?.fontSize ||
                            "1rem",
                        }}
                      />
                    ) : editingComponent?.component.type === "heading" ? (
                      <Input
                        ref={headingInputRef}
                        value={editingComponent?.component.content || ""}
                        onChange={(e) =>
                          editingComponent &&
                          setEditingComponent({
                            ...editingComponent,
                            component: {
                              ...editingComponent.component,
                              content: e.target.value,
                            },
                          })
                        }
                        placeholder="Enter heading..."
                        className="text-lg font-inherit"
                        style={{
                          fontWeight:
                            editingComponent.component.formatting?.bold !==
                            false
                              ? "bold"
                              : "normal",
                          fontStyle: editingComponent.component.formatting
                            ?.italic
                            ? "italic"
                            : "normal",
                          textDecoration: editingComponent.component.formatting
                            ?.underline
                            ? "underline"
                            : "none",
                          textAlign:
                            editingComponent.component.formatting?.align ||
                            "center",
                          fontSize:
                            editingComponent.component.formatting?.fontSize ||
                            "1.5rem",
                        }}
                      />
                    ) : (
                      <Input
                        value={editingComponent?.component.content || ""}
                        onChange={(e) =>
                          editingComponent &&
                          setEditingComponent({
                            ...editingComponent,
                            component: {
                              ...editingComponent.component,
                              content: e.target.value,
                            },
                          })
                        }
                        placeholder="Enter content..."
                      />
                    )}
                  </>
                )}

              {editingComponent?.component.type === "image" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Rounded corners</Label>
                    <Button
                      variant={
                        ((
                          editingComponent.component.props as
                            | Record<string, unknown>
                            | undefined
                        )?.imageRounded as boolean)
                          ? "secondary"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        const props = (editingComponent.component.props ??
                          {}) as Record<string, unknown>;
                        const current =
                          (props.imageRounded as boolean) ?? false;
                        setEditingComponent({
                          ...editingComponent,
                          component: {
                            ...editingComponent.component,
                            props: { ...props, imageRounded: !current },
                          },
                        });
                      }}
                    >
                      {((
                        editingComponent.component.props as
                          | Record<string, unknown>
                          | undefined
                      )?.imageRounded as boolean)
                        ? "On"
                        : "Off"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Border</Label>
                    <Button
                      variant={
                        ((
                          editingComponent.component.props as
                            | Record<string, unknown>
                            | undefined
                        )?.imageBorder as boolean)
                          ? "secondary"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        const props = (editingComponent.component.props ??
                          {}) as Record<string, unknown>;
                        const current = (props.imageBorder as boolean) ?? false;
                        setEditingComponent({
                          ...editingComponent,
                          component: {
                            ...editingComponent.component,
                            props: { ...props, imageBorder: !current },
                          },
                        });
                      }}
                    >
                      {((
                        editingComponent.component.props as
                          | Record<string, unknown>
                          | undefined
                      )?.imageBorder as boolean)
                        ? "On"
                        : "Off"}
                    </Button>
                  </div>
                </div>
              )}
              {editingComponent?.component.type === "spacer" && (
                <div className="space-y-2">
                  <Label>Height</Label>
                  <Input
                    value={editingComponent.component.height || "4rem"}
                    onChange={(e) =>
                      setEditingComponent({
                        ...editingComponent,
                        component: {
                          ...editingComponent.component,
                          height: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., 4rem, 100px"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use units like rem, px, vh
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingComponent(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Upload Dialog */}
        <Dialog
          open={!!imageUploadTarget}
          onOpenChange={() => !uploadingImage && setImageUploadTarget(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {uploadingImage ? (
                <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                  <div className="mb-3 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm font-medium text-foreground">
                    Compressing image...
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This may take a moment for large files
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file && imageUploadTarget) {
                        handleFileUpload(
                          file,
                          imageUploadTarget.sectionId,
                          imageUploadTarget.componentId,
                        );
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <Upload className="mb-2 h-12 w-12 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      Drop image here or click to browse
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Supports JPG, PNG, GIF, WebP
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Images will be automatically compressed
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-500/10 p-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">💡 Tip:</p>
                    <p className="mt-1">
                      Images are automatically resized to max 1920x1080 and
                      compressed to save storage space.
                    </p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && imageUploadTarget) {
                    handleFileUpload(
                      file,
                      imageUploadTarget.sectionId,
                      imageUploadTarget.componentId,
                    );
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
      </div>
    </TooltipProvider>
  );
}
