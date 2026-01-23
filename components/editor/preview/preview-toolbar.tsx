import React from "react";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react";

export type ViewportSize = "desktop" | "tablet" | "mobile";

interface PreviewToolbarProps {
  title: string;
  baseUrl?: string;
  viewport: ViewportSize;
  setViewport: (size: ViewportSize) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  handleRefresh: () => void;
}

export function PreviewToolbar({
  title,
  baseUrl,
  viewport,
  setViewport,
  isFullscreen,
  toggleFullscreen,
  handleRefresh,
}: PreviewToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{title}</span>
        {baseUrl && (
          <a
            href={baseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5 rounded-md bg-muted p-0.5">
          <Button
            variant={viewport === "desktop" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setViewport("desktop")}
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewport === "tablet" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setViewport("tablet")}
          >
            <Tablet className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewport === "mobile" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setViewport("mobile")}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="mx-1 h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
