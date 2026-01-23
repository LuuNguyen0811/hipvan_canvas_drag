import { useState } from "react";
import type { Component, CollectionComponentData } from "@/lib/types";

export function usePreviewCollection(
  updateComponent: (sectionId: string, componentId: string, updates: Partial<Component>) => void,
  reorderCollectionItems: (sectionId: string, componentId: string, fromIndex: number, toIndex: number) => void,
  saveToHistory: (action: string) => void
) {
  const [editingCollection, setEditingCollection] = useState<{
    sectionId: string;
    component: Component;
  } | null>(null);
  const [collectionSearchQuery, setCollectionSearchQuery] = useState("");
  const [collectionSearchResults, setCollectionSearchResults] = useState<any[]>([]);
  const [editingCollectionData, setEditingCollectionData] = useState<CollectionComponentData | null>(null);
  const [draggingCollectionItemIndex, setDraggingCollectionItemIndex] = useState<{
    sectionId: string;
    componentId: string;
    index: number;
  } | null>(null);

  const handleSaveCollection = () => {
    if (editingCollection && editingCollectionData) {
      updateComponent(editingCollection.sectionId, editingCollection.component.id, { collectionData: editingCollectionData });
      saveToHistory("Updated collection");
      setEditingCollection(null);
      setEditingCollectionData(null);
    }
  };

  const handleCollectionItemDragStart = (e: React.DragEvent, sectionId: string, componentId: string, itemIndex: number) => {
    e.stopPropagation();
    e.dataTransfer.setData("collectionItemIndex", itemIndex.toString());
    e.dataTransfer.setData("sectionId", sectionId);
    e.dataTransfer.setData("componentId", componentId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingCollectionItemIndex({ sectionId, componentId, index: itemIndex });
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = "0.2";
    }, 0);
  };

  const handleCollectionItemDragOver = (e: React.DragEvent, sectionId: string, componentId: string, hoverIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingCollectionItemIndex) return;
    const { sectionId: sId, componentId: cId, index: dIdx } = draggingCollectionItemIndex;
    if (sId === sectionId && cId === componentId && dIdx !== hoverIndex) {
      reorderCollectionItems(sectionId, componentId, dIdx, hoverIndex);
      setDraggingCollectionItemIndex({ sectionId, componentId, index: hoverIndex });
    }
  };

  const handleCollectionItemDragEnd = (e: React.DragEvent) => {
    setDraggingCollectionItemIndex(null);
    if (e.target instanceof HTMLElement) e.target.style.opacity = "";
  };

  const handleCollectionItemDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingCollectionItemIndex(null);
  };

  return {
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
  };
}
