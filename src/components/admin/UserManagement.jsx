import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Eye,
  RefreshCw,
} from "lucide-react";
import styles from "./UserManagement.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(search && { search }),
        ...(filterRole && { role: filterRole }),
        ...(filterStatus && { isActive: filterStatus === "active" }),
      });

      const response = await fetch(`${API_URL}/admin/users?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalUsers(data.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, filterRole, filterStatus]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(), fetchStats()]);
    setRefreshing(false);
  };

  // Handle user actions
  const handleAction = async (userId, action) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      let endpoint = "";
      let method = "POST";
      let successMessage = "";

      switch (action) {
        case "promote":
          endpoint = `${API_URL}/admin/promote/${userId}`;
          successMessage = "User promoted to admin successfully";
          break;
        case "demote":
          endpoint = `${API_URL}/admin/demote/${userId}`;
          successMessage = "User demoted to user successfully";
          break;
        case "activate":
          endpoint = `${API_URL}/admin/users/${userId}`;
          method = "PUT";
          successMessage = "User activated successfully";
          break;
        case "deactivate":
          endpoint = `${API_URL}/admin/users/${userId}`;
          method = "PUT";
          successMessage = "User deactivated successfully";
          break;
        default:
          return;
      }

      const body =
        action === "activate" || action === "deactivate"
          ? JSON.stringify({ isActive: action === "activate" })
          : undefined;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        ...(body && { body }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Action failed");
      }

      setSuccess(successMessage);
      setTimeout(() => setSuccess(null), 5000);
      await Promise.all([fetchUsers(), fetchStats()]);
      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/admin/users/${deleteUserId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Delete failed");
      }

      setSuccess("User deleted successfully");
      setTimeout(() => setSuccess(null), 5000);
      await Promise.all([fetchUsers(), fetchStats()]);
      setShowDeleteConfirm(false);
      setDeleteUserId(null);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get role badge
  const getRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return <span className={styles.badgeSuperAdmin}>Super Admin</span>;
      case "admin":
        return <span className={styles.badgeAdmin}>Admin</span>;
      default:
        return <span className={styles.badgeUser}>User</span>;
    }
  };

  // Get status badge
  const getStatusBadge = (isActive, isVerified) => {
    if (!isActive) {
      return <span className={styles.badgeInactive}>Inactive</span>;
    }
    if (!isVerified) {
      return <span className={styles.badgeUnverified}>Unverified</span>;
    }
    return <span className={styles.badgeActive}>Active</span>;
  };

  // Render loading
  if (loading && users.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={48} className={styles.spinning} />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>User Management</h1>
          <span className={styles.userCount}>{totalUsers} users</span>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.refreshBtn} onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={18} className={refreshing ? styles.spinning : ""} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#667eea" }}>
              <Users size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.users?.total || 0}</span>
              <span className={styles.statLabel}>Total Users</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#2ed573" }}>
              <UserCheck size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.users?.active || 0}</span>
              <span className={styles.statLabel}>Active</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#ff6b6b" }}>
              <UserX size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.users?.inactive || 0}</span>
              <span className={styles.statLabel}>Inactive</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#f9ca24" }}>
              <Shield size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.roles?.admins || 0}</span>
              <span className={styles.statLabel}>Admins</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
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

      {/* Users Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Joined</th>
              <th className={styles.actionsCol}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyState}>
                  <div className={styles.emptyContent}>
                    <Users size={48} className={styles.emptyIcon} />
                    <h3>No users found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatarSmall}>
                        {user.fullName?.[0] || user.email[0]}
                      </div>
                      <span className={styles.userName}>{user.fullName || "N/A"}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user.isActive, user.isVerified)}</td>
                  <td>
                    <span className={styles.planBadge}>
                      {user.plan || "free"}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => {
                          setSelectedUser(user);
                          setModalAction("view");
                          setShowModal(true);
                        }}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>

                      {user.role !== "super_admin" && (
                        <>
                          {user.role === "admin" ? (
                            <button
                              className={styles.actionBtn}
                              onClick={() => {
                                setSelectedUser(user);
                                setModalAction("demote");
                                setShowModal(true);
                              }}
                              title="Demote to user"
                            >
                              <UserX size={16} />
                            </button>
                          ) : (
                            <button
                              className={styles.actionBtn}
                              onClick={() => {
                                setSelectedUser(user);
                                setModalAction("promote");
                                setShowModal(true);
                              }}
                              title="Promote to admin"
                            >
                              <Shield size={16} />
                            </button>
                          )}

                          {user.isActive ? (
                            <button
                              className={styles.actionBtn}
                              onClick={() => {
                                setSelectedUser(user);
                                setModalAction("deactivate");
                                setShowModal(true);
                              }}
                              title="Deactivate"
                            >
                              <UserX size={16} style={{ color: "#ff6b6b" }} />
                            </button>
                          ) : (
                            <button
                              className={styles.actionBtn}
                              onClick={() => {
                                setSelectedUser(user);
                                setModalAction("activate");
                                setShowModal(true);
                              }}
                              title="Activate"
                            >
                              <UserCheck size={16} style={{ color: "#2ed573" }} />
                            </button>
                          )}

                          <button
                            className={styles.actionBtn}
                            onClick={() => {
                              setDeleteUserId(user._id);
                              setShowDeleteConfirm(true);
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} style={{ color: "#ff6b6b" }} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

      {/* Action Modal */}
      {showModal && selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                {modalAction === "view"
                  ? "User Details"
                  : `${modalAction.charAt(0).toUpperCase() + modalAction.slice(1)} User`}
              </h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {modalAction === "view" ? (
                <div className={styles.userDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Full Name</span>
                    <span>{selectedUser.fullName || "N/A"}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Email</span>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Role</span>
                    <span>{getRoleBadge(selectedUser.role)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status</span>
                    <span>{getStatusBadge(selectedUser.isActive, selectedUser.isVerified)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Plan</span>
                    <span className={styles.planBadge}>{selectedUser.plan || "free"}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Clinic</span>
                    <span>{selectedUser.clinicName || "N/A"}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Joined</span>
                    <span>{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Last Login</span>
                    <span>{formatDate(selectedUser.lastLoginAt)}</span>
                  </div>
                </div>
              ) : (
                <div className={styles.confirmAction}>
                  <AlertCircle size={48} className={styles.warningIcon} />
                  <h4>Are you sure?</h4>
                  <p>
                    You are about to {modalAction} user{" "}
                    <strong>{selectedUser.email}</strong>
                  </p>
                  <p className={styles.warningText}>
                    {modalAction === "deactivate" && "This user will lose access to the platform."}
                    {modalAction === "activate" && "This user will regain access to the platform."}
                    {modalAction === "promote" && "This user will get admin privileges."}
                    {modalAction === "demote" && "This user will lose admin privileges."}
                  </p>
                  <div className={styles.modalActions}>
                    <button
                      className={styles.modalCancel}
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className={`${styles.modalConfirm} ${
                        modalAction === "deactivate" || modalAction === "demote"
                          ? styles.danger
                          : ""
                      }`}
                      onClick={() => handleAction(selectedUser._id, modalAction)}
                    >
                      {modalAction.charAt(0).toUpperCase() + modalAction.slice(1)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Delete User</h3>
              <button className={styles.modalClose} onClick={() => setShowDeleteConfirm(false)}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.confirmAction}>
                <AlertCircle size={48} className={styles.warningIcon} />
                <h4>Permanently Delete User?</h4>
                <p>This action cannot be undone. All data associated with this user will be lost.</p>
                <div className={styles.modalActions}>
                  <button
                    className={styles.modalCancel}
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button className={`${styles.modalConfirm} ${styles.danger}`} onClick={handleDelete}>
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

export default UserManagement;