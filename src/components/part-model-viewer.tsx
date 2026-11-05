"use client";

import { useEffect, useRef, useState } from "react";
import { PartThumb } from "@/components/part-thumb";

type PartModelViewerProps = {
  src: string;
  alt: string;
  poster?: string | null;
  className?: string;
};

export function PartModelViewer({
  src,
  alt,
  poster,
  className = "",
}: PartModelViewerProps) {
  const viewerRef = useRef<HTMLElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void import("@google/model-viewer");
  }, []);

  useEffect(() => {
    setFailed(false);
    const el = viewerRef.current;
    if (!el) return;

    const onError = () => setFailed(true);
    el.addEventListener("error", onError);
    return () => el.removeEventListener("error", onError);
  }, [src]);

  if (failed) {
    return (
      <PartThumb
        src={poster}
        alt={alt}
        className={`parts-hero-thumb ${className}`.trim()}
      />
    );
  }

  return (
    <model-viewer
      // Custom element ref is HTMLElement at runtime.
      ref={viewerRef as never}
      className={`part-model-viewer ${className}`.trim()}
      src={src}
      alt={alt}
      poster={poster || undefined}
      camera-controls
      auto-rotate
      touch-action="pan-y"
      shadow-intensity="0.85"
      exposure="1.05"
      loading="eager"
      reveal="auto"
    />
  );
}
