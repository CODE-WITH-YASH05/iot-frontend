import publicClient from "../../../api/client";

const BLOG_BASE = "/api/v1/blogs";

const blogApi = {
  // ========================================================
  // PUBLIC BLOG LIST
  // ========================================================

  getBlogs(params = {}) {
    return publicClient.get(`${BLOG_BASE}/`, {
      params,
    });
  },

  // ========================================================
  // FEATURED BLOGS
  // ========================================================

  getFeaturedBlogs(params = {}) {
    return publicClient.get(`${BLOG_BASE}/featured/`, {
      params,
    });
  },

  // ========================================================
  // CATEGORIES
  // ========================================================

  getCategories() {
    return publicClient.get(`${BLOG_BASE}/categories/`);
  },

  // ========================================================
  // TAGS
  // ========================================================

  getTags() {
    return publicClient.get(`${BLOG_BASE}/tags/`);
  },

  // ========================================================
  // BLOG DETAIL
  // ========================================================

  getBlogBySlug(slug) {
    if (!slug) {
      throw new Error("Blog slug is required.");
    }

    return publicClient.get(`${BLOG_BASE}/${encodeURIComponent(slug)}/`);
  },

  // ========================================================
  // CATEGORY
  // ========================================================

  getBlogsByCategory(categorySlug, params = {}) {
    if (!categorySlug) {
      throw new Error("Category slug is required.");
    }

    return publicClient.get(
      `${BLOG_BASE}/category/${encodeURIComponent(categorySlug)}/`,
      {
        params,
      },
    );
  },

  // ========================================================
  // TAG
  // ========================================================

  getBlogsByTag(tagSlug, params = {}) {
    if (!tagSlug) {
      throw new Error("Tag slug is required.");
    }

    return publicClient.get(
      `${BLOG_BASE}/tag/${encodeURIComponent(tagSlug)}/`,
      {
        params,
      },
    );
  },
};

export default blogApi;

export { blogApi };
