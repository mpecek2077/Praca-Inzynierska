"use client";

import { useEffect, useState } from "react";

type PartThumbProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

export function PartThumb({ src, alt = "", className = "" }: PartThumbProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={`part-thumb ${className}`.trim()}
      aria-hidden={alt ? undefined : true}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>Brak zdjęcia</span>
      )}
    </div>
  );
}
