import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { blogs } from "../data/blogs";

export default function BlogDetail() {
  const { slug } = useParams();
  const blog = blogs.find((b) => b.slug === slug);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navbar />
        <div className="pt-32 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300">
            article
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            Article Not Found
          </h2>
          <Link to="/blog" className="text-indigo-600 mt-2 inline-block">
            ← Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedBlogs = blogs
    .filter((b) => b.id !== blog.id && b.category === blog.category)
    .slice(0, 3);

  const openLightbox = (img) => {
    setLightboxImage(img);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

  const openVideo = () => {
    setVideoOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeVideo = () => {
    setVideoOpen(false);
    document.body.style.overflow = "auto";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <Navbar />

      <main className="pt-24 md:pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-indigo-600">
              Home
            </Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-indigo-600">
              Blog
            </Link>
            <span>/</span>
            <span className="text-gray-600">{blog.category}</span>
          </div>

          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 text-xs mb-4">
              <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full font-bold">
                {blog.category}
              </span>
              <span className="text-gray-400">{blog.date}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{blog.readTime}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-6">
              {blog.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
              <span className="text-4xl">{blog.authorAvatar}</span>
              <div>
                <p className="font-bold text-gray-900">{blog.author}</p>
                <p className="text-sm text-gray-400">{blog.authorRole}</p>
              </div>
              <div className="ml-auto flex gap-2">
                {blog.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden mb-8 cursor-pointer group"
            onClick={() => openLightbox(blog.image)}
          >
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <span className="bg-white/90 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-all">
                🔍 Click to Expand
              </span>
            </div>
            {blog.videoUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openVideo();
                }}
                className="absolute bottom-4 right-4 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-all hover:scale-110"
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  play_arrow
                </span>
              </button>
            )}
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 mb-8">
            {[
              { id: "content", label: "📄 Article" },
              { id: "gallery", label: "🖼️ Gallery" },
              { id: "video", label: "🎬 Video" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "content" && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl p-6 md:p-10 border border-gray-100 shadow-sm"
              >
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: blog.content
                      .replace(/\n/g, "<br/>")
                      .replace(
                        /## (.*)/g,
                        '<h2 class="text-2xl font-black text-gray-900 mt-8 mb-4">$1</h2>',
                      )
                      .replace(
                        /### (.*)/g,
                        '<h3 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h3>',
                      )
                      .replace(
                        /\*\*(.*)\*\*/g,
                        '<strong class="text-gray-900">$1</strong>',
                      )
                      .replace(/^- (.*)/gm, '<li class="ml-4 mb-2">$1</li>')
                      .replace(
                        /(\d+)\. (.*)/g,
                        '<li class="ml-4 mb-2"><strong>$1.</strong> $2</li>',
                      ),
                  }}
                ></div>
              </motion.div>
            )}

            {activeTab === "gallery" && blog.gallery && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
              >
                {blog.gallery.map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => openLightbox(img)}
                    className="rounded-2xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-lg transition-all"
                  >
                    <img
                      src={img}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "video" && (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl p-6 md:p-10 border border-gray-100 shadow-sm"
              >
                {blog.videoUrl ? (
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <iframe
                      src={blog.videoUrl}
                      title={blog.title}
                      className="w-full h-full"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="text-6xl">🎬</span>
                    <p className="text-gray-500 mt-4">
                      No video available for this article.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Related Posts */}
          {relatedBlogs.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((rb) => (
                  <Link key={rb.id} to={`/blog/${rb.slug}`}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all"
                    >
                      <img
                        src={rb.image}
                        alt={rb.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                          {rb.category}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 mt-2 line-clamp-2">
                          {rb.title}
                        </h3>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="text-center mt-12">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back to All Articles
            </Link>
          </div>
        </div>
      </main>

      {/* Image Lightbox Popup */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={lightboxImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Popup */}
      <AnimatePresence>
        {videoOpen && blog.videoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeVideo}
          >
            <button
              onClick={closeVideo}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={`${blog.videoUrl}?autoplay=1`}
                title={blog.title}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay"
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
