import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  return (
    <div className={styles.dashboard}>
      <Sidebar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;