import React from "react";

import { Link, useParams } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

import { useBlogDetail } from "../hooks/useBlog";

import BlogMediaRenderer from "../components/BlogMediaRenderer";

// ==========================================================
// IMAGE
// ==========================================================

const getImageUrl = (blog) => {
  const image =
    blog?.featured_image_url ||
    blog?.featured_image ||
    blog?.image ||
    blog?.thumbnail_url ||
    blog?.thumbnail;

  if (!image) {
    return "https://placehold.co/1200x700?text=Vigyaan+Blog";
  }

  if (typeof image === "object") {
    return (
      image?.url ||
      image?.file ||
      image?.image ||
      "https://placehold.co/1200x700?text=Vigyaan+Blog"
    );
  }

  return image;
};

// ==========================================================
// CATEGORY
// ==========================================================

const getCategoryName = (blog) => {
  if (blog?.category_name) {
    return blog.category_name;
  }

  if (blog?.category && typeof blog.category === "object") {
    return blog.category?.name || blog.category?.title || "General";
  }

  return blog?.category || "General";
};

// ==========================================================
// AUTHOR
// ==========================================================

const getAuthorName = (blog) => {
  if (blog?.author_name) {
    return blog.author_name;
  }

  if (blog?.author && typeof blog.author === "object") {
    return (
      blog.author?.full_name ||
      blog.author?.name ||
      blog.author?.username ||
      blog.author?.email ||
      "Vigyaan Team"
    );
  }

  return "Vigyaan Team";
};

// ==========================================================
// DATE
// ==========================================================

const getDate = (blog) => {
  const date = blog?.published_at || blog?.published_date || blog?.created_at;

  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// ==========================================================
// READ TIME
// ==========================================================

const getReadTime = (blog) => {
  const value =
    blog?.read_time || blog?.reading_time || blog?.reading_time_minutes;

  if (!value) {
    return null;
  }

  return `${value} min read`;
};

// ==========================================================
// BLOG DETAIL
// ==========================================================

export default function BlogDetail() {
  const { slug } = useParams();

  const { blog, loading, error } = useBlogDetail(slug);

  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="pt-32 pb-20">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>

            <p className="text-gray-500">Loading article...</p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ========================================================
  // ERROR
  // ========================================================

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="pt-32 pb-20">
          <div className="text-center px-4">
            <div className="text-5xl">⚠️</div>

            <h1 className="text-2xl font-bold text-gray-900 mt-4">
              Article not found
            </h1>

            {error && <p className="text-gray-500 mt-2">{error}</p>}

            <Link
              to="/blog"
              className="inline-block mt-6 text-indigo-600 font-semibold"
            >
              ← Back to Blog
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ========================================================
  // MEDIA
  // ========================================================

  const media = Array.isArray(blog?.media)
    ? blog.media
    : Array.isArray(blog?.media_items)
      ? blog.media_items
      : Array.isArray(blog?.blog_media)
        ? blog.blog_media
        : [];

  // ========================================================
  // TAGS
  // ========================================================

  const tags = Array.isArray(blog?.tags) ? blog.tags : [];

  const authorName = getAuthorName(blog);

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-28 pb-20">
        <article className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* BACK */}

          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Articles
          </Link>

          {/* CATEGORY */}

          <div className="mt-8">
            <span className="inline-flex px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
              {getCategoryName(blog)}
            </span>
          </div>

          {/* TITLE */}

          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mt-4 leading-tight">
            {blog?.title}
          </h1>

          {/* EXCERPT */}

          {blog?.excerpt && (
            <p className="text-lg md:text-xl text-gray-500 mt-5 leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          {/* AUTHOR */}

          <div className="flex items-center gap-4 mt-7 mb-8">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg">
              {authorName.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="font-semibold text-gray-900">{authorName}</p>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{getDate(blog)}</span>

                {getReadTime(blog) && (
                  <>
                    <span>•</span>

                    <span>{getReadTime(blog)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* FEATURED IMAGE */}

          <div className="overflow-hidden rounded-3xl bg-gray-100">
            <img
              src={getImageUrl(blog)}
              alt={blog?.title || "Blog featured image"}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* CONTENT */}

          {blog?.content && (
            <div className="mt-10">
              <div
                className="
                  prose
                  prose-lg
                  md:prose-xl
                  max-w-none
                  prose-headings:text-gray-900
                  prose-p:text-gray-700
                  prose-a:text-indigo-600
                  prose-img:rounded-2xl
                "
                dangerouslySetInnerHTML={{
                  __html: blog.content,
                }}
              />
            </div>
          )}

          {/* ==================================================
              BLOG MEDIA
              ================================================== */}

          <BlogMediaRenderer media={media} />

          {/* TAGS */}

          {tags.length > 0 && (
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Tags</h3>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => {
                  const tagName = typeof tag === "string" ? tag : tag?.name;

                  if (!tagName) {
                    return null;
                  }

                  return (
                    <span
                      key={
                        tag?.id ||
                        tag?.uuid ||
                        tag?.slug ||
                        `${tagName}-${index}`
                      }
                      className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600"
                    >
                      #{tagName}
                    </span>
                  );
                })}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
