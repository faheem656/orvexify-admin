import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import styles from "./BlogCategories.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const BlogCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/blog/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch categories");

      const data = await response.json();
      setCategories(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/blog/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create category");
      }

      setSuccess("Category created successfully!");
      setTimeout(() => setSuccess(null), 3000);
      setIsCreating(false);
      setFormData({ name: "", description: "", color: "#3b82f6" });
      fetchCategories();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/blog/categories/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update category");
      }

      setSuccess("Category updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      setEditingId(null);
      setFormData({ name: "", description: "", color: "#3b82f6" });
      fetchCategories();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/blog/categories/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete category");
      }

      setSuccess("Category deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || "#3b82f6",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", color: "#3b82f6" });
  };

  const colorPresets = [
    "#3b82f6",
    "#ef4444",
    "#22c55e",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#6366f1",
  ];

  if (loading && categories.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={48} className={styles.spinning} />
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <FolderOpen size={24} /> Manage Categories
          </h1>
          <p className={styles.subtitle}>
            Organize your blog posts with categories
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={18} className={refreshing ? styles.spinning : ""} />
          </button>
          <button
            className={styles.createBtn}
            onClick={() => setIsCreating(true)}
          >
            <Plus size={18} />
            New Category
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

      {/* Create Form */}
      {isCreating && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h3>Create New Category</h3>
            <button
              className={styles.closeBtn}
              onClick={() => setIsCreating(false)}
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Category name"
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Color</label>
                <div className={styles.colorPicker}>
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`${styles.colorOption} ${
                        formData.color === color ? styles.active : ""
                      }`}
                      style={{ background: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Category description"
                className={styles.textarea}
                rows={2}
              />
            </div>
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn}>
                <Save size={16} />
                Create Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className={styles.listWrapper}>
        {categories.length === 0 ? (
          <div className={styles.emptyState}>
            <FolderOpen size={48} className={styles.emptyIcon} />
            <h3>No categories yet</h3>
            <p>Create your first category to organize your blog posts</p>
            <button
              className={styles.createBtnSmall}
              onClick={() => setIsCreating(true)}
            >
              <Plus size={16} />
              Create Category
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {categories.map((category) => (
              <div key={category._id} className={styles.categoryCard}>
                {editingId === category._id ? (
                  // Edit Form
                  <form onSubmit={handleUpdate} className={styles.editForm}>
                    <div className={styles.formGroup}>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={styles.input}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <div className={styles.colorPickerSmall}>
                        {colorPresets.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`${styles.colorOptionSmall} ${
                              formData.color === color ? styles.active : ""
                            }`}
                            style={{ background: color }}
                            onClick={() =>
                              setFormData({ ...formData, color })
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        className={styles.textarea}
                        rows={2}
                      />
                    </div>
                    <div className={styles.editActions}>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={cancelEdit}
                      >
                        <X size={16} />
                      </button>
                      <button type="submit" className={styles.saveBtn}>
                        <Save size={16} />
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  // Category Display
                  <>
                    <div className={styles.categoryInfo}>
                      <div
                        className={styles.colorDot}
                        style={{ background: category.color || "#3b82f6" }}
                      />
                      <div>
                        <h4 className={styles.categoryName}>{category.name}</h4>
                        {category.description && (
                          <p className={styles.categoryDescription}>
                            {category.description}
                          </p>
                        )}
                        <span className={styles.postCount}>
                          {category.postCount || 0} posts
                        </span>
                      </div>
                    </div>
                    <div className={styles.categoryActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => startEdit(category)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => {
                          setDeleteId(category._id);
                          setShowDeleteModal(true);
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} style={{ color: "#ff6b6b" }} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Delete Category</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.confirmAction}>
                <AlertCircle size={48} className={styles.warningIcon} />
                <h4>Are you sure?</h4>
                <p>
                  This category will be removed from all posts.
                  This action cannot be undone.
                </p>
                <div className={styles.modalActions}>
                  <button
                    className={styles.modalCancel}
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`${styles.modalConfirm} ${styles.danger}`}
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogCategories;