"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CoverUploader({
  value,
  onChange,
  onError
}: {
  value: string;
  onChange: (url: string) => void;
  onError?: (msg: string) => void;
}) {
  const t = useTranslations("admin.campaigns.form");
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
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
    <div className="space-y-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="w-full max-w-md aspect-[16/9] object-cover rounded-md border border-border bg-muted"
        />
      ) : (
        <div className="w-full max-w-md aspect-[16/9] rounded-md border border-dashed border-border bg-muted/40 flex items-center justify-center text-sm text-muted-foreground">
          {t("noCover")}
        </div>
      )}
      <div className="flex items-center gap-2">
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? t("uploading") : t("upload")}
        </Button>
      </div>
      <Input placeholder="https://…" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
