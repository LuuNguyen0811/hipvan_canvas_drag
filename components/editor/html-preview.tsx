"use client";

import React, { useRef, useState } from "react";
import { PreviewToolbar, type ViewportSize } from "./preview/preview-toolbar";
import { BrowserMockup } from "./preview/browser-mockup";
import { useHtmlBridge } from "./hooks/use-html-bridge";

export interface HTMLPreviewProps {
  html: string;
  title?: string;
  baseUrl?: string;
  onElementSelect?: (element: any) => void;
}

const viewportWidths: Record<ViewportSize, number> = {
  desktop: 1200,
  tablet: 768,
  mobile: 375,
};

export function HTMLPreview({
  html,
  title = "Preview",
  baseUrl,
  onElementSelect,
}: HTMLPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { iframeLoaded, handleRefresh } = useHtmlBridge(html, iframeRef, onElementSelect);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <div
      className={`flex flex-col bg-muted/20 ${
        isFullscreen
          ? "fixed inset-0 z-50"
          : "h-full rounded-lg border border-border"
      }`}
    >
      <PreviewToolbar
        title={title}
        baseUrl={baseUrl}
        viewport={viewport}
        setViewport={setViewport}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        handleRefresh={handleRefresh}
      />

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-muted/30 p-4">
        <BrowserMockup
          url={baseUrl}
          viewportWidth={viewport === "desktop" ? "100%" : viewportWidths[viewport]}
          isFullscreen={isFullscreen}
        >
          {/* Iframe */}
          <iframe
            ref={iframeRef}
            className="w-full border-0"
            style={{
              height: isFullscreen ? "calc(100vh - 140px)" : "500px",
              minHeight: "400px",
            }}
            sandbox="allow-scripts allow-same-origin"
            title={title}
          />
        </BrowserMockup>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-border bg-card px-3 py-1.5">
        <span className="text-xs text-muted-foreground">
          {viewport.charAt(0).toUpperCase() + viewport.slice(1)} -{" "}
          {viewportWidths[viewport]}px
        </span>
        <span className="text-xs text-muted-foreground">
          {iframeLoaded ? "Ready" : "Loading..."}
        </span>
      </div>
    </div>
  );
}

export default HTMLPreview;
