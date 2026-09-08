"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2, ImageIcon, Upload, GripVertical, CheckCircle2 } from "lucide-react";
import {
  usePropertyManage,
  useDeletePropertyImage,
  useAddPropertyImages,
  useReorderPropertyImages,
} from "@/lib/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import { getErrorMessage } from "@/lib/api/api";
import type { PropertyGalleryImage } from "@/lib/types/properties";
import { ImageDropzone, type PendingImage } from "./form/ImageDropzone";

interface PropertyImagesManagerProps {
  propertyId: string;
}

export function PropertyImagesManager({ propertyId }: PropertyImagesManagerProps) {
  const t = useTranslations("dashboard.images");
  const tf = useTranslations("dashboard.form");
  const ta = useTranslations("common.actions");
  const { data: property, isLoading } = usePropertyManage(propertyId);
  const deleteImage = useDeletePropertyImage();
  const addImages = useAddPropertyImages();
  const reorder = useReorderPropertyImages();

  const [pending, setPending] = useState<PendingImage[]>([]);
  const serverImages = property?.galleryImages;
  const [gallery, setGallery] = useState<PropertyGalleryImage[]>(serverImages ?? []);
  const [syncedImages, setSyncedImages] = useState(serverImages);
  if (serverImages !== syncedImages) {
    // Server data changed (upload/delete/refetch) -> reset the local order
    setSyncedImages(serverImages);
    setGallery(serverImages ?? []);
  }
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const showMessage = (type: "success" | "error", text: string) =>
    setMessage({ type, text });

  const handleUpload = async () => {
    if (!pending.length) return;
    try {
      await addImages.mutateAsync({
        id: propertyId,
        images: pending.map((p) => p.file),
      });
      showMessage("success", t("uploaded", { count: pending.length }));
      setPending([]);
    } catch (err) {
      showMessage("error", getErrorMessage(err, t("uploadFailed")));
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      await deleteImage.mutateAsync({ propertyId, imageId });
      showMessage("success", t("deleted"));
    } catch (err) {
      showMessage("error", getErrorMessage(err, t("deleteFailed")));
    }
  };

  const moveTo = (fromId: number, toId: number) => {
    if (fromId === toId) return;
    setGallery((prev) => {
      const from = prev.findIndex((i) => i.id === fromId);
      const to = prev.findIndex((i) => i.id === toId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const persistOrder = async () => {
    setDraggedId(null);
    const ids = gallery.map((g) => g.id);
    const serverIds = property?.galleryImages.map((g) => g.id) ?? [];
    if (ids.join(",") === serverIds.join(",")) return;
    try {
      await reorder.mutateAsync({ propertyId, imageIds: ids });
    } catch (err) {
      showMessage("error", getErrorMessage(err, t("reorderFailed")));
      if (property?.galleryImages) setGallery(property.galleryImages);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert
          variant={message.type === "error" ? "destructive" : "default"}
          className={
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : undefined
          }
        >
          {message.type === "success" && (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div>
        <h3 className="font-semibold text-gray-900">{t("title")}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{t("subtitle")}</p>
      </div>

      {gallery.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl py-12 text-center">
          <ImageIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => setDraggedId(image.id)}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedId !== null) moveTo(draggedId, image.id);
              }}
              onDragEnd={persistOrder}
              className={`relative group rounded-xl overflow-hidden border border-gray-200 cursor-move transition-opacity ${
                draggedId === image.id ? "opacity-40" : ""
              }`}
            >
              <div className="aspect-video bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImageUrl(image.imageUrl) ?? ""}
                  alt={t("position", { position: index + 1 })}
                  className="w-full h-full object-cover"
                />
              </div>
              {index === 0 && (
                <span className="absolute top-2 left-2 bg-teal-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {tf("cover")}
                </span>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                <GripVertical className="w-2.5 h-2.5" />
                {index + 1}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(image.id)}
                disabled={deleteImage.isPending}
                aria-label={tf("removePhoto")}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 border-t border-gray-100 space-y-4">
        <ImageDropzone
          images={pending}
          onChange={setPending}
          existingCount={gallery.length}
          onError={(text) => showMessage("error", text)}
        />

        {pending.length > 0 && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-gray-600">
              {t("selected", { count: pending.length })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPending([])}
                disabled={addImages.isPending}
              >
                {ta("cancel")}
              </Button>
              <Button
                onClick={handleUpload}
                disabled={addImages.isPending}
                className="bg-teal-900 hover:bg-teal-800"
              >
                <Upload className="w-4 h-4 mr-2" />
                {addImages.isPending
                  ? t("uploading")
                  : t("upload", { count: pending.length })}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
