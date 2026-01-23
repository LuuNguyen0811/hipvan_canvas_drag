import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CrawledElement {
  id: string;
  tag: string;
  type: "container" | "content" | "layout";
  label: string;
  children: CrawledElement[];
  dimensions?: {
    estimated_width: "full" | "partial" | "narrow";
    estimated_height: "small" | "medium" | "large";
  };
}

interface CrawledLayout {
  url: string;
  title: string;
  structure: CrawledElement[];
}

interface WireframeDisplayProps {
  layout: CrawledLayout;
}

const WireframeElement: React.FC<{
  element: CrawledElement;
  depth: number;
}> = ({ element, depth }) => {
  const hasChildren = element.children && element.children.length > 0;

  // Determine colors based on element type
  const getColorClasses = (type: string) => {
    switch (type) {
      case "layout":
        return "border-blue-400 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-600";
      case "container":
        return "border-purple-400 bg-purple-50/50 dark:bg-purple-950/30 dark:border-purple-600";
      case "content":
        return "border-gray-400 bg-gray-50/50 dark:bg-gray-900/30 dark:border-gray-600";
      default:
        return "border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700";
    }
  };

  // Determine width classes
  const getWidthClass = (width?: "full" | "partial" | "narrow") => {
    switch (width) {
      case "full":
        return "w-full";
      case "narrow":
        return "w-1/3";
      case "partial":
        return "w-2/3";
      default:
        return "w-full";
    }
  };

  // Determine height classes
  const getHeightClass = (height?: "small" | "medium" | "large") => {
    if (!hasChildren) {
      switch (height) {
        case "small":
          return "min-h-[30px]";
        case "large":
          return "min-h-[100px]";
        case "medium":
        default:
          return "min-h-[50px]";
      }
    }
    return ""; // Let content determine height if has children
  };

  const colorClasses = getColorClasses(element.type);
  const widthClass = getWidthClass(element.dimensions?.estimated_width);
  const heightClass = getHeightClass(element.dimensions?.estimated_height);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`relative rounded border-2 ${colorClasses} ${widthClass} ${heightClass} ${
              hasChildren ? "p-2" : "p-1"
            } transition-all hover:shadow-md ${depth > 0 ? "my-1" : "my-2"}`}
          >
            {/* Label */}
            <div className="absolute left-1 top-1 z-10 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 shadow-sm dark:bg-gray-800/90 dark:text-gray-300">
              {element.label}
            </div>

            {/* Children */}
            {hasChildren && (
              <div className="mt-6 space-y-1">
                {element.children.map((child) => (
                  <WireframeElement
                    key={child.id}
                    element={child}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}

            {/* Empty state for content elements */}
            {!hasChildren && (
              <div className="flex h-full items-center justify-center opacity-30">
                <div className="text-[8px] text-gray-500 dark:text-gray-400">
                  {element.tag}
                </div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1 text-xs">
            <p>
              <strong>Tag:</strong> &lt;{element.tag}&gt;
            </p>
            <p>
              <strong>Type:</strong> {element.type}
            </p>
            {element.children.length > 0 && (
              <p>
                <strong>Children:</strong> {element.children.length}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const WireframeDisplay: React.FC<WireframeDisplayProps> = ({
  layout,
}) => {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-muted/50 p-3">
        <h3 className="text-sm font-semibold text-foreground">
          Layout Preview
        </h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {layout.title}
        </p>
      </div>

      {/* Legend */}
      <div className="border-b border-border bg-background p-3">
        <p className="mb-2 text-xs font-medium text-foreground">Color Guide:</p>
        <div className="flex flex-wrap gap-2 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border-2 border-blue-400 bg-blue-50/50" />
            <span className="text-muted-foreground">Layout</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border-2 border-purple-400 bg-purple-50/50" />
            <span className="text-muted-foreground">Container</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border-2 border-gray-400 bg-gray-50/50" />
            <span className="text-muted-foreground">Content</span>
          </div>
        </div>
      </div>

      {/* Wireframe Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {layout.structure.map((element) => (
            <WireframeElement key={element.id} element={element} depth={0} />
          ))}
        </div>
      </ScrollArea>

      {/* Helper Text */}
      <div className="border-t border-border bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground">
          💡 Use this as a reference to build your own layout using the{" "}
          <strong>Sections</strong> and <strong>Elements</strong> tabs.
        </p>
      </div>
    </div>
  );
};
