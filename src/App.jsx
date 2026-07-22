// App.jsx or Routes.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import BlogDashboard from "./components/admin/BlogDashboard";
import BlogPostsList from "./components/admin/BlogPostsList";
import BlogPostForm from "./components/admin/BlogPostForm";
import BlogCategories from "./components/admin/BlogCategories";
import BlogTags from "./components/admin/BlogTags";
import UserManagement from "./components/admin/UserManagement";
import LoginPage from "./pages/login";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* ✅ Admin Dashboard Layout with Sidebar */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        }
      >
        {/* ✅ ALL dashboard routes MUST be nested here */}
        <Route index element={<Navigate to="/dashboard/blog" replace />} />

        {/* User Management */}
        <Route path="users" element={<UserManagement />} />

        {/* Blog Routes - NESTED inside dashboard */}
        <Route path="blog" element={<BlogDashboard />} />
        <Route path="blog/posts" element={<BlogPostsList />} />
        <Route path="blog/new" element={<BlogPostForm />} />
        <Route path="blog/edit/:id" element={<BlogPostForm />} />
        <Route path="blog/categories" element={<BlogCategories />} />
        <Route path="blog/tags" element={<BlogTags />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
  
export default App;