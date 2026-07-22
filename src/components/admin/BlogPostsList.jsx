import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreVertical,
} from "lucide-react";
import styles from "./BlogPostsList.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const BlogPostsList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(search && { search }),
        ...(filterStatus && { status: filterStatus }),
      });

      const response = await fetch(
        `${API_URL}/blog/posts?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch posts");

      const data = await response.json();
      setPosts(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalPosts(data.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, search, filterStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/blog/posts/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete post");

      setSuccess("Post deleted successfully");
      setTimeout(() => setSuccess(null), 5000);
      setShowDeleteModal(false);
      fetchPosts();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      published: { bg: "#d4edda", color: "#155724" },
      draft: { bg: "#fff3cd", color: "#856404" },
      scheduled: { bg: "#cce5ff", color: "#004085" },
      archived: { bg: "#f8d7da", color: "#721c24" },
    };
    const style = colors[status] || colors.draft;
    return (
      <span
        className={styles.statusBadge}
        style={{ background: style.bg, color: style.color }}
      >
        {status}
      </span>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={48} className={styles.spinning} />
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Blog Posts</h1>
          <span className={styles.postCount}>{totalPosts} posts</span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={18} className={refreshing ? styles.spinning : ""} />
          </button>
          <Link to="/dashboard/blog/new" className={styles.createBtn}>
            <Plus size={18} />
            New Post
          </Link>
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

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search posts by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.filterSelect}
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className={styles.tableWrapper}>
        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} className={styles.emptyIcon} />
            <h3>No posts found</h3>
            <p>Create your first blog post</p>
            <Link to="/dashboard/blog/new" className={styles.createBtnSmall}>
              Create Post
            </Link>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Categories</th>
                <th>Views</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id}>
                  <td>
                    <div className={styles.titleCell}>
                      <span className={styles.postTitle}>{post.title}</span>
                      {post.isFeatured && (
                        <span className={styles.featuredBadge}>Featured</span>
                      )}
                    </div>
                  </td>
                  <td>{getStatusBadge(post.status)}</td>
                  <td>
                    <div className={styles.categoriesCell}>
                      {post.categories?.slice(0, 2).map((cat) => (
                        <span key={cat._id} className={styles.categoryTag}>
                          {cat.name}
                        </span>
                      ))}
                      {post.categories?.length > 2 && (
                        <span className={styles.categoryTag}>
                          +{post.categories.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{post.viewCount || 0}</td>
                  <td>{formatDate(post.createdAt)}</td>
                  <td>
                    <div className={styles.actions}>
                      <Link
                        to={`/dashboard/blog/edit/${post._id}`}
                        className={styles.actionBtn}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        className={styles.actionBtn}
                        title="Delete"
                        onClick={() => {
                          setDeleteId(post._id);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 size={16} style={{ color: "#ff6b6b" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={styles.pageBtn}
          >
            <ChevronLeft size={18} />
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={styles.pageBtn}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Delete Post</h3>
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
                <p>This action cannot be undone. This post will be permanently deleted.</p>
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

export default BlogPostsList;