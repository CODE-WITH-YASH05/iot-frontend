import { useState } from "react";
import adminBlogApi from "../api/adminBlogApi";
import { useAdminBlogMedia } from "../hooks/useAdminBlog";

export default function BlogMediaManager({ blogId }) {
  const { media, loading, error, refetch } = useAdminBlogMedia(blogId);

  const [activeTab, setActiveTab] = useState("image");
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [externalUrl, setExternalUrl] = useState("");

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");

  const resetForm = () => {
    setImageFile(null);
    setVideoFile(null);
    setExternalUrl("");
    setTitle("");
    setCaption("");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormError(null);
    setSuccess(null);
    resetForm();
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!blogId) {
      setFormError("Please save or select a blog before adding media.");
      return;
    }

    setFormError(null);
    setSuccess(null);

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("blog", blogId);

      if (activeTab === "image") {
        if (!imageFile) {
          throw new Error("Please select an image.");
        }

        formData.append("media_type", "image");
        formData.append("file", imageFile);
      }

      if (activeTab === "video") {
        if (!videoFile) {
          throw new Error("Please select a video.");
        }

        formData.append("media_type", "video");
        formData.append("file", videoFile);
      }

      if (activeTab === "external") {
        if (!externalUrl.trim()) {
          throw new Error("Please enter a YouTube or Vimeo URL.");
        }

        formData.append("media_type", "external_video");
        formData.append("external_url", externalUrl.trim());
      }

      if (title.trim()) {
        formData.append("title", title.trim());
      }

      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

      await adminBlogApi.createMedia(formData);

      setSuccess("Media added successfully.");

      resetForm();

      await refetch();
    } catch (err) {
      console.error("Media upload failed:", err);

      const data = err?.response?.data;

      let message = err?.message || "Failed to add media.";

      if (typeof data === "string") {
        message = data;
      } else if (data?.detail) {
        message = data.detail;
      } else if (data?.message) {
        message = data.message;
      } else if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];

        if (firstKey) {
          const value = data[firstKey];

          if (Array.isArray(value)) {
            message = value[0];
          } else if (typeof value === "string") {
            message = value;
          }
        }
      }

      setFormError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId) => {
    if (!mediaId) {
      alert("Media ID not found.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this media?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await adminBlogApi.deleteMedia(mediaId);

      await refetch();
    } catch (err) {
      console.error("Failed to delete media:", err);

      alert(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to delete media.",
      );
    }
  };

  const mediaList = Array.isArray(media) ? media : [];

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h2 className="text-xl font-bold text-gray-900">Blog Media</h2>

        <p className="text-sm text-gray-500 mt-1">
          Upload images, videos, or add YouTube/Vimeo links.
        </p>
      </div>

      {/* TABS */}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleTabChange("image")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === "image"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Upload Image
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("video")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === "video"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Upload Video
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("external")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === "external"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          YouTube / Vimeo
        </button>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleUpload}
        className="bg-white border border-gray-200 rounded-xl p-6 space-y-4"
      >
        {activeTab === "image" && (
          <div>
            <label className="block text-sm font-semibold mb-2">
              Select Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImageFile(event.target.files?.[0] || null)
              }
              className="w-full border rounded-lg p-3"
            />

            {imageFile && (
              <p className="text-xs text-gray-500 mt-2">
                Selected: {imageFile.name}
              </p>
            )}
          </div>
        )}

        {activeTab === "video" && (
          <div>
            <label className="block text-sm font-semibold mb-2">
              Select Video
            </label>

            <input
              type="file"
              accept="video/*"
              onChange={(event) =>
                setVideoFile(event.target.files?.[0] || null)
              }
              className="w-full border rounded-lg p-3"
            />

            {videoFile && (
              <p className="text-xs text-gray-500 mt-2">
                Selected: {videoFile.name}
              </p>
            )}
          </div>
        )}

        {activeTab === "external" && (
          <div>
            <label className="block text-sm font-semibold mb-2">
              YouTube or Vimeo URL
            </label>

            <input
              type="url"
              value={externalUrl}
              onChange={(event) => setExternalUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-2">
            Media Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Optional title"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Description / Caption
          </label>

          <textarea
            rows="3"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Optional description"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
            {formError}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Add Media"}
        </button>
      </form>

      {/* MEDIA LIST */}

      <div>
        <h3 className="font-bold text-gray-900 mb-4">Existing Media</h3>

        {loading && <p className="text-gray-500">Loading media...</p>}

        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && mediaList.length === 0 && (
          <p className="text-gray-400">No media added yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mediaList.map((item) => {
            const mediaType = item?.media_type;

            const imageUrl =
              item?.file_url || item?.image_url || item?.url || item?.file;

            const videoUrl =
              item?.file_url || item?.video_url || item?.url || item?.file;

            const embedUrl = item?.embed_url || item?.external_embed_url;

            return (
              <div
                key={item?.id || item?.uuid}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white"
              >
                <div className="aspect-video bg-gray-100">
                  {mediaType === "image" && imageUrl && (
                    <img
                      src={imageUrl}
                      alt={item?.alt_text || item?.title || "Blog media"}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {mediaType === "video" && videoUrl && (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}

                  {mediaType === "external_video" && embedUrl && (
                    <iframe
                      src={embedUrl}
                      title={item?.title || "External video"}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  )}

                  {!imageUrl && !videoUrl && !embedUrl && (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Preview unavailable
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="font-semibold text-gray-900">
                    {item?.title || "Untitled Media"}
                  </p>

                  {item?.caption && (
                    <p className="text-sm text-gray-500 mt-1">{item.caption}</p>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(item?.id || item?.uuid || item?.pk)
                    }
                    className="mt-4 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
