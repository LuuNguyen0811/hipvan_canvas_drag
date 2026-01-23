import React from "react";
import {
  Plus,
  GripHorizontal,
  MoveVertical,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LayoutSection, Component } from "@/lib/types";
import { ViewportSize } from "./viewport-controls";

interface SectionRendererProps {
  section: LayoutSection;
  index: number;
  viewport: ViewportSize;
  dragOverSection: string | null;
  dragOverColumn: number | null;
  isResizing: boolean;
  resizingDivider: number | null;
  isResizingHeight: boolean;
  isDraggingFile?: boolean;
  handleDrop: (
    e: React.DragEvent,
    sectionId: string,
    columnIndex?: number,
  ) => void;
  handleDragOver: (
    e: React.DragEvent,
    sectionId: string,
    columnIndex?: number,
  ) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleResizeStart: (
    sectionId: string,
    dividerIndex: number,
    e: React.MouseEvent,
  ) => void;
  handleSectionHeightResizeStart: (
    e: React.MouseEvent,
    sectionId: string,
  ) => void;
  removeSection: (sectionId: string) => void;
  renderComponent: (component: Component, sectionId: string) => React.ReactNode;
  getGridStyle: (section: LayoutSection) => React.CSSProperties;
}

export function SectionRenderer({
  section,
  viewport,
  dragOverSection,
  dragOverColumn,
  isResizing,
  resizingDivider,
  isResizingHeight,
  isDraggingFile = false,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  handleResizeStart,
  handleSectionHeightResizeStart,
  removeSection,
  renderComponent,
  getGridStyle,
}: SectionRendererProps) {
  const isDragOver = dragOverSection === section.id;
  const showFileDragFeedback = isDragOver && isDraggingFile;
  const isHeroSection = section.layoutType === "hero";

  // Group components by column
  const componentsByColumn: Record<number, Component[]> = {};
  for (let i = 0; i < section.columns; i++) {
    componentsByColumn[i] = [];
  }
  section.components.forEach((comp) => {
    const colIndex = (comp.props?.columnIndex as number) || 0;
    if (componentsByColumn[colIndex]) {
      componentsByColumn[colIndex].push(comp);
    } else {
      componentsByColumn[0].push(comp);
    }
  });

  return (
    <section
      key={section.id}
      data-section-id={section.id}
      className={`group/section relative rounded-md border-2 transition-all ${
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-transparent hover:border-border"
      } ${isHeroSection ? "min-h-[400px]" : ""}`}
      style={{
        backgroundColor: section.backgroundColor || "transparent",
        padding: section.padding || "0",
        minHeight: section.minHeight || (isHeroSection ? "400px" : "auto"),
      }}
    >
      {/* Section Controls */}
      <div className="absolute -left-10 top-0 flex flex-col gap-1 opacity-0 transition-opacity group-hover/section:opacity-100">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={() => removeSection(section.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <div className="flex h-8 w-8 cursor-grab items-center justify-center rounded-md bg-secondary text-muted-foreground active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Section Content with Resizable Columns */}
      <div
        className={viewport === "mobile" ? "relative p-0" : "relative p-2"}
        style={getGridStyle(section)}
      >
        {section.columns === 1 ? (
          // Single column
          <div
            onDrop={(e) => handleDrop(e, section.id)}
            onDragOver={(e) => handleDragOver(e, section.id)}
            onDragLeave={handleDragLeave}
            className={`min-h-20 rounded-md border border-dashed ${viewport === "mobile" ? "p-0" : "p-2"} transition-all ${
              isDragOver
                ? showFileDragFeedback
                  ? "border-primary border-2 bg-primary/10 ring-2 ring-primary/20"
                  : "border-primary bg-primary/5"
                : "border-transparent hover:border-border"
            }`}
            style={{ minWidth: 0, overflow: "hidden" }}
          >
            {section.components.length === 0 ? (
              <div className="flex h-16 flex-col items-center justify-center text-xs text-muted-foreground">
                {showFileDragFeedback ? (
                  <>
                    <Plus className="mb-1 h-5 w-5 text-primary" />
                    <span className="font-medium text-primary">
                      Drop image here
                    </span>
                  </>
                ) : (
                  <>
                    <Plus className="mb-1 h-5 w-5" />
                    <span>Drop elements here</span>
                    <span className="mt-0.5 text-[10px] opacity-70">
                      or click elements in the panel
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {section.components.map((comp) =>
                  renderComponent(comp, section.id),
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
                  onDrop={(e) => handleDrop(e, section.id, colIndex)}
                  onDragOver={(e) => handleDragOver(e, section.id, colIndex)}
                  onDragLeave={handleDragLeave}
                  className={`min-h-20 rounded-md border border-dashed ${viewport === "mobile" ? "p-0" : "p-2"} transition-all ${
                    isDragOver && dragOverColumn === colIndex
                      ? showFileDragFeedback
                        ? "border-primary border-2 bg-primary/10 ring-2 ring-primary/20"
                        : "border-primary bg-primary/5"
                      : "border-border/40 hover:border-border"
                  }`}
                  style={{ minWidth: 0, overflow: "hidden" }}
                >
                  {componentsByColumn[colIndex]?.length === 0 ? (
                    <div className="flex h-16 flex-col items-center justify-center text-xs text-muted-foreground">
                      {showFileDragFeedback && dragOverColumn === colIndex ? (
                        <>
                          <Plus className="mb-1 h-5 w-5 text-primary" />
                          <span className="font-medium text-primary">
                            Drop image here
                          </span>
                        </>
                      ) : (
                        <>
                          <Plus className="mb-1 h-4 w-4" />
                          <span>Col {colIndex + 1}</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {componentsByColumn[colIndex]?.map((comp) =>
                        renderComponent(comp, section.id),
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
                                      (isNaN(val) ? 100 / section.columns : val)
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
          </>
        )}
      </div>

      {/* Section Height Resize Handle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="absolute bottom-0 left-1/2 z-10 flex h-4 w-20 -translate-x-1/2 cursor-ns-resize items-center justify-center rounded-t-md bg-primary/10 opacity-0 transition-all hover:h-5 hover:bg-primary/20 group-hover/section:opacity-100"
              onMouseDown={(e) => handleSectionHeightResizeStart(e, section.id)}
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
}
