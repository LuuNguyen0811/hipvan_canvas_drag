"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react";

export interface HTMLPreviewProps {
  html: string;
  title?: string;
  baseUrl?: string;
  onElementSelect?: (element: HTMLElement) => void;
}

type ViewportSize = "desktop" | "tablet" | "mobile";

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
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Update iframe content when HTML changes
  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (doc) {
      // Add editing script to the HTML
      const editingScript = `
        <script>
          // Add hover effect for elements
          document.addEventListener('mouseover', function(e) {
            const target = e.target;
            if (target !== document.body && target !== document.documentElement) {
              target.style.outline = '2px solid rgba(59, 130, 246, 0.5)';
              target.style.outlineOffset = '2px';
            }
          });
          
          document.addEventListener('mouseout', function(e) {
            const target = e.target;
            target.style.outline = '';
            target.style.outlineOffset = '';
          });
          
          // Handle click to select elements
          document.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const target = e.target;
            window.parent.postMessage({
              type: 'elementSelected',
              tagName: target.tagName,
              className: target.className,
              id: target.id,
              textContent: target.textContent?.substring(0, 100)
            }, '*');
          });

          // Make text editable on double click
          document.addEventListener('dblclick', function(e) {
            const target = e.target;
            if (target.contentEditable !== 'true') {
              target.contentEditable = 'true';
              target.focus();
              target.style.outline = '2px solid #3b82f6';
              
              // Save on blur
              target.addEventListener('blur', function() {
                target.contentEditable = 'false';
                target.style.outline = '';
                window.parent.postMessage({
                  type: 'elementEdited',
                  tagName: target.tagName,
                  textContent: target.textContent
                }, '*');
              }, { once: true });
            }
          });
        <\/script>
      `;

      // Inject the editing script before closing body tag
      const htmlWithScript = html.replace(
        "</body>",
        `${editingScript}</body>`
      );

      doc.open();
      doc.write(htmlWithScript);
      doc.close();
      setIframeLoaded(true);
    }
  }, [html]);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "elementSelected") {
        console.log("Element selected:", event.data);
      } else if (event.data.type === "elementEdited") {
        console.log("Element edited:", event.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onElementSelect]);

  const handleRefresh = useCallback(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`flex flex-col bg-muted/20 ${
        isFullscreen
          ? "fixed inset-0 z-50"
          : "h-full rounded-lg border border-border"
      }`}
    >
      {/* Toolbar */}
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
          {/* Viewport buttons */}
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

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-muted/30 p-4">
        <div
          className="mx-auto overflow-hidden rounded-lg border border-border bg-white shadow-lg transition-all duration-300"
          style={{
            width:
              viewport === "desktop" ? "100%" : `${viewportWidths[viewport]}px`,
            maxWidth: "100%",
          }}
        >
          {/* Browser chrome mockup */}
          <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100 px-3 py-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 rounded-md bg-white px-3 py-1 text-xs text-gray-500">
              {baseUrl || "preview://localhost"}
            </div>
          </div>

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
        </div>
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
