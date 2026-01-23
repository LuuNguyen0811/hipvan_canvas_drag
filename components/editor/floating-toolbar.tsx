"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  Pencil,
  GripVertical,
  Link,
  Type,
} from "lucide-react";
import type { Component } from "@/lib/types";

interface FloatingToolbarProps {
  component: Component;
  position: { x: number; y: number };
  onFormatChange: (format: Partial<Component["formatting"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  visible: boolean;
}

export function FloatingToolbar({
  component,
  position,
  onFormatChange,
  onDelete,
  onDuplicate,
  onEdit,
  visible,
}: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to keep toolbar in viewport
  useEffect(() => {
    if (!toolbarRef.current || !visible) return;

    const toolbar = toolbarRef.current;
    const rect = toolbar.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newX = position.x;
    let newY = position.y;

    // Adjust horizontal position
    if (position.x + rect.width > viewportWidth - 20) {
      newX = viewportWidth - rect.width - 20;
    }
    if (newX < 20) {
      newX = 20;
    }

    // Adjust vertical position (show above if too close to bottom)
    if (position.y + rect.height > viewportHeight - 20) {
      newY = position.y - rect.height - 40;
    }
    if (newY < 20) {
      newY = 20;
    }

    setAdjustedPosition({ x: newX, y: newY });
  }, [position, visible]);

  if (!visible) return null;

  const isTextComponent = ["heading", "paragraph", "button", "card", "link"].includes(
    component.type
  );

  const formatting = component.formatting || {};

  return (
    <TooltipProvider>
      <div
        ref={toolbarRef}
        className="fixed z-50 flex items-center gap-0.5 rounded-lg border border-border bg-background p-1 shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
      >
        {/* Text formatting tools - only show for text components */}
        {isTextComponent && (
          <>
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={formatting.bold ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onFormatChange({ bold: !formatting.bold })}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bold</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={formatting.italic ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onFormatChange({ italic: !formatting.italic })}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Italic</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={formatting.underline ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      onFormatChange({ underline: !formatting.underline })
                    }
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Underline</TooltipContent>
              </Tooltip>
            </div>

            <div className="mx-1 h-6 w-px bg-border" />

            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={formatting.align === "left" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onFormatChange({ align: "left" })}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Left</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={formatting.align === "center" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onFormatChange({ align: "center" })}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Center</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={formatting.align === "right" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onFormatChange({ align: "right" })}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Right</TooltipContent>
              </Tooltip>
            </div>

            <div className="mx-1 h-6 w-px bg-border" />
          </>
        )}

        {/* Common actions */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit Properties</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onDuplicate}
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
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>

        {/* Drag handle indicator */}
        <div className="ml-1 flex h-8 w-6 items-center justify-center text-muted-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>
    </TooltipProvider>
  );
}

// Hook to manage floating toolbar state
export function useFloatingToolbar() {
  const [selectedComponent, setSelectedComponent] = useState<{
    sectionId: string;
    component: Component;
    position: { x: number; y: number };
  } | null>(null);

  const showToolbar = (
    sectionId: string,
    component: Component,
    element: HTMLElement
  ) => {
    const rect = element.getBoundingClientRect();
    setSelectedComponent({
      sectionId,
      component,
      position: {
        x: rect.left + rect.width / 2 - 150, // Center the toolbar
        y: rect.top - 50, // Position above the element
      },
    });
  };

  const hideToolbar = () => {
    setSelectedComponent(null);
  };

  const updatePosition = (element: HTMLElement) => {
    if (!selectedComponent) return;
    const rect = element.getBoundingClientRect();
    setSelectedComponent({
      ...selectedComponent,
      position: {
        x: rect.left + rect.width / 2 - 150,
        y: rect.top - 50,
      },
    });
  };

  return {
    selectedComponent,
    showToolbar,
    hideToolbar,
    updatePosition,
  };
}

export default FloatingToolbar;
