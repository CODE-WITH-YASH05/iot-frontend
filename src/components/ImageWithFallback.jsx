import React, { useState, useEffect } from "react";

export default function ImageWithFallback({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder-image.png",
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Reset if src changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt || "Product image"}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}
