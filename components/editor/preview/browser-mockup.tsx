import React from "react";

interface BrowserMockupProps {
  children: React.ReactNode;
  url?: string;
  viewportWidth: number | string;
  isFullscreen: boolean;
}

export function BrowserMockup({
  children,
  url,
  viewportWidth,
  isFullscreen,
}: BrowserMockupProps) {
  return (
    <div
      className="mx-auto overflow-hidden rounded-lg border border-border bg-white shadow-lg transition-all duration-300"
      style={{
        width: typeof viewportWidth === "number" ? `${viewportWidth}px` : viewportWidth,
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
          {url || "preview://localhost"}
        </div>
      </div>

      {children}
    </div>
  );
}
