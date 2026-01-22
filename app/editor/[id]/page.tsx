"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectStore } from "@/lib/store";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { ToolsPanel } from "@/components/editor/tools-panel";
import { PreviewPanel } from "@/components/editor/preview-panel";
import { HistoryPanel } from "@/components/editor/history-panel";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { projects, currentProject, setCurrentProject } = useProjectStore();
  const [activePanel, setActivePanel] = useState<"tools" | "history">("tools");
  const [isPanelsSwapped, setIsPanelsSwapped] = useState(false);
  const [panelWidth, setPanelWidth] = useState(320);
  const [isResizingPanel, setIsResizingPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isResizingPanel) return;

    const min = 260;
    const max = 520;

    const onMouseMove = (e: MouseEvent) => {
      const next = isPanelsSwapped ? window.innerWidth - e.clientX : e.clientX;
      setPanelWidth(Math.max(min, Math.min(max, next)));
    };

    const onMouseUp = () => {
      setIsResizingPanel(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizingPanel, isPanelsSwapped]);

  useEffect(() => {
    const projectId = params.id as string;
    const project = projects.find((p) => p.id === projectId);

    if (project) {
      setCurrentProject(projectId);
      setIsLoading(false);
    } else {
      router.push("/");
    }
  }, [params.id, projects, setCurrentProject, router]);

  if (isLoading || !currentProject) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <EditorToolbar
        project={currentProject}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        isPanelsSwapped={isPanelsSwapped}
        onTogglePanelsSwapped={() => setIsPanelsSwapped((v) => !v)}
      />

      <div className="flex flex-1 overflow-hidden">
        {!isPanelsSwapped && (
          <>
            <div
              className="shrink-0 border-r border-border bg-card"
              style={{ width: panelWidth }}
            >
              {activePanel === "tools" ? <ToolsPanel /> : <HistoryPanel />}
            </div>
            <div
              className="w-1 cursor-col-resize bg-transparent hover:bg-border"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizingPanel(true);
              }}
            />
          </>
        )}

        <div className="flex-1 overflow-hidden">
          <PreviewPanel />
        </div>

        {isPanelsSwapped && (
          <>
            <div
              className="w-1 cursor-col-resize bg-transparent hover:bg-border"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizingPanel(true);
              }}
            />
            <div
              className="shrink-0 border-l border-border bg-card"
              style={{ width: panelWidth }}
            >
              {activePanel === "tools" ? <ToolsPanel /> : <HistoryPanel />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
