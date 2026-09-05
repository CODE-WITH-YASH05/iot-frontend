import apiClient from "../../../api/admin-client";

const ADMIN_BLOG_BASE = "/api/v1/admin/blogs";

export const adminBlogApi = {
  // ==========================================================
  // BLOGS
  // ==========================================================

  getBlogs(params = {}) {
    return apiClient.get(`${ADMIN_BLOG_BASE}/`, {
      params,
    });
  },

  getBlog(id) {
    if (!id) {
      throw new Error("Blog ID is required.");
    }
    return apiClient.get(`${ADMIN_BLOG_BASE}/${encodeURIComponent(id)}/`);
  },

  createBlog(data) {
    return apiClient.post(`${ADMIN_BLOG_BASE}/`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateBlog(id, data) {
    if (!id) {
      throw new Error("Blog ID is required.");
    }
    return apiClient.patch(
      `${ADMIN_BLOG_BASE}/${encodeURIComponent(id)}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  deleteBlog(id) {
    if (!id) {
      throw new Error("Blog ID is required.");
    }
    return apiClient.delete(`${ADMIN_BLOG_BASE}/${encodeURIComponent(id)}/`);
  },

  // ==========================================================
  // BLOG STATISTICS
  // ==========================================================

  getBlogStats(id) {
    if (!id) {
      throw new Error("Blog ID is required.");
    }
    return apiClient.get(`${ADMIN_BLOG_BASE}/${encodeURIComponent(id)}/stats/`);
  },

  getBlogAnalytics(params = {}) {
    return apiClient.get(`${ADMIN_BLOG_BASE}/analytics/`, {
      params,
    });
  },

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  getCategories(params = {}) {
    return apiClient.get(`${ADMIN_BLOG_BASE}/categories/`, {
      params,
    });
  },

  getCategory(id) {
    if (!id) {
      throw new Error("Category ID is required.");
    }
    return apiClient.get(
      `${ADMIN_BLOG_BASE}/categories/${encodeURIComponent(id)}/`,
    );
  },

  createCategory(data) {
    return apiClient.post(`${ADMIN_BLOG_BASE}/categories/`, data);
  },

  updateCategory(id, data) {
    if (!id) {
      throw new Error("Category ID is required.");
    }
    return apiClient.patch(
      `${ADMIN_BLOG_BASE}/categories/${encodeURIComponent(id)}/`,
      data,
    );
  },

  deleteCategory(id) {
    if (!id) {
      throw new Error("Category ID is required.");
    }
    return apiClient.delete(
      `${ADMIN_BLOG_BASE}/categories/${encodeURIComponent(id)}/`,
    );
  },

  // ==========================================================
  // TAGS
  // ==========================================================

  getTags(params = {}) {
    return apiClient.get(`${ADMIN_BLOG_BASE}/tags/`, {
      params,
    });
  },

  getTag(id) {
    if (!id) {
      throw new Error("Tag ID is required.");
    }
    return apiClient.get(`${ADMIN_BLOG_BASE}/tags/${encodeURIComponent(id)}/`);
  },

  createTag(data) {
    return apiClient.post(`${ADMIN_BLOG_BASE}/tags/`, data);
  },

  updateTag(id, data) {
    if (!id) {
      throw new Error("Tag ID is required.");
    }
    return apiClient.patch(
      `${ADMIN_BLOG_BASE}/tags/${encodeURIComponent(id)}/`,
      data,
    );
  },

  deleteTag(id) {
    if (!id) {
      throw new Error("Tag ID is required.");
    }
    return apiClient.delete(
      `${ADMIN_BLOG_BASE}/tags/${encodeURIComponent(id)}/`,
    );
  },

  // ==========================================================
  // BLOG MEDIA (Media specific to a blog)
  // ==========================================================

  getBlogMedia(blogId, params = {}) {
    if (!blogId) {
      throw new Error("Blog ID is required.");
    }
    return apiClient.get(
      `${ADMIN_BLOG_BASE}/${encodeURIComponent(blogId)}/media/`,
      { params },
    );
  },

  createBlogMedia(blogId, data) {
    if (!blogId) {
      throw new Error("Blog ID is required.");
    }
    return apiClient.post(
      `${ADMIN_BLOG_BASE}/${encodeURIComponent(blogId)}/media/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  updateBlogMedia(blogId, mediaId, data) {
    if (!blogId) {
      throw new Error("Blog ID is required.");
    }
    if (!mediaId) {
      throw new Error("Media ID is required.");
    }
    return apiClient.patch(
      `${ADMIN_BLOG_BASE}/${encodeURIComponent(blogId)}/media/${encodeURIComponent(mediaId)}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  deleteBlogMedia(blogId, mediaId) {
    if (!blogId) {
      throw new Error("Blog ID is required.");
    }
    if (!mediaId) {
      throw new Error("Media ID is required.");
    }
    return apiClient.delete(
      `${ADMIN_BLOG_BASE}/${encodeURIComponent(blogId)}/media/${encodeURIComponent(mediaId)}/`,
    );
  },

  // ==========================================================
  // MEDIA (Global media management)
  // ==========================================================

  getMedia(params = {}) {
    return apiClient.get(`${ADMIN_BLOG_BASE}/media/`, {
      params,
    });
  },

  getMediaDetail(id) {
    if (!id) {
      throw new Error("Media ID is required.");
    }
    return apiClient.get(`${ADMIN_BLOG_BASE}/media/${encodeURIComponent(id)}/`);
  },

  createMedia(data) {
    return apiClient.post(`${ADMIN_BLOG_BASE}/media/`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateMedia(id, data) {
    if (!id) {
      throw new Error("Media ID is required.");
    }
    return apiClient.patch(
      `${ADMIN_BLOG_BASE}/media/${encodeURIComponent(id)}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  deleteMedia(id) {
    if (!id) {
      throw new Error("Media ID is required.");
    }
    return apiClient.delete(
      `${ADMIN_BLOG_BASE}/media/${encodeURIComponent(id)}/`,
    );
  },

  // ==========================================================
  // BULK OPERATIONS
  // ==========================================================

  bulkDeleteBlogs(ids) {
    return apiClient.post(`${ADMIN_BLOG_BASE}/bulk-delete/`, { ids });
  },

  bulkUpdateStatus(ids, status) {
    return apiClient.post(`${ADMIN_BLOG_BASE}/bulk-update-status/`, {
      ids,
      status,
    });
  },

  // ==========================================================
  // COMMENTS
  // ==========================================================

  getBlogComments(blogId, params = {}) {
    if (!blogId) {
      throw new Error("Blog ID is required.");
    }
    return apiClient.get(
      `${ADMIN_BLOG_BASE}/${encodeURIComponent(blogId)}/comments/`,
      { params },
    );
  },

  deleteComment(commentId) {
    if (!commentId) {
      throw new Error("Comment ID is required.");
    }
    return apiClient.delete(
      `/api/v1/admin/comments/${encodeURIComponent(commentId)}/`,
    );
  },

  approveComment(commentId) {
    if (!commentId) {
      throw new Error("Comment ID is required.");
    }
    return apiClient.post(
      `/api/v1/admin/comments/${encodeURIComponent(commentId)}/approve/`,
    );
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchBlogs(query, params = {}) {
    return apiClient.get(`${ADMIN_BLOG_BASE}/search/`, {
      params: {
        q: query,
        ...params,
      },
    });
  },

  // ==========================================================
  // EXPORT / IMPORT
  // ==========================================================

  exportBlogs(format = "json", params = {}) {
    return apiClient.get(`${ADMIN_BLOG_BASE}/export/`, {
      params: {
        format,
        ...params,
      },
      responseType: format === "csv" ? "blob" : "json",
    });
  },

  importBlogs(data) {
    return apiClient.post(`${ADMIN_BLOG_BASE}/import/`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default adminBlogApi;
