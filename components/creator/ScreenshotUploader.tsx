"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Compact uploader for the optional submission-screenshot field. Looks unlike
 * the admin CoverUploader on purpose: smaller, more "evidence chip" feel since
 * it sits inline in the creator's submission dialog, not a full form section.
 */
export default function ScreenshotUploader({
  value,
  onChange,
  onError
}: {
  value: string;
  onChange: (url: string) => void;
  onError?: (msg: string) => void;
}) {
  const t = useTranslations("creator.submissionForm.screenshot");
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/creator/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error || "upload failed");
      onChange(json.url);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : t("uploadError"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="max-h-[120px] rounded-md border border-border object-contain bg-muted"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={t("remove")}
            className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-foreground text-background flex items-center justify-center shadow"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/40 hover:bg-muted/70 transition px-3 py-2 text-sm text-muted-foreground"
        >
          <ImageIcon className="size-4" />
          {uploading ? t("uploading") : t("upload")}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      <p className="text-[11px] text-muted-foreground">{t("hint")}</p>
    </div>
  );
}
