"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/lib/store";
import type { Project } from "@/lib/types";
import { getAllImageIds, clearAllImages } from "@/lib/image-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Wrench,
  History,
  Check,
  Pencil,
  Layers,
  MoreVertical,
  Trash2,
  Database,
  ArrowLeftRight,
} from "lucide-react";

interface EditorToolbarProps {
  project: Project;
  activePanel: "tools" | "history";
  onPanelChange: (panel: "tools" | "history") => void;
  isPanelsSwapped: boolean;
  onTogglePanelsSwapped: () => void;
}

export function EditorToolbar({
  project,
  activePanel,
  onPanelChange,
  isPanelsSwapped,
  onTogglePanelsSwapped,
}: EditorToolbarProps) {
  const router = useRouter();
  const { updateProjectName, saveProject, clearHistory } = useProjectStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project.name);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showClearImagesDialog, setShowClearImagesDialog] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{
    projectSize: number;
    imageCount: number;
  } | null>(null);

  const handleSaveName = () => {
    if (editedName.trim()) {
      updateProjectName(project.id, editedName.trim());
    } else {
      setEditedName(project.name);
    }
    setIsEditing(false);
  };

  const handleDone = () => {
    saveProject();
    router.push(`/preview/${project.id}`);
  };

  const handleClearHistory = () => {
    clearHistory();
    setShowClearDialog(false);
  };

  const handleClearImages = async () => {
    await clearAllImages();
    setShowClearImagesDialog(false);
    window.location.reload(); // Reload to refresh image states
  };

  const loadStorageInfo = async () => {
    const projectSize = new Blob([JSON.stringify(project)]).size;
    const imageIds = await getAllImageIds();
    setStorageInfo({
      projectSize,
      imageCount: imageIds.length,
    });
  };

  return (
    <TooltipProvider>
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to Dashboard</TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Layers className="h-4 w-4 text-primary-foreground" />
            </div>

            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  className="h-8 w-48"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-foreground hover:bg-muted"
              >
                {project.name}
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Center Section - Panel Toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <Button
            variant={activePanel === "tools" ? "secondary" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => onPanelChange("tools")}
          >
            <Wrench className="h-4 w-4" />
            Tools
          </Button>
          <Button
            variant={activePanel === "history" ? "secondary" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => onPanelChange("history")}
          >
            <History className="h-4 w-4" />
            History
          </Button>
          <Button
            variant={isPanelsSwapped ? "secondary" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={onTogglePanelsSwapped}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Swap
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowClearDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowClearImagesDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Images
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await loadStorageInfo();
                  if (storageInfo) {
                    alert(
                      `Project Data: ${(storageInfo.projectSize / 1024).toFixed(1)} KB\n` +
                        `History Entries: ${project.history?.length || 0}\n` +
                        `Images Stored: ${storageInfo.imageCount}\n\n` +
                        `💡 Images are stored separately in IndexedDB with automatic compression.`,
                    );
                  }
                }}
              >
                <Database className="mr-2 h-4 w-4" />
                Storage Info
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleDone} className="gap-2">
            <Check className="h-4 w-4" />
            Done
          </Button>
        </div>
      </header>

      {/* Clear History Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all undo/redo history for this project to free up
              storage space. Your current work will not be affected. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory}>
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Images Dialog */}
      <AlertDialog
        open={showClearImagesDialog}
        onOpenChange={setShowClearImagesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Images?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all uploaded images from storage. This is useful
              if you're running out of space.
              <strong className="mt-2 block text-destructive">
                Warning: This will remove images from ALL your projects and
                cannot be undone!
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearImages}
              className="bg-destructive hover:bg-destructive/90"
            >
              Clear All Images
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
