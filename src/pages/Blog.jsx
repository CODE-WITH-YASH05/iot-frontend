import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { blogs, blogCategories } from "../data/blogs";

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  const filteredBlogs = blogs.filter((blog) => {
    const matchCategory =
      activeCategory === "All" || blog.category === activeCategory;
    const matchSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const featuredBlogs = blogs.filter((b) => b.featured);
  const regularBlogs = filteredBlogs.filter((b) => !b.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <Navbar />

      <main className="pt-24 md:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-xs text-indigo-600 font-bold uppercase tracking-[0.3em]">
              Blog
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mt-3">
              Vigyaan Insights
            </h1>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Discover the latest in IoT technology, smart home tips, and
              industry insights.
            </p>
          </motion.div>

          {/* Search & Categories */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {blogCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Posts */}
          {activeCategory === "All" && searchQuery === "" && (
            <div className="mb-12">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                Featured Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredBlogs.map((blog, i) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onMouseEnter={() => setHoveredCard(blog.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group"
                  >
                    <Link to={`/blog/${blog.slug}`}>
                      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-yellow-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              Featured
                            </span>
                          </div>
                          {blog.videoUrl && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <span className="material-symbols-outlined text-2xl text-indigo-600">
                                  play_arrow
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                              {blog.category}
                            </span>
                            <span>{blog.date}</span>
                            <span>•</span>
                            <span>{blog.readTime}</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                            {blog.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {blog.excerpt}
                          </p>
                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                            <span className="text-2xl">
                              {blog.authorAvatar}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-gray-900">
                                {blog.author}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {blog.authorRole}
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

          {/* All Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {regularBlogs.map((blog, i) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.08 }}
                  onMouseEnter={() => setHoveredCard(blog.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group"
                >
                  <Link to={`/blog/${blog.slug}`}>
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {blog.videoUrl && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                              <span className="material-symbols-outlined text-2xl text-indigo-600">
                                play_arrow
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                            {blog.category}
                          </span>
                          <span>{blog.date}</span>
                          <span>•</span>
                          <span>{blog.readTime}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                          {blog.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {blog.excerpt}
                        </p>
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                          <span className="text-2xl">{blog.authorAvatar}</span>
                          <div>
                            <p className="text-xs font-bold text-gray-900">
                              {blog.author}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {blog.authorRole}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredBlogs.length === 0 && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                article
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No articles found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter.
              </p>
            </div>
          )}

          {/* Newsletter */}
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
                className="flex-1 px-5 py-4 bg-white border border-gray-200 rounded-l-2xl text-sm focus:outline-none focus:border-indigo-400"
              />
              <button className="px-6 py-4 bg-indigo-600 text-white rounded-r-2xl font-bold text-sm hover:bg-indigo-700 transition-all">
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
