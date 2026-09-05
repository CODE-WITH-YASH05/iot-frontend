import { useCallback, useEffect, useState } from "react";

import adminBlogApi from "../api/adminBlogApi";

// ==========================================================
// HELPERS
// ==========================================================

const extractResults = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const getErrorMessage = (error, fallbackMessage) => {
  const data = error?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data?.detail) {
    return data.detail;
  }

  if (data?.message) {
    return data.message;
  }

  if (data && typeof data === "object") {
    const firstKey = Object.keys(data)[0];

    if (firstKey) {
      const value = data[firstKey];

      if (Array.isArray(value)) {
        return value[0];
      }

      if (typeof value === "string") {
        return value;
      }
    }
  }

  return fallbackMessage;
};

// ==========================================================
// ADMIN BLOGS
// ==========================================================

export function useAdminBlogs(params = {}) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.getBlogs(params);

      setBlogs(extractResults(response));
    } catch (err) {
      console.error("Failed to fetch admin blogs:", err);

      setError(getErrorMessage(err, "Failed to load blogs."));

      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return {
    blogs,
    loading,
    error,
    refetch: fetchBlogs,
  };
}

// ==========================================================
// SINGLE ADMIN BLOG
// ==========================================================

export function useAdminBlog(id) {
  const [blog, setBlog] = useState(null);

  const [loading, setLoading] = useState(Boolean(id));

  const [error, setError] = useState(null);

  const fetchBlog = useCallback(async () => {
    if (!id) {
      setBlog(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.getBlog(id);

      setBlog(response?.data || null);
    } catch (err) {
      console.error("Failed to fetch admin blog:", err);

      setError(getErrorMessage(err, "Failed to load blog."));

      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  return {
    blog,
    loading,
    error,
    refetch: fetchBlog,
  };
}

// ==========================================================
// CREATE BLOG
// ==========================================================

export function useCreateAdminBlog() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const createBlog = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.createBlog(data);

      return response?.data;
    } catch (err) {
      console.error("Failed to create blog:", err);

      const message = getErrorMessage(err, "Failed to create blog.");

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createBlog,
    loading,
    error,
  };
}

// ==========================================================
// UPDATE BLOG
// ==========================================================

export function useUpdateAdminBlog() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const updateBlog = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.updateBlog(id, data);

      return response?.data;
    } catch (err) {
      console.error("Failed to update blog:", err);

      const message = getErrorMessage(err, "Failed to update blog.");

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateBlog,
    loading,
    error,
  };
}

// ==========================================================
// DELETE BLOG
// ==========================================================

export function useDeleteAdminBlog() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const deleteBlog = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.deleteBlog(id);

      return response?.data;
    } catch (err) {
      console.error("Failed to delete blog:", err);

      const message = getErrorMessage(err, "Failed to delete blog.");

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteBlog,
    loading,
    error,
  };
}

// ==========================================================
// ADMIN CATEGORIES
// ==========================================================

export function useAdminCategories(params = {}) {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.getCategories(params);

      setCategories(extractResults(response));
    } catch (err) {
      console.error("Failed to fetch admin categories:", err);

      setError(getErrorMessage(err, "Failed to load categories."));

      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}

// ==========================================================
// CREATE CATEGORY
// ==========================================================

export function useCreateAdminCategory() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const createCategory = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.createCategory(data);

      return response?.data;
    } catch (err) {
      const message = getErrorMessage(err, "Failed to create category.");

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createCategory,
    loading,
    error,
  };
}

// ==========================================================
// UPDATE CATEGORY
// ==========================================================

export function useUpdateAdminCategory() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const updateCategory = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.updateCategory(id, data);

      return response?.data;
    } catch (err) {
      const message = getErrorMessage(err, "Failed to update category.");

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateCategory,
    loading,
    error,
  };
}

// ==========================================================
// DELETE CATEGORY
// ==========================================================

export function useDeleteAdminCategory() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const deleteCategory = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.deleteCategory(id);

      return response?.data;
    } catch (err) {
      const message = getErrorMessage(err, "Failed to delete category.");

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteCategory,
    loading,
    error,
  };
}

// ==========================================================
// ADMIN TAGS
// ==========================================================

export function useAdminTags(params = {}) {
  const [tags, setTags] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.getTags(params);

      setTags(extractResults(response));
    } catch (err) {
      console.error("Failed to fetch admin tags:", err);

      setError(getErrorMessage(err, "Failed to load tags."));

      setTags([]);
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    refetch: fetchTags,
  };
}

// ==========================================================
// CREATE TAG
// ==========================================================

export function useCreateAdminTag() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const createTag = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.createTag(data);

      return response?.data;
    } catch (err) {
      const message = getErrorMessage(err, "Failed to create tag.");

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createTag,
    loading,
    error,
  };
}

// ==========================================================
// UPDATE TAG
// ==========================================================

export function useUpdateAdminTag() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const updateTag = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.updateTag(id, data);

      return response?.data;
    } catch (err) {
      const message = getErrorMessage(err, "Failed to update tag.");

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateTag,
    loading,
    error,
  };
}

// ==========================================================
// DELETE TAG
// ==========================================================

export function useDeleteAdminTag() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const deleteTag = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.deleteTag(id);

      return response?.data;
    } catch (err) {
      const message = getErrorMessage(err, "Failed to delete tag.");

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteTag,
    loading,
    error,
  };
}

// ==========================================================
// ADMIN BLOG MEDIA
// ==========================================================

export function useAdminBlogMedia(blogId) {
  const [media, setMedia] = useState([]);

  const [loading, setLoading] = useState(Boolean(blogId));

  const [error, setError] = useState(null);

  const fetchMedia = useCallback(async () => {
    if (!blogId) {
      setMedia([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.getMedia({
        blog: blogId,
      });

      setMedia(extractResults(response));
    } catch (err) {
      console.error("Failed to fetch blog media:", err);

      setError(getErrorMessage(err, "Failed to load media."));

      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return {
    media,
    loading,
    error,
    refetch: fetchMedia,
  };
}

// ==========================================================
// CREATE MEDIA
// ==========================================================

export function useCreateAdminBlogMedia() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const createMedia = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.createMedia(data);

      return response?.data;
    } catch (err) {
      const message = getErrorMessage(err, "Failed to create media.");

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createMedia,
    loading,
    error,
  };
}

// ==========================================================
// UPDATE MEDIA
// ==========================================================

export function useUpdateAdminBlogMedia() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const updateMedia = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.updateMedia(id, data);

      return response?.data;
    } catch (err) {
      const message = getErrorMessage(err, "Failed to update media.");

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateMedia,
    loading,
    error,
  };
}

// ==========================================================
// DELETE MEDIA
// ==========================================================

export function useDeleteAdminBlogMedia() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const deleteMedia = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminBlogApi.deleteMedia(id);

      return response?.data;
    } catch (err) {
      const message = getErrorMessage(err, "Failed to delete media.");

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteMedia,
    loading,
    error,
  };
}
