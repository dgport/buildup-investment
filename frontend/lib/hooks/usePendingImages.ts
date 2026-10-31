"use client";

import { useEffect, useRef, useState } from "react";
import type { PendingImage } from "@/lib/image-upload";

/** The form owns previews so switching wizard steps does not revoke them. */
export function usePendingImages() {
  const [images, setImages] = useState<PendingImage[]>([]);
  const previous = useRef<PendingImage[]>([]);
  useEffect(() => {
    const active = new Set(images.map((image) => image.preview));
    previous.current.filter((image) => !active.has(image.preview)).forEach((image) => URL.revokeObjectURL(image.preview));
    previous.current = images;
  }, [images]);
  useEffect(() => () => previous.current.forEach((image) => URL.revokeObjectURL(image.preview)), []);
  return [images, setImages] as const;
}
