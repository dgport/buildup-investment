"use client";

import { useRef, useState, type DragEvent } from "react";
import { useTranslations } from "next-intl";
import { Upload, Trash2 } from "lucide-react";
import { MAX_IMAGES, MAX_IMAGE_SIZE, IMAGE_ACCEPT, supportedImage, moveItem, type PendingImage } from "@/lib/image-upload";
import { PhotoOrderControls } from "@/components/shared/PhotoOrderControls";
export { MAX_IMAGES, MAX_IMAGE_SIZE, type PendingImage } from "@/lib/image-upload";

interface ImageDropzoneProps {
  images: PendingImage[];
  onChange: (images: PendingImage[]) => void;
  /** Photos already stored for the property (limits how many can be added). */
  existingCount?: number;
  onError?: (message: string) => void;
  disabled?: boolean;
}

let counter = 0;
export const toPendingImage = (file: File): PendingImage => ({
  id: `${Date.now()}-${counter++}`,
  file,
  preview: URL.createObjectURL(file),
});

/**
 * Local (not yet uploaded) photo picker with drag & drop, validation and
 * drag-to-reorder. The first image is the cover photo.
 */
export function ImageDropzone({
  images,
  onChange,
  existingCount = 0,
  onError,
  disabled = false,
}: ImageDropzoneProps) {
  const t = useTranslations("dashboard.form");
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isOver, setIsOver] = useState(false);

  const addFiles = (fileList: FileList | File[]) => {
    if (disabled) return;
    const files = Array.from(fileList);
    if (!files.length) return;

    const accepted: File[] = [];
    for (const file of files) {
      if (!supportedImage(file.type)) {
        onError?.(t("errors.notImage", { name: file.name }));
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        onError?.(t("errors.imageTooLarge", { name: file.name }));
        continue;
      }
      accepted.push(file);
    }

    const room = MAX_IMAGES - existingCount - images.length;
    if (accepted.length > room) {
      onError?.(t("errors.tooManyImages", { max: MAX_IMAGES }));
    }

    const next = accepted.slice(0, Math.max(0, room)).map(toPendingImage);
    if (next.length) onChange([...images, ...next]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (index: number) =>
    onChange(images.filter((_, i) => i !== index));

  const move = (from: number, to: number) => {
    if (disabled) return;
    onChange(moveItem(images, from, to));
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 sm:p-10 text-center cursor-pointer transition-all focus-within:ring-2 focus-within:ring-teal-600 ${disabled ? "opacity-50 pointer-events-none" : ""} ${
          isOver
            ? "border-teal-500 bg-teal-50/50"
            : "border-gray-200 hover:border-teal-500 hover:bg-teal-50/40"
        }`}
      >
        <Upload className="w-8 h-8 text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-700">{t("uploadTitle")}</p>
        <p className="text-xs text-gray-400 mt-1">
          {t("uploadHint", { max: MAX_IMAGES })}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          disabled={disabled || existingCount + images.length >= MAX_IMAGES}
          aria-label={t("uploadTitle")}
          multiple
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          className="sr-only"
        />
      </label>

      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">{t("reorderHint")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable={!disabled}
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedIndex !== null && draggedIndex !== index) {
                    move(draggedIndex, index);
                    setDraggedIndex(index);
                  }
                }}
                onDragEnd={() => setDraggedIndex(null)}
                className={`relative group rounded-xl overflow-hidden border border-gray-200 cursor-move transition-opacity ${
                  draggedIndex === index ? "opacity-40" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.preview}
                  alt={image.file.name}
                  className="w-full h-28 object-cover"
                />
                {index === 0 && existingCount === 0 && (
                  <span className="absolute top-2 left-2 bg-teal-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {t("cover")}
                  </span>
                )}
                <button
                  type="button"
                  disabled={disabled}
                  draggable={false}
                  onClick={() => remove(index)}
                  aria-label={t("removePhoto")}
                  className="absolute top-1 right-1 flex h-11 w-11 items-center justify-center bg-red-600/90 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <PhotoOrderControls index={index} total={images.length} disabled={disabled} onMove={(direction) => move(index, index + direction)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
