import React from "react";

export default function BlogMediaRenderer({ media = [] }) {
  if (!Array.isArray(media) || media.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="space-y-10">
        {media.map((item, index) => {
          const mediaType = item?.media_type;
          const key = item?.id || `${mediaType}-${index}`;

          // =====================================================
          // IMAGE
          // =====================================================

          if (mediaType === "image" && item?.file_url) {
            return (
              <figure key={key}>
                <div className="overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src={item.file_url}
                    alt={item?.alt_text || item?.title || "Blog image"}
                    loading="lazy"
                    className="block w-full h-auto object-cover"
                  />
                </div>

                {item?.title && (
                  <h3 className="mt-3 text-lg font-bold text-gray-900">
                    {item.title}
                  </h3>
                )}

                {item?.caption && (
                  <figcaption className="mt-2 text-sm text-gray-500">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          // =====================================================
          // YOUTUBE / EXTERNAL VIDEO
          // =====================================================

          if (mediaType === "external_video" && item?.embed_url) {
            return (
              <figure key={key}>
                <div className="relative w-full overflow-hidden rounded-2xl bg-black aspect-video">
                  <iframe
                    src={item.embed_url}
                    title={item?.title || "Blog video"}
                    className="absolute inset-0 w-full h-full border-0"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                {item?.title && (
                  <h3 className="mt-3 text-lg font-bold text-gray-900">
                    {item.title}
                  </h3>
                )}

                {item?.caption && (
                  <figcaption className="mt-2 text-sm text-gray-500">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          // =====================================================
          // UNKNOWN / INVALID MEDIA
          // =====================================================

          return (
            <div
              key={key}
              className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700"
            >
              Media could not be displayed.
            </div>
          );
        })}
      </div>
    </section>
  );
}
