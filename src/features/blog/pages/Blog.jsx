import React, { useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

import { useBlogs, useBlogCategories } from "../hooks/useBlog";

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
    return "https://placehold.co/800x500?text=Vigyaan+Blog";
  }

  if (typeof image === "object") {
    return (
      image?.url ||
      image?.file ||
      image?.image ||
      "https://placehold.co/800x500?text=Vigyaan+Blog"
    );
  }

  return image;
};

// ==========================================================
// CATEGORY
// ==========================================================

const getCategoryName = (blog) => {
  if (blog?.category && typeof blog.category === "object") {
    return blog.category?.name || blog.category?.title || "General";
  }

  return (
    blog?.category_name || blog?.category_title || blog?.category || "General"
  );
};

// ==========================================================
// AUTHOR
// ==========================================================

const getAuthorName = (blog) => {
  if (blog?.author && typeof blog.author === "object") {
    return (
      blog.author?.full_name ||
      blog.author?.name ||
      blog.author?.username ||
      blog.author?.email ||
      "Vigyaan Team"
    );
  }

  return blog?.author_name || blog?.created_by_name || "Vigyaan Team";
};

// ==========================================================
// DATE
// ==========================================================

const getPublishedDate = (blog) => {
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
    month: "short",
    year: "numeric",
  });
};

// ==========================================================
// READ TIME
// ==========================================================

const getReadTime = (blog) => {
  const value =
    blog?.read_time || blog?.reading_time || blog?.reading_time_minutes;

  return value ? `${value} min read` : "5 min read";
};

// ==========================================================
// FEATURED
// ==========================================================

const isFeaturedBlog = (blog) => {
  return Boolean(blog?.is_featured || blog?.featured);
};

// ==========================================================
// BLOG
// ==========================================================

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");

  const [searchQuery, setSearchQuery] = useState("");

  const { blogs, loading: blogsLoading, error: blogsError } = useBlogs();

  const { categories, loading: categoriesLoading } = useBlogCategories();

  // ========================================================
  // DEBUG
  // ========================================================

  console.log("[BLOG PAGE] blogs:", blogs);

  console.log("[BLOG PAGE] blog count:", blogs.length);

  // ========================================================
  // CATEGORIES
  // ========================================================

  const blogCategories = useMemo(() => {
    const apiCategories = categories
      .map((category) => {
        if (typeof category === "string") {
          return category;
        }

        return category?.name || category?.title || "";
      })
      .filter(Boolean);

    return ["All", ...apiCategories];
  }, [categories]);

  // ========================================================
  // FILTER
  // ========================================================

  const filteredBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return blogs.filter((blog) => {
      const category = getCategoryName(blog);

      const title = blog?.title || "";

      const excerpt = blog?.excerpt || "";

      const matchCategory =
        activeCategory === "All" || category === activeCategory;

      const matchSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        excerpt.toLowerCase().includes(query);

      return matchCategory && matchSearch;
    });
  }, [blogs, activeCategory, searchQuery]);

  // ========================================================
  // FEATURED
  // ========================================================

  const featuredBlogs = useMemo(() => {
    return filteredBlogs.filter(isFeaturedBlog);
  }, [filteredBlogs]);

  // ========================================================
  // REGULAR
  // ========================================================

  const regularBlogs = useMemo(() => {
    return filteredBlogs.filter((blog) => !isFeaturedBlog(blog));
  }, [filteredBlogs]);

  // ========================================================
  // LOADING
  // ========================================================

  if (blogsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
        <Navbar />

        <main className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>

            <p className="text-gray-500">Loading articles...</p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ========================================================
  // ERROR
  // ========================================================

  if (blogsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
        <Navbar />

        <main className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="text-5xl">⚠️</div>

            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              Unable to Load Blogs
            </h2>

            <p className="text-gray-500 mt-2">{blogsError}</p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <Navbar />

      <main className="pt-24 md:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* HEADER */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="text-center mb-12"
          >
            <span className="text-xs text-indigo-600 font-bold uppercase tracking-[0.3em]">
              Blog
            </span>

            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mt-3">
              Vigyaan Insights
            </h1>

            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Discover the latest in IoT technology, smart home tips, tutorials,
              and industry insights.
            </p>
          </motion.div>

          {/* SEARCH + CATEGORY */}

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <div className="relative w-full md:w-80">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categoriesLoading ? (
                <span className="text-sm text-gray-400">
                  Loading categories...
                </span>
              ) : (
                blogCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      activeCategory === category
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
                  >
                    {category}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ==================================================
              FEATURED
              ================================================== */}

          {activeCategory === "All" &&
            searchQuery === "" &&
            featuredBlogs.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-black text-gray-900 mb-6">
                  <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                  Featured Articles
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredBlogs.map((blog, index) => (
                    <motion.div
                      key={blog?.id || blog?.uuid || blog?.slug}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.1,
                      }}
                      className="group"
                    >
                      <Link to={`/blog/${blog?.slug}`}>
                        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={getImageUrl(blog)}
                              alt={blog?.title || "Blog"}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />

                            <div className="absolute top-3 left-3">
                              <span className="bg-yellow-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                                FEATURED
                              </span>
                            </div>
                          </div>

                          <div className="p-5">
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
                              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                {getCategoryName(blog)}
                              </span>

                              <span>{getPublishedDate(blog)}</span>

                              <span>•</span>

                              <span>{getReadTime(blog)}</span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 line-clamp-2">
                              {blog?.title}
                            </h3>

                            {blog?.excerpt && (
                              <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                                {blog.excerpt}
                              </p>
                            )}

                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                {getAuthorName(blog).charAt(0).toUpperCase()}
                              </div>

                              <div>
                                <p className="text-xs font-bold text-gray-900">
                                  {getAuthorName(blog)}
                                </p>

                                <p className="text-[10px] text-gray-400">
                                  Author
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

          {/* ==================================================
              REGULAR BLOGS
              ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {regularBlogs.map((blog, index) => (
                <motion.div
                  key={blog?.id || blog?.uuid || blog?.slug}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="group"
                >
                  <Link to={`/blog/${blog?.slug}`}>
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={getImageUrl(blog)}
                          alt={blog?.title || "Blog"}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
                          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                            {getCategoryName(blog)}
                          </span>

                          <span>{getPublishedDate(blog)}</span>

                          <span>•</span>

                          <span>{getReadTime(blog)}</span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 line-clamp-2">
                          {blog?.title}
                        </h3>

                        {blog?.excerpt && (
                          <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                            {blog.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {getAuthorName(blog).charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="text-xs font-bold text-gray-900">
                              {getAuthorName(blog)}
                            </p>

                            <p className="text-[10px] text-gray-400">Author</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* EMPTY */}

          {filteredBlogs.length === 0 && (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">📝</span>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No articles found
              </h3>

              <p className="text-gray-500">
                Try adjusting your search or filter.
              </p>
            </div>
          )}

          {/* NEWSLETTER */}

          <div className="mt-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-10 md:p-16 text-center border border-indigo-100">
            <span className="text-4xl mb-4 block">📬</span>

            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
              Stay Updated
            </h2>

            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Get the latest IoT insights delivered to your inbox.
            </p>

            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-5 py-4 bg-white border border-gray-200 rounded-l-2xl text-sm"
              />

              <button
                type="button"
                className="px-6 py-4 bg-indigo-600 text-white rounded-r-2xl font-bold text-sm"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
