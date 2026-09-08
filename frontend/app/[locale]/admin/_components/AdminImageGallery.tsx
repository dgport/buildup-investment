"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GripVertical, ImageIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import type { ProjectImage } from "@/lib/types/projects";
import { ImageDropzone, type PendingImage } from "@/app/[locale]/properties/_components/form/ImageDropzone";

interface Props {
  images: ProjectImage[];
  onUpload: (files: File[]) => Promise<unknown>;
  onReorder: (imageIds: number[]) => Promise<unknown>;
  onDelete: (imageId: number) => Promise<unknown>;
  emptyLabel: string;
  deleteConfirm: string;
  coverLabel?: string;
  compact?: boolean;
}

/** Reusable reorderable gallery with upload/delete for admin screens. */
export function AdminImageGallery({
  images,
  onUpload,
  onReorder,
  onDelete,
  emptyLabel,
  deleteConfirm,
  coverLabel,
  compact,
}: Props) {
  const t = useTranslations("admin");
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local order while dragging (reset when server images change)
  const [order, setOrder] = useState<number[]>(images.map((i) => i.id));
  const [synced, setSynced] = useState(images);
  if (synced !== images) {
    setSynced(images);
    setOrder(images.map((i) => i.id));
  }
  const [dragged, setDragged] = useState<number | null>(null);
  const byId = new Map(images.map((i) => [i.id, i]));
  const ordered = order.map((id) => byId.get(id)).filter((i): i is ProjectImage => !!i);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t("common.saveError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

      {ordered.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl py-8 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
          <ImageIcon className="w-8 h-8 text-gray-300" />
          {emptyLabel}
        </div>
      ) : (
        <div className={`grid gap-3 ${compact ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 md:grid-cols-4"}`}>
          {ordered.map((img, index) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setDragged(img.id)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragged === null || dragged === img.id) return;
                setOrder((prev) => {
                  const from = prev.indexOf(dragged);
                  const to = prev.indexOf(img.id);
                  const next = [...prev];
                  next.splice(from, 1);
                  next.splice(to, 0, dragged);
                  return next;
                });
              }}
              onDragEnd={() => {
                setDragged(null);
                if (order.join() !== images.map((i) => i.id).join()) run(() => onReorder(order));
              }}
              className={`relative group rounded-xl overflow-hidden border border-gray-200 bg-slate-50 cursor-move ${dragged === img.id ? "opacity-40" : ""}`}
            >
              <div className={compact ? "aspect-square" : "aspect-video"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveImageUrl(img.imageUrl) ?? ""} alt="" className="w-full h-full object-cover" />
              </div>
              {index === 0 && coverLabel && (
                <span className="absolute top-2 left-2 bg-teal-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">{coverLabel}</span>
              )}
              <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                <GripVertical className="w-2.5 h-2.5" />{index + 1}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => window.confirm(deleteConfirm) && run(() => onDelete(img.id))}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                aria-label={t("common.delete")}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ImageDropzone images={pending} onChange={setPending} existingCount={images.length} onError={setError} />

      {pending.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPending([])} disabled={busy}>{t("common.cancel")}</Button>
          <Button
            disabled={busy}
            className="bg-teal-900 hover:bg-teal-800"
            onClick={() => run(async () => { await onUpload(pending.map((p) => p.file)); setPending([]); })}
          >
            <Upload className="w-4 h-4 mr-2" />
            {busy ? t("projects.images.uploading") : t("projects.images.upload", { count: pending.length })}
          </Button>
        </div>
      )}
    </div>
  );
}
