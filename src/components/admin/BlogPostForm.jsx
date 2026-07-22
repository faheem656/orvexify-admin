import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
// ✅ Import from react-quill-new instead of react-quill
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  Save,
  X,
  Tag,
  FolderOpen,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
} from "lucide-react";
import styles from "./BlogPostForm.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ✅ Quill Editor Modules Configuration
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "list" }, { list: "list" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "blockquote",
  "code-block",
  "list",
  "list",
  "list",
  "indent",
  "align",
  "link",
  "image",
  "video",
];

const BlogPostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imagePublicId, setImagePublicId] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    status: "draft",
    categories: [],
    tags: [],
    featuredImage: "",
    featuredImageAlt: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    isFeatured: false,
    isSticky: false,
    allowComments: true,
    showInSitemap: true,
    scheduledPublishAt: "",
    faqs: [{ question: "", answer: "", position: 0 }],
  });

  const [showSEO, setShowSEO] = useState(false);
  const [showFAQs, setShowFAQs] = useState(false);

  // Fetch categories and tags
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch(`${API_URL}/blog/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/blog/tags`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const categoriesData = await categoriesRes.json();
        const tagsData = await tagsRes.json();

        if (categoriesData.success) setCategories(categoriesData.data || []);
        if (tagsData.success) setTags(tagsData.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    // Fetch post if editing
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/blog/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch post");

      const data = await response.json();
      const post = data.data;

      setFormData({
        title: post.title || "",
        content: post.content || "",
        excerpt: post.excerpt || "",
        status: post.status || "draft",
        categories: post.categories?.map((c) => c._id) || [],
        tags: post.tags?.map((t) => t._id) || [],
        featuredImage: post.featuredImage || "",
        featuredImageAlt: post.featuredImageAlt || "",
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        metaKeywords: post.metaKeywords || [],
        isFeatured: post.isFeatured || false,
        isSticky: post.isSticky || false,
        allowComments:
          post.allowComments !== undefined ? post.allowComments : true,
        showInSitemap:
          post.showInSitemap !== undefined ? post.showInSitemap : true,
        scheduledPublishAt: post.scheduledPublishAt
          ? new Date(post.scheduledPublishAt).toISOString().slice(0, 16)
          : "",
        faqs: post.faqs?.length
          ? post.faqs
          : [{ question: "", answer: "", position: 0 }],
      });

      // Set image preview and extract public ID
      if (post.featuredImage) {
        let imageUrl = post.featuredImage;

        // If it's a relative path, convert to absolute URL
        if (!imageUrl.startsWith("http")) {
          const baseUrl = API_URL.replace("/api", "");
          imageUrl = imageUrl.startsWith("/")
            ? `${baseUrl}${imageUrl}`
            : `${baseUrl}/${imageUrl}`;
        }

        setImagePreview(imageUrl);
        setImageError(false);

        // Extract public ID from Cloudinary URL
        if (
          post.featuredImage.includes("cloudinary") ||
          post.featuredImage.includes("res.cloudinary.com")
        ) {
          let publicId = null;

          let match = post.featuredImage.match(/\/upload\/(?:v\d+\/)?(.+?)\./);
          if (match) {
            publicId = match[1];
          }

          if (!publicId) {
            match = post.featuredImage.match(/\/upload\/(.+?)\./);
            if (match) {
              publicId = match[1];
            }
          }

          if (!publicId) {
            const parts = post.featuredImage.split("/");
            const lastPart = parts[parts.length - 1];
            publicId = lastPart.split(".")[0];
          }

          console.log("📌 Extracted publicId from URL:", publicId);
          setImagePublicId(publicId);
        }
      } else {
        setImagePreview(null);
        setImagePublicId("");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Quill Content Change
  const handleContentChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }));
  };

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageError(false);
    };
    reader.readAsDataURL(file);

    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/blog/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();
      if (data.success) {
        const imageUrl = data.data.url;
        const publicId = data.data.publicId;

        console.log("✅ Upload response:", { imageUrl, publicId });

        setFormData((prev) => ({
          ...prev,
          featuredImage: imageUrl,
        }));
        setImagePreview(imageUrl);
        setImagePublicId(publicId);
        setImageError(false);
        setSuccess("✅ Image uploaded successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "Failed to upload image");
      setTimeout(() => setError(null), 5000);
      if (formData.featuredImage) {
        setImagePreview(formData.featuredImage);
      } else {
        setImagePreview(null);
      }
    } finally {
      setUploading(false);
    }
  };

  // Remove Image with Cloudinary deletion
  const removeImage = async () => {
    if (!formData.featuredImage) return;

    console.log("📌 Removing image");
    console.log("📌 Image URL:", formData.featuredImage);
    console.log("📌 Public ID:", imagePublicId);

    // If image is on Cloudinary, delete it
    if (imagePublicId) {
      try {
        const token = localStorage.getItem("token");
        const encodedPublicId = encodeURIComponent(imagePublicId);

        console.log(
          "📌 Deleting from Cloudinary with publicId:",
          encodedPublicId,
        );

        const response = await fetch(
          `${API_URL}/blog/delete-image/${encodedPublicId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await response.json();
        console.log("📌 Delete response:", data);

        if (!response.ok) {
          console.error("Delete failed:", data.message);
        } else {
          setSuccess("🗑️ Image deleted from Cloudinary!");
          setTimeout(() => setSuccess(null), 3000);
        }
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    } else {
      console.warn("⚠️ No publicId found, skipping Cloudinary deletion");
    }

    // Always remove from UI and form data
    setFormData((prev) => ({ ...prev, featuredImage: "" }));
    setImagePreview(null);
    setImageError(false);
    setImagePublicId("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.split(",").map((item) => item.trim()),
    }));
  };

  const handleFAQChange = (index, field, value) => {
    const updatedFAQs = [...formData.faqs];
    updatedFAQs[index][field] = value;
    setFormData((prev) => ({ ...prev, faqs: updatedFAQs }));
  };

  const addFAQ = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        { question: "", answer: "", position: prev.faqs.length },
      ],
    }));
  };

  const removeFAQ = (index) => {
    if (formData.faqs.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  // Handle image load success
  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const url = id ? `${API_URL}/blog/posts/${id}` : `${API_URL}/blog/posts`;
      const method = id ? "PUT" : "POST";

      // Prepare data
      const submitData = {
        ...formData,
        scheduledPublishAt: formData.scheduledPublishAt || null,
        faqs: formData.faqs.filter((f) => f.question.trim() && f.answer.trim()),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to save post");
      }

      setSuccess(
        id ? "✅ Post updated successfully!" : "✅ Post created successfully!",
      );
      setTimeout(() => {
        navigate("/dashboard/blog/posts");
      }, 1500);
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={48} className={styles.spinning} />
        <p>Loading post...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {id ? "Edit Post" : "Create New Post"}
          </h1>
          <p className={styles.subtitle}>
            {id ? "Update your blog post" : "Write a new blog post"}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate("/dashboard/blog/posts")}
          >
            <X size={18} />
            Cancel
          </button>
          <button
            type="submit"
            form="postForm"
            className={styles.saveBtn}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={18} className={styles.spinning} />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save Post"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className={styles.alertError}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className={styles.alertSuccess}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <form id="postForm" onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Main Column */}
          <div className={styles.mainColumn}>
            {/* Title */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Title <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter post title"
                className={styles.input}
                required
              />
            </div>

            {/* ✅ Content with Quill Editor */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Content <span className={styles.required}>*</span>
              </label>
              <div className={styles.editorWrapper}>
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Write your blog post content here..."
                  className={styles.quillEditor}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Excerpt <span className={styles.required}>*</span>
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Brief summary of your post (max 200 characters)"
                className={styles.textarea}
                rows={3}
                maxLength={200}
                required
              />
              <span className={styles.charCount}>
                {formData.excerpt.length}/200
              </span>
            </div>

            {/* FAQs Section */}
            <div className={styles.section}>
              <button
                type="button"
                className={styles.sectionToggle}
                onClick={() => setShowFAQs(!showFAQs)}
              >
                <span>FAQs</span>
                {showFAQs ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {showFAQs && (
                <div className={styles.sectionContent}>
                  {formData.faqs.map((faq, index) => (
                    <div key={index} className={styles.faqItem}>
                      <div className={styles.faqHeader}>
                        <span className={styles.faqNumber}>
                          FAQ #{index + 1}
                        </span>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeFAQ(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className={styles.faqFields}>
                        <input
                          type="text"
                          placeholder="Question"
                          value={faq.question}
                          onChange={(e) =>
                            handleFAQChange(index, "question", e.target.value)
                          }
                          className={styles.input}
                        />
                        <textarea
                          placeholder="Answer"
                          value={faq.answer}
                          onChange={(e) =>
                            handleFAQChange(index, "answer", e.target.value)
                          }
                          className={styles.textarea}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={addFAQ}
                  >
                    <Plus size={16} />
                    Add FAQ
                  </button>
                </div>
              )}
            </div>

            {/* SEO Section */}
            <div className={styles.section}>
              <button
                type="button"
                className={styles.sectionToggle}
                onClick={() => setShowSEO(!showSEO)}
              >
                <span>SEO Settings</span>
                {showSEO ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {showSEO && (
                <div className={styles.sectionContent}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Meta Title</label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleChange}
                      placeholder="SEO title (default: post title)"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Meta Description</label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleChange}
                      placeholder="SEO description (max 160 characters)"
                      className={styles.textarea}
                      rows={2}
                      maxLength={160}
                    />
                    <span className={styles.charCount}>
                      {formData.metaDescription.length}/160
                    </span>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Meta Keywords</label>
                    <input
                      type="text"
                      name="metaKeywords"
                      value={formData.metaKeywords.join(", ")}
                      onChange={handleArrayChange}
                      placeholder="Enter keywords separated by commas"
                      className={styles.input}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            {/* Featured Image */}
            <div className={styles.card}>
              <h4 className={styles.cardTitle}>Featured Image</h4>
              
              {imagePreview && !imageError ? (
                <div className={styles.imagePreviewContainer}>
                  <div className={styles.imagePreview}>
                    <img
                      src={imagePreview}
                      alt={formData.featuredImageAlt || "Featured"}
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    
                    <button
                      type="button"
                      className={styles.removeImageBtn}
                      onClick={removeImage}
                      disabled={uploading}
                      title="Remove image"
                    >
                      <X size={18} />
                    </button>
                    
                    {uploading && (
                      <div className={styles.uploadingOverlay}>
                        <Loader2 size={24} className={styles.spinning} />
                        <span>Uploading...</span>
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                </div>
              ) : (
                <div
                  className={styles.imageUpload}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={styles.uploadPlaceholder}>
                    {imageError ? (
                      <>
                        <AlertCircle size={32} style={{ color: "#ff6b6b" }} />
                        <span style={{ color: "#ff6b6b" }}>
                          Image not found
                        </span>
                        <span className={styles.uploadHint}>
                          Click to upload a new image
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload size={32} />
                        <span>Click to upload</span>
                        <span className={styles.uploadHint}>
                          JPG, PNG, WEBP (Max 5MB)
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className={styles.uploadingOverlay}>
                      <Loader2 size={24} className={styles.spinning} />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
              )}
              
              <input
                type="text"
                name="featuredImageAlt"
                value={formData.featuredImageAlt}
                onChange={handleChange}
                placeholder="Image alt text (SEO)"
                className={styles.input}
                style={{ marginTop: "8px" }}
              />
              
              {formData.featuredImage && !imageError && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "#6c757d",
                    wordBreak: "break-all",
                    backgroundColor: "#f8f9fa",
                    padding: "8px",
                    borderRadius: "4px",
                  }}
                >
                  <strong>URL:</strong> {formData.featuredImage}
                </div>
              )}
              
              {imageError && (
                <div
                  style={{
                    marginTop: "8px",
                    color: "#dc3545",
                    fontSize: "14px",
                  }}
                >
                  <AlertCircle size={14} /> Image could not be loaded. Please
                  upload again.
                </div>
              )}
            </div>

            {/* Status */}
            <div className={styles.card}>
              <h4 className={styles.cardTitle}>Status</h4>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>

              {formData.status === "scheduled" && (
                <div style={{ marginTop: "8px" }}>
                  <label className={styles.label}>Schedule Date</label>
                  <input
                    type="datetime-local"
                    name="scheduledPublishAt"
                    value={formData.scheduledPublishAt}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              )}
            </div>

            {/* Categories */}
            <div className={styles.card}>
              <h4 className={styles.cardTitle}>
                <FolderOpen size={16} /> Categories
              </h4>
              <div className={styles.checkboxGroup}>
                {categories.map((category) => (
                  <label key={category._id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      value={category._id}
                      checked={formData.categories.includes(category._id)}
                      onChange={(e) => {
                        const { value, checked } = e.target;
                        setFormData((prev) => ({
                          ...prev,
                          categories: checked
                            ? [...prev.categories, value]
                            : prev.categories.filter((c) => c !== value),
                        }));
                      }}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className={styles.card}>
              <h4 className={styles.cardTitle}>
                <Tag size={16} /> Tags
              </h4>
              <div className={styles.checkboxGroup}>
                {tags.map((tag) => (
                  <label key={tag._id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      value={tag._id}
                      checked={formData.tags.includes(tag._id)}
                      onChange={(e) => {
                        const { value, checked } = e.target;
                        setFormData((prev) => ({
                          ...prev,
                          tags: checked
                            ? [...prev.tags, value]
                            : prev.tags.filter((t) => t !== value),
                        }));
                      }}
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className={styles.card}>
              <h4 className={styles.cardTitle}>Settings</h4>
              <div className={styles.toggleGroup}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                  />
                  <span>Featured Post</span>
                </label>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    name="isSticky"
                    checked={formData.isSticky}
                    onChange={handleChange}
                  />
                  <span>Sticky Post</span>
                </label>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    name="allowComments"
                    checked={formData.allowComments}
                    onChange={handleChange}
                  />
                  <span>Allow Comments</span>
                </label>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    name="showInSitemap"
                    checked={formData.showInSitemap}
                    onChange={handleChange}
                  />
                  <span>Show in Sitemap</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogPostForm;