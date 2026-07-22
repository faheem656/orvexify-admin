import { useState, useEffect } from "react";
import {
  FileText,
  Tag,
  FolderOpen,
  Users,
  TrendingUp,
  Calendar,
  Eye,
  Clock,
  ArrowUp,
  ArrowDown,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./BlogDashboard.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const BlogDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch stats
      const statsRes = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();

      // Fetch recent posts
      const postsRes = await fetch(`${API_URL}/blog/posts?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const postsData = await postsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (postsData.success) setRecentPosts(postsData.data || []);
    } catch (error) {
      console.error("Error fetching blog stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={48} className={styles.spinning} />
        <p>Loading blog dashboard...</p>
      </div>
    );
  }

  const blogStats = stats?.blog || {
    publishedPosts: 0,
    totalCategories: 0,
    totalTags: 0,
    totalAuthors: 0,
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Blog Dashboard</h1>
          <p className={styles.subtitle}>Manage your blog content and analytics</p>
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

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#667eea" }}>
            <FileText size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{blogStats.publishedPosts}</span>
            <span className={styles.statLabel}>Published Posts</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#2ed573" }}>
            <FolderOpen size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{blogStats.totalCategories}</span>
            <span className={styles.statLabel}>Categories</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#f9ca24" }}>
            <Tag size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{blogStats.totalTags}</span>
            <span className={styles.statLabel}>Tags</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#ff6b6b" }}>
            <Users size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{blogStats.totalAuthors || 0}</span>
            <span className={styles.statLabel}>Authors</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.actionGrid}>
          <Link to="/dashboard/blog/new" className={styles.actionCard}>
            <div className={styles.actionIcon} style={{ background: "#667eea" }}>
              <FileText size={24} />
            </div>
            <span>Create Post</span>
          </Link>
          <Link to="/dashboard/blog/categories" className={styles.actionCard}>
            <div className={styles.actionIcon} style={{ background: "#2ed573" }}>
              <FolderOpen size={24} />
            </div>
            <span>Manage Categories</span>
          </Link>
          <Link to="/dashboard/blog/tags" className={styles.actionCard}>
            <div className={styles.actionIcon} style={{ background: "#f9ca24" }}>
              <Tag size={24} />
            </div>
            <span>Manage Tags</span>
          </Link>
          <Link to="/dashboard/blog/posts" className={styles.actionCard}>
            <div className={styles.actionIcon} style={{ background: "#ff6b6b" }}>
              <FileText size={24} />
            </div>
            <span>All Posts</span>
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Recent Posts</h3>
          <Link to="/dashboard/blog/posts" className={styles.viewAll}>
            View All →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} className={styles.emptyIcon} />
            <h4>No posts yet</h4>
            <p>Create your first blog post</p>
            <Link to="/dashboard/blog/new" className={styles.createBtnSmall}>
              Create Post
            </Link>
          </div>
        ) : (
          <div className={styles.postsList}>
            {recentPosts.map((post) => (
              <div key={post._id} className={styles.postItem}>
                <div className={styles.postInfo}>
                  <div className={styles.postMeta}>
                    <span className={styles.postStatus} data-status={post.status}>
                      {post.status}
                    </span>
                    <span className={styles.postDate}>
                      <Calendar size={14} />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span className={styles.postViews}>
                      <Eye size={14} />
                      {post.viewCount || 0} views
                    </span>
                  </div>
                  <h4 className={styles.postTitle}>{post.title}</h4>
                  <div className={styles.postCategories}>
                    {post.categories?.map((cat) => (
                      <span key={cat._id} className={styles.categoryTag}>
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.postActions}>
                  <Link to={`/dashboard/blog/edit/${post._id}`} className={styles.editBtn}>
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDashboard;