import { useMemo, useState } from "react";

import BlogMediaManager from "../components/BlogMediaManager";

import {
  useAdminBlogs,
  useAdminCategories,
  useAdminTags,
  useCreateAdminBlog,
  useUpdateAdminBlog,
  useDeleteAdminBlog,
  useCreateAdminCategory,
  useDeleteAdminCategory,
  useCreateAdminTag,
  useDeleteAdminTag,
} from "../hooks/useAdminBlog";

// ==========================================================
// HELPERS
// ==========================================================

const getImageUrl = (blog) => {
  return (
    blog?.featured_image_url ||
    blog?.featured_image ||
    blog?.image ||
    "https://placehold.co/800x500?text=Blog+Image"
  );
};

const getBlogId = (blog) => {
  return blog?.id || blog?.uuid || blog?.pk || null;
};

const getCategoryName = (category) => {
  if (!category) {
    return "Uncategorized";
  }

  if (typeof category === "string") {
    return category;
  }

  return category?.name || category?.title || "Uncategorized";
};

const getTagName = (tag) => {
  if (!tag) {
    return "";
  }

  if (typeof tag === "string") {
    return tag;
  }

  return tag?.name || tag?.title || "";
};

// ==========================================================
// EMPTY BLOG FORM
// ==========================================================

const initialBlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  tags: [],
  is_featured: false,
  status: "published",
  featured_image: null,
};

// ==========================================================
// MAIN COMPONENT
// ==========================================================

export default function AdminBlog() {
  const [activeTab, setActiveTab] = useState("blogs");

  const [searchQuery, setSearchQuery] = useState("");

  const [blogModalOpen, setBlogModalOpen] = useState(false);

  const [editingBlog, setEditingBlog] = useState(null);

  const [blogForm, setBlogForm] = useState(initialBlogForm);

  const [categoryName, setCategoryName] = useState("");

  const [tagName, setTagName] = useState("");

  const [selectedMediaBlogId, setSelectedMediaBlogId] = useState("");

  // ==========================================================
  // API HOOKS
  // ==========================================================

  const {
    blogs,
    loading: blogsLoading,
    error: blogsError,
    refetch: refetchBlogs,
  } = useAdminBlogs();

  const { createBlog, loading: createLoading } = useCreateAdminBlog();

  const { updateBlog, loading: updateLoading } = useUpdateAdminBlog();

  const { deleteBlog, loading: deleteLoading } = useDeleteAdminBlog();

  const {
    categories,
    loading: categoriesLoading,
    refetch: refetchCategories,
  } = useAdminCategories();

  const { createCategory, loading: createCategoryLoading } =
    useCreateAdminCategory();

  const { deleteCategory, loading: deleteCategoryLoading } =
    useDeleteAdminCategory();

  const { tags, loading: tagsLoading, refetch: refetchTags } = useAdminTags();

  const { createTag, loading: createTagLoading } = useCreateAdminTag();

  const { deleteTag, loading: deleteTagLoading } = useDeleteAdminTag();

  // ==========================================================
  // NORMALIZE DATA
  // ==========================================================

  const blogList = useMemo(() => {
    if (Array.isArray(blogs)) {
      return blogs;
    }

    if (Array.isArray(blogs?.results)) {
      return blogs.results;
    }

    if (Array.isArray(blogs?.data)) {
      return blogs.data;
    }

    return [];
  }, [blogs]);

  const categoryList = useMemo(() => {
    if (Array.isArray(categories)) {
      return categories;
    }

    if (Array.isArray(categories?.results)) {
      return categories.results;
    }

    return [];
  }, [categories]);

  const tagList = useMemo(() => {
    if (Array.isArray(tags)) {
      return tags;
    }

    if (Array.isArray(tags?.results)) {
      return tags.results;
    }

    return [];
  }, [tags]);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredBlogs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return blogList;
    }

    return blogList.filter((blog) => {
      const title = blog?.title?.toLowerCase() || "";

      const slug = blog?.slug?.toLowerCase() || "";

      const category = getCategoryName(blog?.category).toLowerCase();

      return (
        title.includes(query) ||
        slug.includes(query) ||
        category.includes(query)
      );
    });
  }, [blogList, searchQuery]);

  // ==========================================================
  // SLUG GENERATOR
  // ==========================================================

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // ==========================================================
  // CREATE BLOG
  // ==========================================================

  const openCreateBlog = () => {
    setEditingBlog(null);

    setBlogForm({
      ...initialBlogForm,
      tags: [],
    });

    setBlogModalOpen(true);
  };

  // ==========================================================
  // EDIT BLOG
  // ==========================================================

  const openEditBlog = (blog) => {
    setEditingBlog(blog);

    const blogId = getBlogId(blog);

    const categoryId =
      blog?.category?.id ||
      blog?.category?.uuid ||
      blog?.category?.pk ||
      blog?.category ||
      "";

    const blogTags = Array.isArray(blog?.tags)
      ? blog.tags.map((tag) => tag?.id || tag?.uuid || tag?.pk || tag)
      : [];

    setBlogForm({
      title: blog?.title || "",
      slug: blog?.slug || "",
      excerpt: blog?.excerpt || "",
      content: blog?.content || "",
      category: categoryId,
      tags: blogTags,
      featured: Boolean(blog?.featured),
      is_published: blog?.is_published !== undefined ? blog.is_published : true,
      featured_image: null,
    });

    if (blogId) {
      setSelectedMediaBlogId(blogId);
    }

    setBlogModalOpen(true);
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeBlogModal = () => {
    setBlogModalOpen(false);
    setEditingBlog(null);

    setBlogForm({
      ...initialBlogForm,
      tags: [],
    });
  };

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleBlogChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "title") {
      setBlogForm((previous) => ({
        ...previous,
        title: value,
        slug: editingBlog ? previous.slug : generateSlug(value),
      }));

      return;
    }

    setBlogForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================================
  // TAG TOGGLE
  // ==========================================================

  const toggleTag = (tagId) => {
    setBlogForm((previous) => {
      const exists = previous.tags.includes(tagId);

      return {
        ...previous,
        tags: exists
          ? previous.tags.filter((id) => id !== tagId)
          : [...previous.tags, tagId],
      };
    });
  };

  // ==========================================================
  // SAVE BLOG
  // ==========================================================

  const handleBlogSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // ==========================================
      // CONTENT
      // ==========================================

      formData.append("title", blogForm.title);

      formData.append("excerpt", blogForm.excerpt);

      formData.append("content", blogForm.content);

      // ==========================================
      // CATEGORY
      // ==========================================

      if (blogForm.category) {
        formData.append("category", blogForm.category);
      }

      // ==========================================
      // TAGS
      // ==========================================

      blogForm.tags.forEach((tag) => {
        formData.append("tags", tag);
      });

      // ==========================================
      // OPTIONS
      // ==========================================

      formData.append("is_featured", String(Boolean(blogForm.is_featured)));

      // ==========================================
      // IMAGE
      // ==========================================

      if (blogForm.featured_image instanceof File) {
        formData.append("featured_image", blogForm.featured_image);
      }

      // ==========================================
      // CREATE / UPDATE
      // ==========================================

      let savedBlog;

      if (editingBlog) {
        const blogId = getBlogId(editingBlog);

        savedBlog = await updateBlog(blogId, formData);
      } else {
        savedBlog = await createBlog(formData);
      }

      // ==========================================
      // PUBLISH STATUS
      // ==========================================

      const blogId =
        savedBlog?.id || savedBlog?.data?.id || getBlogId(editingBlog);

      if (blogId && blogForm.status === "published") {
        await updateBlogStatus(blogId, "published");
      }

      closeBlogModal();

      await refetchBlogs();
    } catch (error) {
      console.error("Blog save error:", error);

      alert(error?.response?.data?.detail || "Unable to save blog.");
    }
  };

  // ==========================================================
  // DELETE BLOG
  // ==========================================================

  const handleDeleteBlog = async (blog) => {
    const blogId = getBlogId(blog);

    if (!blogId) {
      alert("Blog ID not found.");
      return;
    }

    const confirmed = window.confirm(`Delete "${blog.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteBlog(blogId);

      if (String(selectedMediaBlogId) === String(blogId)) {
        setSelectedMediaBlogId("");
      }

      await refetchBlogs();
    } catch (error) {
      console.error("Delete blog error:", error);

      alert(error?.response?.data?.detail || "Unable to delete blog.");
    }
  };

  // ==========================================================
  // CATEGORY
  // ==========================================================

  const handleCreateCategory = async (event) => {
    event.preventDefault();

    if (!categoryName.trim()) {
      return;
    }

    try {
      await createCategory({
        name: categoryName.trim(),
      });

      setCategoryName("");

      await refetchCategories();
    } catch (error) {
      console.error("Category create error:", error);

      alert("Unable to create category.");
    }
  };

  const handleDeleteCategory = async (category) => {
    const categoryId = category?.id || category?.uuid || category?.pk;

    if (!categoryId) {
      return;
    }

    const confirmed = window.confirm(
      `Delete category "${getCategoryName(category)}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCategory(categoryId);

      await refetchCategories();
    } catch (error) {
      console.error("Category delete error:", error);

      alert("Unable to delete category.");
    }
  };

  // ==========================================================
  // TAG
  // ==========================================================

  const handleCreateTag = async (event) => {
    event.preventDefault();

    if (!tagName.trim()) {
      return;
    }

    try {
      await createTag({
        name: tagName.trim(),
      });

      setTagName("");

      await refetchTags();
    } catch (error) {
      console.error("Tag create error:", error);

      alert("Unable to create tag.");
    }
  };

  const handleDeleteTag = async (tag) => {
    const tagId = tag?.id || tag?.uuid || tag?.pk;

    if (!tagId) {
      return;
    }

    const confirmed = window.confirm(`Delete tag "${getTagName(tag)}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteTag(tagId);

      await refetchTags();
    } catch (error) {
      console.error("Tag delete error:", error);

      alert("Unable to delete tag.");
    }
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const refreshEverything = async () => {
    await Promise.all([refetchBlogs(), refetchCategories(), refetchTags()]);
  };

  // ==========================================================
  // TABS
  // ==========================================================

  const tabs = [
    {
      id: "blogs",
      label: "📝 Blogs",
    },
    {
      id: "categories",
      label: "📁 Categories",
    },
    {
      id: "tags",
      label: "🏷️ Tags",
    },
    {
      id: "media",
      label: "🎥 Media",
    },
  ];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Blog Management
            </h1>

            <p className="text-xs text-gray-500">
              Manage articles, categories, tags and media
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={refreshEverything}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 text-sm"
            >
              ↻ Refresh
            </button>

            <button
              type="button"
              onClick={openCreateBlog}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 text-sm"
            >
              + Create Blog
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}

      <div className="p-6">
        {/* TABS */}

        <div className="flex flex-wrap gap-1 mb-6 bg-white rounded-xl border border-gray-200 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* BLOGS TAB */}

        {activeTab === "blogs" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full md:w-96 px-4 py-3 rounded-xl border border-gray-200"
              />

              <p className="text-sm text-gray-500">
                Total Blogs: <strong>{filteredBlogs.length}</strong>
              </p>
            </div>

            {blogsError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600">
                {blogsError}
              </div>
            )}

            {blogsLoading && <p className="text-gray-500">Loading blogs...</p>}

            {!blogsLoading && filteredBlogs.length === 0 && (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
                <h3 className="font-bold text-xl">No blogs found</h3>
              </div>
            )}

            {!blogsLoading && filteredBlogs.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4">Blog</th>

                      <th className="px-6 py-4">Category</th>

                      <th className="px-6 py-4">Status</th>

                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBlogs.map((blog) => (
                      <tr key={getBlogId(blog)} className="border-t">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={getImageUrl(blog)}
                              alt={blog.title}
                              className="w-16 h-12 rounded-lg object-cover"
                            />

                            <div>
                              <p className="font-bold">{blog.title}</p>

                              <p className="text-xs text-gray-400">
                                /{blog.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {getCategoryName(blog.category)}
                        </td>

                        <td className="px-6 py-4">
                          {blog.is_published ? "Published" : "Draft"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditBlog(blog)}
                              className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteBlog(blog)}
                              disabled={deleteLoading}
                              className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES TAB */}

        {activeTab === "categories" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border p-6 h-fit">
              <h2 className="text-lg font-black">Create Category</h2>

              <form onSubmit={handleCreateCategory} className="mt-5">
                <input
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="Category name"
                  className="w-full px-4 py-3 rounded-xl border"
                />

                <button
                  disabled={createCategoryLoading}
                  className="w-full mt-3 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  {createCategoryLoading ? "Creating..." : "Create Category"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border p-6">
              <h2 className="text-lg font-black mb-5">Categories</h2>

              {categoriesLoading ? (
                <p>Loading categories...</p>
              ) : (
                <div className="space-y-3">
                  {categoryList.map((category) => {
                    const categoryId =
                      category.id || category.uuid || category.pk;

                    return (
                      <div
                        key={categoryId}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <span className="font-bold">
                          {getCategoryName(category)}
                        </span>

                        <button
                          type="button"
                          disabled={deleteCategoryLoading}
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAGS TAB */}

        {activeTab === "tags" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border p-6 h-fit">
              <h2 className="text-lg font-black">Create Tag</h2>

              <form onSubmit={handleCreateTag} className="mt-5">
                <input
                  value={tagName}
                  onChange={(event) => setTagName(event.target.value)}
                  placeholder="Tag name"
                  className="w-full px-4 py-3 rounded-xl border"
                />

                <button
                  disabled={createTagLoading}
                  className="w-full mt-3 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  {createTagLoading ? "Creating..." : "Create Tag"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border p-6">
              <h2 className="text-lg font-black mb-5">Tags</h2>

              {tagsLoading ? (
                <p>Loading tags...</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {tagList.map((tag) => {
                    const tagId = tag.id || tag.uuid || tag.pk;

                    return (
                      <div
                        key={tagId}
                        className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-xl"
                      >
                        <span className="font-bold">#{getTagName(tag)}</span>

                        <button
                          type="button"
                          disabled={deleteTagLoading}
                          onClick={() => handleDeleteTag(tag)}
                          className="text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MEDIA TAB */}

        {activeTab === "media" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-black text-gray-900">Blog Media</h2>

              <p className="text-sm text-gray-500 mt-1">
                Select a blog, then upload images, videos or add YouTube/Vimeo
                links.
              </p>

              <select
                value={selectedMediaBlogId}
                onChange={(event) => setSelectedMediaBlogId(event.target.value)}
                className="w-full mt-5 px-4 py-3 rounded-xl border border-gray-200"
              >
                <option value="">Select Blog</option>

                {blogList.map((blog) => {
                  const blogId = getBlogId(blog);

                  return (
                    <option key={blogId} value={blogId}>
                      {blog.title}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedMediaBlogId ? (
              <BlogMediaManager blogId={selectedMediaBlogId} />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                <p className="font-bold text-yellow-800">
                  ⚠️ Select a blog first
                </p>

                <p className="text-sm text-yellow-700 mt-2">
                  After selecting a blog, you can upload images, videos, or add
                  YouTube/Vimeo links.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BLOG MODAL */}

      {blogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 md:p-8">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-black">
                    {editingBlog ? "Edit Blog" : "Create Blog"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeBlogModal}
                  className="w-10 h-10 rounded-full bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleBlogSubmit}
                className="p-6 md:p-8 space-y-6"
              >
                <div>
                  <label className="text-sm font-bold">Title</label>

                  <input
                    name="title"
                    value={blogForm.title}
                    onChange={handleBlogChange}
                    required
                    className="w-full mt-2 px-4 py-3 rounded-xl border"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Slug</label>

                  <input
                    name="slug"
                    value={blogForm.slug}
                    onChange={handleBlogChange}
                    required
                    className="w-full mt-2 px-4 py-3 rounded-xl border"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Category</label>

                  <select
                    name="category"
                    value={blogForm.category}
                    onChange={handleBlogChange}
                    className="w-full mt-2 px-4 py-3 rounded-xl border"
                  >
                    <option value="">Select category</option>

                    {categoryList.map((category) => {
                      const categoryId =
                        category.id || category.uuid || category.pk;

                      return (
                        <option key={categoryId} value={categoryId}>
                          {getCategoryName(category)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold">Tags</label>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {tagList.map((tag) => {
                      const tagId = tag.id || tag.uuid || tag.pk;

                      const selected = blogForm.tags.includes(tagId);

                      return (
                        <button
                          type="button"
                          key={tagId}
                          onClick={() => toggleTag(tagId)}
                          className={`px-4 py-2 rounded-full text-xs font-bold ${
                            selected
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          #{getTagName(tag)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold">Short Excerpt</label>

                  <textarea
                    name="excerpt"
                    value={blogForm.excerpt}
                    onChange={handleBlogChange}
                    rows="3"
                    className="w-full mt-2 px-4 py-3 rounded-xl border"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Content</label>

                  <textarea
                    name="content"
                    value={blogForm.content}
                    onChange={handleBlogChange}
                    required
                    rows="12"
                    className="w-full mt-2 px-4 py-3 rounded-xl border"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Featured Image</label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      setBlogForm((previous) => ({
                        ...previous,
                        featured_image: event.target.files?.[0] || null,
                      }));
                    }}
                    className="w-full mt-2 px-4 py-3 rounded-xl border"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={blogForm.featured}
                      onChange={handleBlogChange}
                    />
                    Featured Article
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      name="is_published"
                      checked={blogForm.is_published}
                      onChange={handleBlogChange}
                    />
                    Publish Blog
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={closeBlogModal}
                    className="px-6 py-3 rounded-xl border"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={createLoading || updateLoading}
                    className="px-7 py-3 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
                  >
                    {createLoading || updateLoading
                      ? "Saving..."
                      : editingBlog
                        ? "Update Blog"
                        : "Create Blog"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
