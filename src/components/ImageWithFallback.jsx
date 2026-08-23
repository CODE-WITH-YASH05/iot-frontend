import React, { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function buildImageUrl(src) {
  if (!src) return null;

  // Already complete URL
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:")
  ) {
    return src;
  }

  // Relative media path
  return `${API_BASE_URL.replace(/\/$/, "")}/${src.replace(/^\//, "")}`;
}

export default function ImageWithFallback({
  src,
  alt = "Product image",
  className = "",
  fallbackSrc = "/placeholder-image.png",
}) {
  const [imgSrc, setImgSrc] = useState(buildImageUrl(src) || fallbackSrc);

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const url = buildImageUrl(src);

    console.log("IMAGE SRC:", src);
    console.log("IMAGE URL:", url);

    setImgSrc(url || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    console.error("IMAGE LOAD FAILED:", imgSrc);

    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}
