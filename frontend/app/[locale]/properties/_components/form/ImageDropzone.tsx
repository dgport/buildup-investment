"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { useTranslations } from "next-intl";
import { Upload, Trash2, GripVertical } from "lucide-react";

export const MAX_IMAGES = 20;
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export interface PendingImage {
  id: string;
  file: File;
  preview: string;
}

interface ImageDropzoneProps {
  images: PendingImage[];
  onChange: (images: PendingImage[]) => void;
  /** Photos already stored for the property (limits how many can be added). */
  existingCount?: number;
  onError?: (message: string) => void;
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
}: ImageDropzoneProps) {
  const t = useTranslations("dashboard.form");
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isOver, setIsOver] = useState(false);

  // Revoke object URLs of images that were removed
  const previousRef = useRef<PendingImage[]>([]);
  useEffect(() => {
    const current = new Set(images.map((i) => i.preview));
    previousRef.current
      .filter((i) => !current.has(i.preview))
      .forEach((i) => URL.revokeObjectURL(i.preview));
    previousRef.current = images;
  }, [images]);
  useEffect(
    () => () => previousRef.current.forEach((i) => URL.revokeObjectURL(i.preview)),
    [],
  );

  const addFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;

    const accepted: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
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
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
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
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          isOver
            ? "border-blue-400 bg-blue-50/50"
            : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/30"
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
          accept="image/*"
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
                draggable
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
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {t("cover")}
                  </span>
                )}
                <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                  <GripVertical className="w-2.5 h-2.5" />
                  {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={t("removePhoto")}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
