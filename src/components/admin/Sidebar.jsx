import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  BarChart3,
  MessageSquare,
  Shield,
  Menu,
  X,
  UserCog,
  Home,
  Plus,
  FolderOpen,
  Tag,
} from "lucide-react";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: "/dashboard/users",
      label: "User Management",
      icon: <Users size={20} />,
    },
    {
      path: "/dashboard/appointments",
      label: "Appointments",
      icon: <Calendar size={20} />,
    },
    {
      path: "/dashboard/analytics",
      label: "Analytics",
      icon: <BarChart3 size={20} />,
    },
      // ============ BLOG SECTION ============
  {
    path: "/dashboard/blog",
    label: "Blog",
    icon: <FileText size={20} />,
  },
  {
    path: "/dashboard/blog/posts",
    label: "All Posts",
    icon: <FileText size={20} />,
  },
  {
    path: "/dashboard/blog/new",
    label: "New Post",
    icon: <Plus size={20} />,
  },
  {
    path: "/dashboard/blog/categories",
    label: "Categories",
    icon: <FolderOpen size={20} />,
  },
  {
    path: "/dashboard/blog/tags",
    label: "Tags",
    icon: <Tag size={20} />,
  },

    {
      path: "/dashboard/settings",
      label: "Settings",
      icon: <Settings size={20} />,
    },
    
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button className={styles.mobileToggle} onClick={toggleMobile}>
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className={styles.overlay} onClick={toggleMobile} />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${
          mobileOpen ? styles.mobileOpen : ""
        }`}
      >
        {/* Logo */}
        <div className={styles.logoContainer}>
          <Link to="/dashboard" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Shield size={collapsed ? 24 : 28} />
            </div>
            {!collapsed && (
              <div className={styles.logoText}>
                <span className={styles.logoName}>Orvexify</span>
                <span className={styles.logoBadge}>Admin</span>
              </div>
            )}
          </Link>
          <button
            className={styles.collapseBtn}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {menuItems.map((item) => (
              <li key={item.path} className={styles.navItem}>
                <Link
                  to={item.path}
                  className={`${styles.navLink} ${
                    location.pathname === item.path ? styles.active : ""
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                  {location.pathname === item.path && (
                    <span className={styles.activeIndicator} />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          {/* User Profile */}
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              <UserCog size={collapsed ? 20 : 24} />
            </div>
            {!collapsed && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>Admin</span>
                <span className={styles.userRole}>Super Admin</span>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;