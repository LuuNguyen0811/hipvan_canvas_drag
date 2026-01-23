import { useState, useEffect } from "react";
import { saveImage, loadImage } from "@/lib/image-storage";
import type { Component, Project } from "@/lib/types";
import { collectImageComponentsInTree } from "@/lib/editor-utils";

export function usePreviewImages(
  currentProject: Project | null,
  updateComponent: (
    sectionId: string,
    componentId: string,
    updates: Partial<Component>,
  ) => void,
) {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadTarget, setImageUploadTarget] = useState<{
    sectionId: string;
    componentId: string;
  } | null>(null);
  const [mobileImageUploadTarget, setMobileImageUploadTarget] = useState<{
    sectionId: string;
    componentId: string;
  } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  useEffect(() => {
    const loadAllImages = async () => {
      if (!currentProject) return;

      const imageComponents = currentProject.layout.flatMap((section) =>
        collectImageComponentsInTree(section.components),
      );

      const urls: Record<string, string> = {};
      await Promise.all(
        imageComponents.map(async (comp) => {
          if (comp.imageId) {
            const url = await loadImage(comp.imageId);
            if (url) urls[comp.imageId] = url;
          }
          if (comp.mobileImageId) {
            const url = await loadImage(comp.mobileImageId);
            if (url) urls[comp.mobileImageId] = url;
          }
        }),
      );
      setImageUrls(urls);
    };

    loadAllImages();
  }, [currentProject?.id]);

  const handleFileUpload = async (
    file: File,
    sectionId: string,
    componentId: string,
  ) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG, GIF, WebP)");
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const shouldContinue = confirm(
        `This image is ${(file.size / 1024 / 1024).toFixed(1)}MB. It will be compressed to reduce storage usage. Continue?`,
      );
      if (!shouldContinue) return;
    }
    setUploadingImage(true);
    try {
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const objectUrl = await saveImage(imageId, file);
      updateComponent(sectionId, componentId, { imageId, content: file.name });
      setImageUrls((prev) => ({ ...prev, [imageId]: objectUrl }));
      setImageUploadTarget(null);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try a smaller file.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleMobileFileUpload = async (
    file: File,
    sectionId: string,
    componentId: string,
  ) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG, GIF, WebP)");
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const shouldContinue = confirm(
        `This image is ${(file.size / 1024 / 1024).toFixed(1)}MB. It will be compressed to reduce storage usage. Continue?`,
      );
      if (!shouldContinue) return;
    }
    setUploadingImage(true);
    try {
      const mobileImageId = `img_mobile_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const objectUrl = await saveImage(mobileImageId, file);
      updateComponent(sectionId, componentId, { mobileImageId });
      setImageUrls((prev) => ({ ...prev, [mobileImageId]: objectUrl }));
      setMobileImageUploadTarget(null);
    } catch (error) {
      console.error("Failed to upload mobile image:", error);
      alert("Failed to upload image. Please try a smaller file.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveMobileImage = (sectionId: string, componentId: string) => {
    updateComponent(sectionId, componentId, { mobileImageId: undefined });
  };

  const handleImageDrop = (
    e: React.DragEvent,
    sectionId: string,
    componentId: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file, sectionId, componentId);
    }
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  return {
    imageUrls,
    uploadingImage,
    imageUploadTarget,
    mobileImageUploadTarget,
    isDraggingFile,
    setImageUploadTarget,
    setMobileImageUploadTarget,
    handleFileUpload,
    handleMobileFileUpload,
    handleRemoveMobileImage,
    handleImageDrop,
    handleImageDragOver,
    handleImageDragLeave,
    setIsDraggingFile,
  };
}
