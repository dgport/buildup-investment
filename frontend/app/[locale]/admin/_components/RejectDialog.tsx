"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const PRESETS = ["photos", "price", "duplicate", "info"] as const;

/** Reject-with-reason dialog shared by the overview queue and the listings table. */
export function RejectDialog({
  target,
  onClose,
  onConfirm,
  pending,
}: {
  target: { id: string; title: string } | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  pending?: boolean;
}) {
  const t = useTranslations("admin");
  const [reason, setReason] = useState("");

  const close = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("listings.rejectTitle")}</DialogTitle>
          <DialogDescription>{target?.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setReason(t(`listings.rejectPresets.${key}`))}
                className="text-xs px-2.5 py-1 rounded-full border border-teal-200 text-teal-800 hover:bg-teal-50"
              >
                {t(`listings.rejectPresets.${key}`)}
              </button>
            ))}
          </div>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder={t("listings.rejectPlaceholder")}
            autoFocus
          />
          <p className="text-xs text-slate-500">{t("listings.rejectHint")}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={pending}>
            {t("common.cancel")}
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" disabled={pending || !reason.trim()} onClick={() => onConfirm(reason.trim())}>
            {t("listings.reject")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
