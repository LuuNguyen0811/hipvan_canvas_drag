import { useState } from "react";
import type { Component, Project, SectionTemplate } from "@/lib/types";
import { SECTION_TEMPLATES } from "@/lib/types";
import { generateId, findComponentInTree } from "@/lib/editor-utils";

export function usePreviewDragAndDrop(
  currentProject: Project | null,
  addComponent: (sectionId: string, component: Component, index?: number) => void,
  addComponentToLayout: (sectionId: string, layoutId: string, component: Component, index?: number) => void,
  moveComponent: (fromSectionId: string, toSectionId: string, componentId: string, targetIndex: number, options?: any) => void,
  addSection: (layoutType: string, template: SectionTemplate, index: number) => void,
  showOnboarding: boolean,
  setShowOnboarding: (show: boolean) => void
) {
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  const [dragOverLayout, setDragOverLayout] = useState<string | null>(null);
  const [dragOverLayoutColumn, setDragOverLayoutColumn] = useState<number | null>(null);
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
        layoutType: template.id as any,
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
      const defaultCollectionData = {
        layout: "horizontal" as const,
        sourceType: "api" as const,
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

  return {
    dragOverSection,
    dragOverColumn,
    dragOverLayout,
    dragOverLayoutColumn,
    sectionInsertTarget,
    insertTarget,
    draggingType,
    setDraggingType,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleComponentDragStart,
    handleSectionSlotDragOver,
    handleSectionSlotDrop,
  };
}
