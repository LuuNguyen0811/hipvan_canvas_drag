"use client";

import React, { useState, useRef, useEffect } from "react";
import { useProjectStore } from "@/lib/store";
import type { Component, LayoutSection } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";

// Internal Sub-components
import { ViewportControls, type ViewportSize } from "./preview/viewport-controls";
import { SectionRenderer } from "./preview/section-renderer";
import { ComponentRenderer } from "./preview/component-renderer";
import { EditComponentDialog } from "./preview/dialogs/edit-component-dialog";
import { ImageUploadDialog } from "./preview/dialogs/image-upload-dialog";
import { CollectionEditDialog } from "./preview/dialogs/collection-edit-dialog";
import { ProductListEditDialog } from "./preview/dialogs/product-list-edit-dialog";

// Hooks
import { usePreviewImages } from "./hooks/use-preview-images";
import { usePreviewResizing } from "./hooks/use-preview-resizing";
import { usePreviewCollection } from "./hooks/use-preview-collection";
import { usePreviewProductList } from "./hooks/use-preview-product-list";
import { usePreviewDragAndDrop } from "./hooks/use-preview-drag-and-drop";

// Utils
import { findComponentInTree } from "@/lib/editor-utils";
import { getAllCollections } from "@/lib/mock-collections";

const viewportWidths: Record<ViewportSize, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export function PreviewPanel() {
  const {
    currentProject,
    editorTarget,
    clearEditorTarget,
    addComponent,
    addComponentToLayout,
    removeComponent,
    updateComponent,
    moveComponent,
    reorderCollectionItems,
    removeSection,
    addSection,
    updateSection,
    saveToHistory,
  } = useProjectStore();

  const [editingComponent, setEditingComponent] = useState<{
    sectionId: string;
    component: Component;
  } | null>(null);
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [showOnboarding, setShowOnboarding] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize hooks
  const {
    imageUrls,
    uploadingImage,
    imageUploadTarget,
    isDraggingFile,
    setImageUploadTarget,
    handleFileUpload,
    handleImageDrop,
    handleImageDragOver,
    handleImageDragLeave,
  } = usePreviewImages(currentProject, updateComponent);

  const {
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
  } = usePreviewResizing(
    currentProject,
    updateSection,
    updateComponent,
    saveToHistory,
    containerRef
  );

  const {
    editingCollection,
    collectionSearchQuery,
    collectionSearchResults,
    editingCollectionData,
    draggingCollectionItemIndex,
    setEditingCollection,
    setCollectionSearchQuery,
    setCollectionSearchResults,
    setEditingCollectionData,
    handleSaveCollection,
    handleCollectionItemDragStart,
    handleCollectionItemDragOver,
    handleCollectionItemDragEnd,
    handleCollectionItemDrop,
  } = usePreviewCollection(updateComponent, reorderCollectionItems, saveToHistory);

  const {
    editingProductList,
    editingProductListData,
    productSearchQuery,
    productSearchResults,
    setEditingProductList,
    setEditingProductListData,
    setProductSearchQuery,
    setProductSearchResults,
    handleSaveProductList,
  } = usePreviewProductList(updateComponent, saveToHistory);

  const {
    dragOverSection,
    dragOverColumn,
    dragOverLayout,
    dragOverLayoutColumn,
    sectionInsertTarget,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleComponentDragStart,
    handleSectionSlotDragOver,
    handleSectionSlotDrop,
  } = usePreviewDragAndDrop(
    currentProject,
    addComponent,
    addComponentToLayout,
    moveComponent,
    addSection,
    showOnboarding,
    setShowOnboarding
  );

  // Effect to handle editor target from sidebar
  useEffect(() => {
    if (!editorTarget || !currentProject) return;
    const section = currentProject.layout.find((s) => s.id === editorTarget.sectionId);
    if (!section) {
      clearEditorTarget();
      return;
    }
    const comp = findComponentInTree(section.components, editorTarget.componentId);
    if (!comp) {
      clearEditorTarget();
      return;
    }
    setEditingComponent({ sectionId: editorTarget.sectionId, component: comp });
    clearEditorTarget();
  }, [editorTarget, currentProject, clearEditorTarget]);

  const handleSaveEdit = () => {
    if (editingComponent) {
      updateComponent(editingComponent.sectionId, editingComponent.component.id, editingComponent.component);
      saveToHistory("Updated component");
      setEditingComponent(null);
    }
  };

  const getGridStyle = (section: LayoutSection): React.CSSProperties => {
    if (viewport === "mobile") {
      return { display: "flex", flexDirection: "column", gap: "1rem" };
    }
    if (section.columnWidths && section.columnWidths.length > 0) {
      return { display: "grid", gridTemplateColumns: section.columnWidths.join(" "), gap: "0", minWidth: 0 };
    }
    const cols = section.columns || 1;
    return { display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "0", minWidth: 0 };
  };

  return (
    <div
      className="flex h-full flex-col bg-muted/20"
      onMouseMove={(e) => {
        if (resizingSection) handleResizeMove(e);
        if (resizingComponent) handleComponentResizeMove(e);
        if (resizingSectionHeight) handleSectionHeightResizeMove(e);
      }}
      onMouseUp={handleResizeEnd}
      onMouseLeave={handleResizeEnd}
    >
      <ViewportControls
        viewport={viewport}
        setViewport={setViewport}
        showOnboarding={showOnboarding}
        hasLayout={!!currentProject && currentProject.layout.length > 0}
        setShowOnboarding={setShowOnboarding}
      />

      <div className="flex-1 overflow-hidden" data-slot="scroll-area-viewport">
        <ScrollArea className="h-full">
          <div className="p-4">
            <div
              ref={containerRef}
              className={`preview-container mx-auto rounded-lg border border-border bg-background shadow-sm transition-all duration-300 ${
                resizingSection || resizingComponent || resizingSectionHeight ? "select-none" : ""
              }`}
              style={{ maxWidth: viewportWidths[viewport], width: "100%" }}
            >
              <div className="p-4">
                {!currentProject || currentProject.layout.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center text-center">
                    <div className="mb-3 rounded-full bg-muted p-3">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">Start Building</p>
                    <p className="mt-1 text-xs text-muted-foreground">Add sections from the Sections tab on the left</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentProject.layout.map((section, index) => (
                      <React.Fragment key={section.id}>
                        <div
                          className={`relative h-2 transition-all ${sectionInsertTarget?.index === index ? "h-8" : "h-2 hover:h-4"}`}
                          onDragOver={(e) => handleSectionSlotDragOver(e, index, "before")}
                          onDrop={(e) => handleSectionSlotDrop(e, index)}
                          onDragLeave={handleDragLeave}
                        >
                          {sectionInsertTarget?.index === index && (
                             <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                               <div className="h-0.5 flex-1 bg-primary rounded-full" />
                               <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs">
                                 <Plus className="h-3 w-3" />
                               </div>
                               <div className="h-0.5 flex-1 bg-primary rounded-full" />
                             </div>
                          )}
                        </div>

                        <SectionRenderer
                          section={section}
                          index={index}
                          viewport={viewport}
                          dragOverSection={dragOverSection}
                          dragOverColumn={dragOverColumn}
                          isResizing={resizingSection === section.id}
                          resizingDivider={resizingDivider}
                          isResizingHeight={resizingSectionHeight === section.id}
                          handleDrop={handleDrop}
                          handleDragOver={handleDragOver}
                          handleDragLeave={handleDragLeave}
                          handleResizeStart={handleResizeStart}
                          handleSectionHeightResizeStart={handleSectionHeightResizeStart}
                          removeSection={removeSection}
                          getGridStyle={getGridStyle}
                          renderComponent={(comp, sId) => (
                            <ComponentRenderer
                              key={comp.id}
                              component={comp}
                              sectionId={sId}
                              imageUrls={imageUrls}
                              uploadingImage={uploadingImage}
                              imageUploadTarget={imageUploadTarget}
                              draggingCollectionItemIndex={draggingCollectionItemIndex}
                              resizingComponent={resizingComponent}
                              isDraggingFile={isDraggingFile}
                              handleComponentDragStart={handleComponentDragStart}
                              handleCollectionItemDragStart={handleCollectionItemDragStart}
                              handleCollectionItemDragOver={handleCollectionItemDragOver}
                              handleCollectionItemDragEnd={handleCollectionItemDragEnd}
                              handleCollectionItemDrop={handleCollectionItemDrop}
                              handleImageDrop={handleImageDrop}
                              handleImageDragOver={handleImageDragOver}
                              handleImageDragLeave={handleImageDragLeave}
                              handleComponentResizeStart={handleComponentResizeStart}
                              setEditingComponent={setEditingComponent}
                              setEditingCollection={setEditingCollection}
                              setEditingCollectionData={setEditingCollectionData}
                              setCollectionSearchQuery={setCollectionSearchQuery}
                              setCollectionSearchResults={setCollectionSearchResults}
                              getAllCollections={getAllCollections}
                              setEditingProductList={setEditingProductList}
                              setEditingProductListData={setEditingProductListData}
                              productSearchQuery={productSearchQuery}
                              setProductSearchQuery={setProductSearchQuery}
                              productSearchResults={productSearchResults}
                              setProductSearchResults={setProductSearchResults}
                              removeComponent={removeComponent}
                              setImageUploadTarget={setImageUploadTarget}
                            />
                          )}
                        />

                        {index === currentProject.layout.length - 1 && (
                          <div
                            className={`relative h-2 transition-all ${sectionInsertTarget?.index === index + 1 ? "h-8" : "h-2 hover:h-4"}`}
                            onDragOver={(e) => handleSectionSlotDragOver(e, index + 1, "before")}
                            onDrop={(e) => handleSectionSlotDrop(e, index + 1)}
                            onDragLeave={handleDragLeave}
                          >
                             {sectionInsertTarget?.index === index + 1 && (
                               <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                 <div className="h-0.5 flex-1 bg-primary rounded-full" />
                                 <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs">
                                   <Plus className="h-3 w-3" />
                                 </div>
                                 <div className="h-0.5 flex-1 bg-primary rounded-full" />
                               </div>
                             )}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      <EditComponentDialog
        editingComponent={editingComponent}
        setEditingComponent={setEditingComponent}
        handleSaveEdit={handleSaveEdit}
      />

      <ImageUploadDialog
        isOpen={!!imageUploadTarget}
        onClose={() => setImageUploadTarget(null)}
        uploadingImage={uploadingImage}
        handleFileUpload={(file) => {
          if (imageUploadTarget) {
            handleFileUpload(file, imageUploadTarget.sectionId, imageUploadTarget.componentId);
          }
        }}
      />

      <CollectionEditDialog
        isOpen={!!editingCollection}
        onClose={() => {
          setEditingCollection(null);
          setEditingCollectionData(null);
          setCollectionSearchQuery("");
        }}
        editingCollectionData={editingCollectionData}
        setEditingCollectionData={setEditingCollectionData}
        collectionSearchQuery={collectionSearchQuery}
        setCollectionSearchQuery={setCollectionSearchQuery}
        collectionSearchResults={collectionSearchResults}
        setCollectionSearchResults={setCollectionSearchResults}
        handleSaveCollection={handleSaveCollection}
      />

      <ProductListEditDialog
        isOpen={!!editingProductList}
        onClose={() => {
          setEditingProductList(null);
          setEditingProductListData(null);
          setProductSearchQuery("");
        }}
        editingProductListData={editingProductListData}
        setEditingProductListData={setEditingProductListData}
        productSearchQuery={productSearchQuery}
        setProductSearchQuery={setProductSearchQuery}
        productSearchResults={productSearchResults}
        setProductSearchResults={setProductSearchResults}
        handleSaveProductList={handleSaveProductList}
      />
    </div>
  );
}
