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
  Tag,
  RefreshCw,
} from "lucide-react";
import styles from "./BlogTags.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const BlogTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [tagName, setTagName] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/blog/tags`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch tags");

      const data = await response.json();
      setTags(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTags();
    setRefreshing(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/blog/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: tagName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create tag");
      }

      setSuccess("Tag created successfully!");
      setTimeout(() => setSuccess(null), 3000);
      setIsCreating(false);
      setTagName("");
      fetchTags();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/blog/tags/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: tagName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update tag");
      }

      setSuccess("Tag updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      setEditingId(null);
      setTagName("");
      fetchTags();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/blog/tags/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete tag");
      }

      setSuccess("Tag deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchTags();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const startEdit = (tag) => {
    setEditingId(tag._id);
    setTagName(tag.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTagName("");
  };

  if (loading && tags.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={48} className={styles.spinning} />
        <p>Loading tags...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <Tag size={24} /> Manage Tags
          </h1>
          <p className={styles.subtitle}>
            Organize your blog posts with tags
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
            New Tag
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
            <h3>Create New Tag</h3>
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
                <label className={styles.label}>Tag Name *</label>
                <input
                  type="text"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Enter tag name"
                  className={styles.input}
                  required
                  autoFocus
                />
              </div>
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
                Create Tag
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tags List */}
      <div className={styles.listWrapper}>
        {tags.length === 0 ? (
          <div className={styles.emptyState}>
            <Tag size={48} className={styles.emptyIcon} />
            <h3>No tags yet</h3>
            <p>Create your first tag to organize your blog posts</p>
            <button
              className={styles.createBtnSmall}
              onClick={() => setIsCreating(true)}
            >
              <Plus size={16} />
              Create Tag
            </button>
          </div>
        ) : (
          <div className={styles.tagsGrid}>
            {tags.map((tag) => (
              <div key={tag._id} className={styles.tagCard}>
                {editingId === tag._id ? (
                  <form onSubmit={handleUpdate} className={styles.editForm}>
                    <input
                      type="text"
                      value={tagName}
                      onChange={(e) => setTagName(e.target.value)}
                      className={styles.input}
                      required
                      autoFocus
                    />
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
                  <>
                    <div className={styles.tagInfo}>
                      <span className={styles.tagName}>#{tag.name}</span>
                      <span className={styles.postCount}>
                        {tag.postCount || 0} posts
                      </span>
                    </div>
                    <div className={styles.tagActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => startEdit(tag)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => {
                          setDeleteId(tag._id);
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
              <h3>Delete Tag</h3>
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
                  This tag will be removed from all posts.
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

export default BlogTags;