import { useCallback, useEffect, useMemo, useState } from "react";

import blogApi from "../api/blogApi";

// ==========================================================
// EXTRACT API RESULTS
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

  if (Array.isArray(data?.blogs)) {
    return data.blogs;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
};

// ==========================================================
// ERROR
// ==========================================================

const getErrorMessage = (error, fallback = "Something went wrong.") => {
  const data = error?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  if (data && typeof data === "object") {
    const firstKey = Object.keys(data)[0];

    if (firstKey) {
      const value = data[firstKey];

      if (Array.isArray(value) && value.length > 0) {
        return String(value[0]);
      }

      if (typeof value === "string") {
        return value;
      }
    }
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
};

// ==========================================================
// GET BLOGS
// ==========================================================

export function useBlogs(params = {}) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await blogApi.getBlogs(params);

      console.log("[PUBLIC BLOGS] response:", response?.data);

      const results = extractResults(response);

      console.log("[PUBLIC BLOGS] results:", results);

      setBlogs(results);
    } catch (err) {
      console.error("[PUBLIC BLOGS] failed:", err);

      setBlogs([]);

      setError(getErrorMessage(err, "Failed to load blogs."));
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
// FEATURED BLOGS
// ==========================================================

export function useFeaturedBlogs(params = {}) {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchFeaturedBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await blogApi.getFeaturedBlogs(params);

      const results = extractResults(response);

      setFeaturedBlogs(results);
    } catch (err) {
      console.error("Failed to fetch featured blogs:", err);

      setFeaturedBlogs([]);

      setError(getErrorMessage(err, "Failed to load featured blogs."));
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    fetchFeaturedBlogs();
  }, [fetchFeaturedBlogs]);

  return {
    featuredBlogs,
    loading,
    error,
    refetch: fetchFeaturedBlogs,
  };
}

// ==========================================================
// CATEGORIES
// ==========================================================

export function useBlogCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await blogApi.getCategories();

      setCategories(extractResults(response));
    } catch (err) {
      console.error("Failed to fetch categories:", err);

      setCategories([]);

      setError(getErrorMessage(err, "Failed to load categories."));
    } finally {
      setLoading(false);
    }
  }, []);

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
// TAGS
// ==========================================================

export function useBlogTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await blogApi.getTags();

      setTags(extractResults(response));
    } catch (err) {
      console.error("Failed to fetch tags:", err);

      setTags([]);

      setError(getErrorMessage(err, "Failed to load tags."));
    } finally {
      setLoading(false);
    }
  }, []);

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
// BLOG DETAIL
// ==========================================================

export function useBlogDetail(slug) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState(null);

  const fetchBlog = useCallback(async () => {
    if (!slug) {
      setBlog(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await blogApi.getBlogBySlug(slug);

      console.log("[PUBLIC BLOG DETAIL] response:", response?.data);

      setBlog(response?.data || null);
    } catch (err) {
      console.error("[PUBLIC BLOG DETAIL] failed:", err);

      setBlog(null);

      setError(getErrorMessage(err, "Article not found."));
    } finally {
      setLoading(false);
    }
  }, [slug]);

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
