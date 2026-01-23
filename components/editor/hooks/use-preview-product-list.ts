import { useState } from "react";
import type { Component, ProductListComponentData } from "@/lib/types";

export function usePreviewProductList(
  updateComponent: (sectionId: string, componentId: string, updates: Partial<Component>) => void,
  saveToHistory: (action: string) => void
) {
  const [editingProductList, setEditingProductList] = useState<{
    sectionId: string;
    component: Component;
  } | null>(null);
  
  const [editingProductListData, setEditingProductListData] = useState<ProductListComponentData | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productSearchResults, setProductSearchResults] = useState<any[]>([]);

  const handleSaveProductList = () => {
    if (editingProductList && editingProductListData) {
      updateComponent(editingProductList.sectionId, editingProductList.component.id, { productListData: editingProductListData });
      saveToHistory("Updated product list");
      setEditingProductList(null);
      setEditingProductListData(null);
      setProductSearchQuery("");
    }
  };

  return {
    editingProductList,
    editingProductListData,
    productSearchQuery,
    productSearchResults,
    setEditingProductList,
    setEditingProductListData,
    setProductSearchQuery,
    setProductSearchResults,
    handleSaveProductList,
  };
}
