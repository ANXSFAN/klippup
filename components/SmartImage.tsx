"use client";
import * as React from "react";

export default function SmartImage({
  src,
  alt,
  fallbackSeed,
  className,
  loading = "lazy"
}: {
  src: string;
  alt: string;
  fallbackSeed: string;
  className?: string;
  loading?: "eager" | "lazy";
}) {
  const [errored, setErrored] = React.useState(false);
  const finalSrc = errored
    ? `https://picsum.photos/seed/${encodeURIComponent(fallbackSeed)}/800/500`
    : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt={alt}
      loading={loading}
      onError={() => setErrored(true)}
      className={className}
    />
  );
}
