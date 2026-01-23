import { useState, useCallback, useRef } from "react";
import type { Project, LayoutSection, Component } from "@/lib/types";

export function usePreviewResizing(
  currentProject: Project | null,
  updateSection: (sectionId: string, updates: Partial<LayoutSection>) => void,
  updateComponent: (sectionId: string, componentId: string, updates: Partial<Component>, isResizing?: boolean) => void,
  saveToHistory: (action: string) => void,
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const [resizingSection, setResizingSection] = useState<string | null>(null);
  const [resizingDivider, setResizingDivider] = useState<number | null>(null);
  const [resizingComponent, setResizingComponent] = useState<{
    sectionId: string;
    componentId: string;
    direction: "width" | "height";
  } | null>(null);
  const [resizingSectionHeight, setResizingSectionHeight] = useState<string | null>(null);

  const resizeAnimationFrameRef = useRef<number | null>(null);
  const pendingResizeRef = useRef<{ x: number; y: number } | null>(null);

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
  }, [resizingSection, resizingDivider, currentProject, updateSection, containerRef]);

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
  }, [resizingComponent, updateComponent, containerRef]);

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
  }, [resizingSectionHeight, updateSection, containerRef]);

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

  return {
    resizingSection,
    resizingDivider,
    resizingComponent,
    resizingSectionHeight,
    handleResizeStart,
    handleResizeMove,
    handleComponentResizeStart,
    handleComponentResizeMove,
    handleSectionHeightResizeStart,
    handleSectionHeightResizeMove,
    handleResizeEnd,
  };
}
