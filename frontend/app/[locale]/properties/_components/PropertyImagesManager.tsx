"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, ImageIcon, Upload, GripVertical } from "lucide-react";
import {
  useProperty,
  useDeletePropertyImage,
  useUpdateProperty,
} from "@/lib/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ??
  "http://localhost:3000";

function resolveImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
    return imageUrl;
  return `${API_BASE}/${imageUrl.replace(/^\/+/, "")}`;
}

interface FileWithPreview {
  file: File;
  preview: string;
}

interface PropertyImagesManagerProps {
  propertyId: string;
  onSuccess?: () => void;
}

export function PropertyImagesManager({
  propertyId,
  onSuccess,
}: PropertyImagesManagerProps) {
  const { data: property, isLoading, refetch } = useProperty(propertyId);
  const deleteImage = useDeletePropertyImage();
  const updateProperty = useUpdateProperty();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    return () => {
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, [selectedFiles]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const filesWithPreview = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedFiles((prev) => [...prev, ...filesWithPreview]);
  };

  const clearSelection = () => {
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(selectedFiles[index].preview);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const newFiles = [...selectedFiles];
    const [moved] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(targetIndex, 0, moved);
    setSelectedFiles(newFiles);
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    try {
      await updateProperty.mutateAsync({
        id: propertyId,
        data: {},
        images: selectedFiles.map((f) => f.file),
      });
      showMessage(
        "success",
        `${selectedFiles.length} image(s) uploaded successfully`,
      );
      clearSelection();
      await refetch();
      onSuccess?.();
    } catch (err: any) {
      showMessage("error", err.message ?? "Failed to upload images");
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await deleteImage.mutateAsync({ propertyId, imageId });
      showMessage("success", "Image deleted");
      await refetch();
      onSuccess?.();
    } catch {
      showMessage("error", "Failed to delete image");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading images…</p>
      </div>
    );
  }

  const images = property?.galleryImages ?? [];

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Property Images</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage gallery images
          </p>
        </div>
        <div className="flex gap-2">
          {selectedFiles.length > 0 ? (
            <>
              <Button
                variant="outline"
                onClick={clearSelection}
                disabled={updateProperty.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={updateProperty.isPending}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {updateProperty.isPending
                  ? "Uploading…"
                  : `Upload ${selectedFiles.length} image(s)`}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Select Images
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-blue-900">
                {selectedFiles.length} file(s) selected
              </p>
              <p className="text-xs text-blue-600">Drag to reorder</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {selectedFiles.map((f, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative group cursor-move rounded-lg overflow-hidden border-2 border-blue-300 ${
                    draggedIndex === index ? "opacity-40" : ""
                  }`}
                >
                  <img
                    src={f.preview}
                    alt={f.file.name}
                    className="w-full h-24 object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Cover
                    </span>
                  )}
                  <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                    <GripVertical className="w-2.5 h-2.5" />
                    {index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing gallery */}
      {images.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No images yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden group">
              <div className="relative aspect-video">
                <img
                  src={resolveImageUrl(image.imageUrl)}
                  alt={`Image ${image.order + 1}`}
                  className="w-full h-full object-cover"
                />
                {image.order === 0 && (
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                    Cover
                  </span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={deleteImage.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-2 text-center">
                <p className="text-xs text-muted-foreground">
                  Position {image.order + 1}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
