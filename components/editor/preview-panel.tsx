"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useProjectStore } from "@/lib/store";
import type {
  Component,
  LayoutSection,
  CollectionComponentData,
} from "@/lib/types";
import { SECTION_TEMPLATES } from "@/lib/types";
import { saveImage, loadImage } from "@/lib/image-storage";
import { getAllCollections } from "@/lib/mock-collections";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";

// Internal Sub-components
import { ViewportControls, type ViewportSize } from "./preview/viewport-controls";
import { SectionRenderer } from "./preview/section-renderer";
import { ComponentRenderer } from "./preview/component-renderer";
import { EditComponentDialog } from "./preview/dialogs/edit-component-dialog";
import { ImageUploadDialog } from "./preview/dialogs/image-upload-dialog";
import { CollectionEditDialog } from "./preview/dialogs/collection-edit-dialog";

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
    addComponent,
    addComponentToLayout,
    removeComponent,
    updateComponent,
    moveComponent,
    reorderCollectionItems,
    removeSection,
    addSection,
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
  const [dragOverLayoutColumn, setDragOverLayoutColumn] = useState<number | null>(null);
  const [imageUploadTarget, setImageUploadTarget] = useState<{
    sectionId: string;
    componentId: string;
  } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  // Collection State
  const [editingCollection, setEditingCollection] = useState<{
    sectionId: string;
    component: Component;
  } | null>(null);
  const [collectionSearchQuery, setCollectionSearchQuery] = useState("");
  const [collectionSearchResults, setCollectionSearchResults] = useState<any[]>([]);
  const [editingCollectionData, setEditingCollectionData] = useState<CollectionComponentData | null>(null);
  const [draggingCollectionItemIndex, setDraggingCollectionItemIndex] = useState<{
    sectionId: string;
    componentId: string;
    index: number;
  } | null>(null);

  // Insertion State
  const [sectionInsertTarget, setSectionInsertTarget] = useState<{
    index: number;
    placement: "before" | "after";
  } | null>(null);
  const [insertTarget, setInsertTarget] = useState<{
    sectionId: string;
    layoutId?: string;
    insertIndex: number;
    columnIndex?: number;
    span?: "full" | "column";
    anchorId?: string;
    placement?: "before" | "after";
  } | null>(null);
  const [draggingType, setDraggingType] = useState<"section" | "element" | "component" | null>(null);

  // Resizing state
  const [resizingSection, setResizingSection] = useState<string | null>(null);
  const [resizingDivider, setResizingDivider] = useState<number | null>(null);
  const [resizingComponent, setResizingComponent] = useState<{
    sectionId: string;
    componentId: string;
    direction: "width" | "height";
  } | null>(null);
  const [resizingSectionHeight, setResizingSectionHeight] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const resizeAnimationFrameRef = useRef<number | null>(null);
  const pendingResizeRef = useRef<{ x: number; y: number } | null>(null);

  const autoScrollNearestViewport = (
    e: React.DragEvent,
    opts?: { speed?: number; threshold?: number },
  ) => {
    const speed = opts?.speed ?? 18;
    const threshold = opts?.threshold ?? 64;
    const el = e.currentTarget as HTMLElement;
    const viewport = el.closest('[data-slot="scroll-area-viewport"]') as HTMLElement | null;
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
    if (!editorTarget || !currentProject) return;
    const section = currentProject.layout.find((s) => s.id === editorTarget.sectionId);
    if (!section) {
      clearEditorTarget();
      return;
    }
    const comp = findComponentInTree(section.components, editorTarget.componentId);
    if (!comp) {
      clearEditorTarget();
      return;
    }
    setEditingComponent({ sectionId: editorTarget.sectionId, component: comp });
    clearEditorTarget();
  }, [editorTarget, currentProject, clearEditorTarget]);

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

  const handleFileUpload = async (file: File, sectionId: string, componentId: string) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG, GIF, WebP)");
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const shouldContinue = confirm(
        `This image is ${(file.size / 1024 / 1024).toFixed(1)}MB. It will be compressed to reduce storage usage. Continue?`,
      );
      if (!shouldContinue) return;
    }
    setUploadingImage(true);
    try {
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const objectUrl = await saveImage(imageId, file);
      updateComponent(sectionId, componentId, { imageId, content: file.name });
      setImageUrls((prev) => ({ ...prev, [imageId]: objectUrl }));
      setImageUploadTarget(null);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try a smaller file.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDrop = (e: React.DragEvent, sectionId: string, componentId: string) => {
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
      const layoutProps = span === "full" ? { span: "full" } : columnIndex !== undefined ? { span: "column", columnIndex } : undefined;
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
        paragraph: "This is a paragraph. Click to edit and add your own content.",
        image: "Image Placeholder",
        button: "Click Me",
        divider: "",
        spacer: "",
        card: "Card Title",
        list: "Item 1, Item 2, Item 3",
        collection: "Collection",
      };
      const defaultCollectionData: CollectionComponentData = {
        layout: "horizontal",
        sourceType: "api",
        items: [],
        gap: "1rem",
        itemsPerRow: 4,
        showHeader: true,
        headerTitle: "Shop Our Collections",
      };
      const componentProps = span === "full" ? { span: "full" } : columnIndex !== undefined ? { span: "column", columnIndex } : undefined;
      const newComponent: Component = {
        id: generateId(),
        type: componentType as Component["type"],
        content: defaultContent[componentType] || "",
        styles: {},
        props: componentProps,
        formatting: (componentType === "heading" || componentType === "paragraph") ? { align: "center" } : undefined,
        width: componentType === "image" ? "100%" : undefined,
        height: componentType === "spacer" ? "4rem" : undefined,
        ...(componentType === "collection" && { collectionData: defaultCollectionData }),
      };
      if (layoutId) {
        addComponentToLayout(sectionId, layoutId, newComponent, insertIndex);
      } else {
        addComponent(sectionId, newComponent, insertIndex);
      }
      if (showOnboarding) setShowOnboarding(false);
    } else if (draggedComponentId && fromSectionId) {
      const section = currentProject?.layout.find(s => s.id === sectionId);
      const targetIndex = insertIndex ?? (
        layoutId 
          ? (findComponentInTree(section?.components || [], layoutId)?.children?.length || 0)
          : (section?.components.length || 0)
      );

      moveComponent(fromSectionId, sectionId, draggedComponentId, targetIndex, {
        targetColumnIndex: span === "full" ? undefined : columnIndex,
        targetSpan: span === "full" ? "full" : "column",
        fromLayoutId: fromLayoutId || null,
        toLayoutId: layoutId || null,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string, columnIndex?: number, layoutId?: string, span?: "full" | "column") => {
    e.preventDefault();
    autoScrollNearestViewport(e);
    setSectionInsertTarget(null);
    if (layoutId) {
      setDragOverSection(null);
      setDragOverColumn(null);
      setDragOverLayout(layoutId);
      setDragOverLayoutColumn(span === "full" ? -1 : (columnIndex ?? null));
    } else {
      setDragOverLayout(null);
      setDragOverLayoutColumn(null);
      setDragOverSection(sectionId);
      setDragOverColumn(span === "full" ? -1 : (columnIndex ?? null));
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

  const handleComponentDragStart = (e: React.DragEvent, sectionId: string, componentId: string, fromLayoutId?: string | null) => {
    e.dataTransfer.setData("componentId", componentId);
    e.dataTransfer.setData("fromSectionId", sectionId);
    if (fromLayoutId) e.dataTransfer.setData("fromLayoutId", fromLayoutId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingType("component");
  };

  const handleSectionSlotDragOver = (e: React.DragEvent, index: number, placement: "before" | "after") => {
    e.preventDefault();
    e.stopPropagation();
    autoScrollNearestViewport(e);
    const types = e.dataTransfer.types;
    if (types.includes("layouttemplateid") || draggingType === "section") {
      setSectionInsertTarget({ index, placement });
      setDragOverSection(null);
      setDragOverColumn(null);
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

  const handleCollectionItemDragStart = (e: React.DragEvent, sectionId: string, componentId: string, itemIndex: number) => {
    e.stopPropagation();
    e.dataTransfer.setData("collectionItemIndex", itemIndex.toString());
    e.dataTransfer.setData("sectionId", sectionId);
    e.dataTransfer.setData("componentId", componentId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingCollectionItemIndex({ sectionId, componentId, index: itemIndex });
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = "0.2";
    }, 0);
  };

  const handleCollectionItemDragOver = (e: React.DragEvent, sectionId: string, componentId: string, hoverIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingCollectionItemIndex) return;
    const { sectionId: sId, componentId: cId, index: dIdx } = draggingCollectionItemIndex;
    if (sId === sectionId && cId === componentId && dIdx !== hoverIndex) {
      reorderCollectionItems(sectionId, componentId, dIdx, hoverIndex);
      setDraggingCollectionItemIndex({ sectionId, componentId, index: hoverIndex });
    }
  };

  const handleCollectionItemDragEnd = (e: React.DragEvent) => {
    setDraggingCollectionItemIndex(null);
    if (e.target instanceof HTMLElement) e.target.style.opacity = "";
  };

  const handleCollectionItemDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingCollectionItemIndex(null);
  };

  const handleSaveEdit = () => {
    if (editingComponent) {
      updateComponent(editingComponent.sectionId, editingComponent.component.id, editingComponent.component);
      saveToHistory("Updated component");
      setEditingComponent(null);
    }
  };

  const handleSaveCollection = () => {
    if (editingCollection && editingCollectionData) {
      updateComponent(editingCollection.sectionId, editingCollection.component.id, { collectionData: editingCollectionData });
      saveToHistory("Updated collection");
      setEditingCollection(null);
      setEditingCollectionData(null);
    }
  };

  // Resize Handlers
  const handleResizeStart = (sectionId: string, dividerIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingSection(sectionId);
    setResizingDivider(dividerIndex);
  };

  const handleResizeMove = useCallback((e: React.MouseEvent) => {
    if (resizingSection === null || resizingDivider === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const section = currentProject?.layout.find(s => s.id === resizingSection);
    if (!section) return;
    const newWidths = [...(section.columnWidths || Array(section.columns).fill(`${100 / section.columns}%`))];
    const prevSum = newWidths.slice(0, resizingDivider).reduce((sum, w) => sum + parseFloat(w), 0);
    const currentWidth = percentage - prevSum;
    const nextWidth = parseFloat(newWidths[resizingDivider]) + parseFloat(newWidths[resizingDivider + 1]) - currentWidth;
    if (currentWidth > 5 && nextWidth > 5) {
      newWidths[resizingDivider] = `${currentWidth}%`;
      newWidths[resizingDivider + 1] = `${nextWidth}%`;
      updateSection(resizingSection, { columnWidths: newWidths });
    }
  }, [resizingSection, resizingDivider, currentProject, updateSection]);

  const handleComponentResizeStart = (e: React.MouseEvent, sectionId: string, componentId: string, direction: "width" | "height") => {
    e.preventDefault();
    e.stopPropagation();
    setResizingComponent({ sectionId, componentId, direction });
  };

  const handleComponentResizeMove = useCallback((e: React.MouseEvent) => {
    if (!resizingComponent || !containerRef.current) return;
    pendingResizeRef.current = { x: e.clientX, y: e.clientY };
    if (resizeAnimationFrameRef.current === null) {
      resizeAnimationFrameRef.current = requestAnimationFrame(() => {
        if (!pendingResizeRef.current || !containerRef.current) {
          resizeAnimationFrameRef.current = null;
          return;
        }
        const { x, y } = pendingResizeRef.current;
        const componentElement = containerRef.current.querySelector(`[data-component-id="${resizingComponent.componentId}"]`);
        if (!componentElement) {
          resizeAnimationFrameRef.current = null;
          return;
        }
        const rect = componentElement.getBoundingClientRect();
        if (resizingComponent.direction === "width") {
          const newWidth = Math.max(100, x - rect.left);
          updateComponent(resizingComponent.sectionId, resizingComponent.componentId, { width: `${newWidth}px` }, true);
        } else {
          const newHeight = Math.max(50, y - rect.top);
          updateComponent(resizingComponent.sectionId, resizingComponent.componentId, { height: `${newHeight}px` }, true);
        }
        resizeAnimationFrameRef.current = null;
      });
    }
  }, [resizingComponent, updateComponent]);

  const handleSectionHeightResizeStart = useCallback((e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingSectionHeight(sectionId);
  }, []);

  const handleSectionHeightResizeMove = useCallback((e: React.MouseEvent) => {
    if (!resizingSectionHeight || !containerRef.current) return;
    pendingResizeRef.current = { x: e.clientX, y: e.clientY };
    if (resizeAnimationFrameRef.current === null) {
      resizeAnimationFrameRef.current = requestAnimationFrame(() => {
        if (!pendingResizeRef.current || !containerRef.current) {
          resizeAnimationFrameRef.current = null;
          return;
        }
        const { y } = pendingResizeRef.current;
        const sectionElement = containerRef.current.querySelector(`[data-section-id="${resizingSectionHeight}"]`);
        if (!sectionElement) {
          resizeAnimationFrameRef.current = null;
          return;
        }
        const rect = sectionElement.getBoundingClientRect();
        const newHeight = Math.max(100, y - rect.top);
        updateSection(resizingSectionHeight, { minHeight: `${newHeight}px` });
        resizeAnimationFrameRef.current = null;
      });
    }
  }, [resizingSectionHeight, updateSection]);

  const handleResizeEnd = () => {
    if (resizingSection || resizingComponent || resizingSectionHeight) {
      saveToHistory("Resized element");
    }
    setResizingSection(null);
    setResizingDivider(null);
    setResizingComponent(null);
    setResizingSectionHeight(null);
    if (resizeAnimationFrameRef.current !== null) {
      cancelAnimationFrame(resizeAnimationFrameRef.current);
      resizeAnimationFrameRef.current = null;
    }
  };

  const getGridStyle = (section: LayoutSection): React.CSSProperties => {
    if (viewport === "mobile") {
      return { display: "flex", flexDirection: "column", gap: "1rem" };
    }
    if (section.columnWidths && section.columnWidths.length > 0) {
      return { display: "grid", gridTemplateColumns: section.columnWidths.join(" "), gap: "0", minWidth: 0 };
    }
    const cols = section.columns || 1;
    return { display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "0", minWidth: 0 };
  };

  return (
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
      <ViewportControls
        viewport={viewport}
        setViewport={setViewport}
        showOnboarding={showOnboarding}
        hasLayout={!!currentProject && currentProject.layout.length > 0}
        setShowOnboarding={setShowOnboarding}
      />

      <div className="flex-1 overflow-hidden" data-slot="scroll-area-viewport">
        <ScrollArea className="h-full">
          <div className="p-4">
            <div
              ref={containerRef}
              className={`mx-auto rounded-lg border border-border bg-background shadow-sm transition-all duration-300 ${
                resizingSection || resizingComponent || resizingSectionHeight ? "select-none" : ""
              }`}
              style={{ maxWidth: viewportWidths[viewport], width: "100%" }}
            >
              <div className="p-4">
                {!currentProject || currentProject.layout.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center text-center">
                    <div className="mb-3 rounded-full bg-muted p-3">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">Start Building</p>
                    <p className="mt-1 text-xs text-muted-foreground">Add sections from the Sections tab on the left</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentProject.layout.map((section, index) => (
                      <React.Fragment key={section.id}>
                        {/* Section insertion slot - before current */}
                        <div
                          className={`relative h-2 transition-all ${sectionInsertTarget?.index === index ? "h-8" : "h-2 hover:h-4"}`}
                          onDragOver={(e) => handleSectionSlotDragOver(e, index, "before")}
                          onDrop={(e) => handleSectionSlotDrop(e, index)}
                          onDragLeave={handleDragLeave}
                        >
                          {sectionInsertTarget?.index === index && (
                             <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                               <div className="h-0.5 flex-1 bg-primary rounded-full" />
                               <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs">
                                 <Plus className="h-3 w-3" />
                               </div>
                               <div className="h-0.5 flex-1 bg-primary rounded-full" />
                             </div>
                          )}
                        </div>

                        <SectionRenderer
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

                        {/* Last section trailing slot */}
                        {index === currentProject.layout.length - 1 && (
                          <div
                            className={`relative h-2 transition-all ${sectionInsertTarget?.index === index + 1 ? "h-8" : "h-2 hover:h-4"}`}
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
            handleFileUpload(file, imageUploadTarget.sectionId, imageUploadTarget.componentId);
          }
        }}
      />

      <CollectionEditDialog
        isOpen={!!editingCollection}
        onClose={() => {
          setEditingCollection(null);
          setEditingCollectionData(null);
          setCollectionSearchQuery("");
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
  );
}
