// src/pages/Login.jsx — Admin Login (React JSX)

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Smartphone,
  AlertCircle,
  CheckCircle,
  Loader2,
  UserCog,
} from "lucide-react";
import styles from "./Login.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [isBackupMode, setIsBackupMode] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryStatus, setRecoveryStatus] = useState(null);
  const [twoFactorDisabled, setTwoFactorDisabled] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});

  // ✅ Check if already logged in
useEffect(() => {
  // DON'T auto-redirect on page load
  // Only redirect if user explicitly logged in
  if (!authLoading && user && sessionStorage.getItem('justLoggedIn') === 'true') {
    if (user.role === "admin" || user.role === "super_admin") {
      navigate("/dashboard");
    } else {
      window.location.href = "https://orvexify.com";
    }
    sessionStorage.removeItem('justLoggedIn');
  }
}, [user, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setRedirecting(false);

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        email: formData.email,
        password: formData.password,
      };

      if (requiresTwoFactor) {
        if (isBackupMode) {
          requestBody.backupCode = twoFactorToken;
        } else {
          requestBody.twoFactorToken = twoFactorToken;
        }
      }

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setRecoveryEmail(formData.email);
        setIsLoading(false);
        return;
      }

      if (data.twoFactorDisabled) {
        setTwoFactorDisabled(true);
        setTimeout(() => setTwoFactorDisabled(false), 5000);
      }

      if (response.ok && data.success) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        // ✅ Check role — admin/super_admin allowed
        if (data.user?.role === "admin" || data.user?.role === "super_admin") {
          login(data.user, data.token);
          navigate("/dashboard");
        } else {
          setRedirecting(true);
          setApiError("Admin access only. Redirecting...");
          setTimeout(() => {
            window.location.href = "https://orvexify.com";
          }, 1500);
        }
      } else {
        if (data.message === "Please verify your email first") {
          // Redirect to verification
          window.location.href = `/verify-email?email=${encodeURIComponent(formData.email)}`;
        } else {
          setApiError(data.message || "Login failed. Please check your credentials.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setApiError("Network error. Please make sure the server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoveryRequest = async () => {
    setRecoveryStatus("loading");

    try {
      const response = await fetch(`${API_URL}/auth/2fa/recovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setRecoveryStatus("success");
        setTimeout(() => {
          setShowRecoveryModal(false);
          setRecoveryStatus(null);
        }, 3000);
      } else {
        setRecoveryStatus("error");
        setApiError(data.message);
      }
    } catch (error) {
      setRecoveryStatus("error");
      setApiError("Network error. Please try again.");
    }
  };

  // ✅ Redirecting state
  if (redirecting) {
    return (
      <div className={styles.redirectContainer}>
        <div className={styles.redirectCard}>
          <div className={styles.redirectIcon}>🔒</div>
          <h2>Admin Access Only</h2>
          <p>This area is restricted to administrators.</p>
          <p className={styles.redirectSubtext}>Redirecting you to the main site...</p>
          <div className={styles.redirectSpinner}></div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={48} className={styles.spinning} />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ============ LEFT SECTION ============ */}
      <div className={styles.leftSection}>
        <div className={styles.formWrapper}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoGradient}>Orvexify</span>
            <span className={styles.logoBadge}>ADMIN</span>
          </Link>

          <div className={styles.header}>
            <h1 className={styles.title}>
              {requiresTwoFactor ? "Two-Factor Authentication" : "Admin Access"}
            </h1>
            <p className={styles.subtitle}>
              {requiresTwoFactor
                ? isBackupMode
                  ? "Enter a backup code to regain access"
                  : "Enter the 6-digit code from your authenticator app"
                : "Secure login for clinic administrators"}
            </p>
          </div>

          {apiError && (
            <div className={styles.apiError}>
              <AlertCircle size={18} />
              <span>{apiError}</span>
            </div>
          )}

          {twoFactorDisabled && (
            <div className={styles.twoFactorDisabledAlert}>
              <CheckCircle size={18} />
              <div>
                <strong>2FA Disabled</strong>
                <p>You logged in using a backup code. Two-factor authentication has been turned off.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {!requiresTwoFactor ? (
              <>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Email Address</label>
                  <div className={styles.inputWrapper}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@clinic.com"
                      className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                    />
                  </div>
                  {errors.email && (
                    <span className={styles.errorMsg}>{errors.email}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock size={18} className={styles.inputIcon} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.eyeBtn}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className={styles.errorMsg}>{errors.password}</span>
                  )}
                </div>

                <div className={styles.options}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    />
                    <span>Remember me</span>
                  </label>
                  {/* <Link to="/forgot-password" className={styles.forgotLink}>
                    Forgot password?
                  </Link> */}
                </div>
              </>
            ) : (
              <div className={styles.twoFactorBox}>
                <div className={styles.twoFactorIcon}>
                  {isBackupMode ? <Shield size={40} /> : <Smartphone size={40} />}
                </div>

                <div className={styles.twoFactorInputGroup}>
                  <label className={styles.label}>
                    {isBackupMode ? "Backup Code" : "Verification Code"}
                  </label>
                  <input
                    type="text"
                    value={twoFactorToken}
                    onChange={(e) => setTwoFactorToken(e.target.value)}
                    placeholder={isBackupMode ? "Enter backup code" : "000000"}
                    maxLength={isBackupMode ? 16 : 6}
                    className={styles.twoFactorInput}
                    autoFocus
                  />
                </div>

                <div className={styles.twoFactorLinks}>
                  {!isBackupMode ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsBackupMode(true)}
                        className={styles.recoveryLink}
                      >
                        Lost access? Use backup code
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRecoveryModal(true)}
                        className={styles.recoveryLink}
                      >
                        Lost everything? Request recovery
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsBackupMode(false)}
                      className={styles.recoveryLink}
                    >
                      ← Back to authenticator code
                    </button>
                  )}
                </div>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? (
                <Loader2 size={20} className={styles.spinning} />
              ) : (
                <>
                  {requiresTwoFactor
                    ? isBackupMode
                      ? "Verify & Login"
                      : "Verify & Sign In"
                    : "Sign In"}{" "}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className={styles.footerNote}>
            <UserCog size={14} />
            <span>Admin access only. This area is restricted to administrators.</span>
          </div>
        </div>
      </div>

      {/* ============ RIGHT SECTION ============ */}
      <div className={styles.rightSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>ADMIN PANEL</div>
          <div className={styles.quoteIcon}>“</div>
          <h2 className={styles.heroTitle}>Manage Your Clinic Reminders</h2>
          <p className={styles.heroText}>
            Access the admin dashboard to manage appointments, track confirmations,
            monitor no-shows, and view analytics.
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📊</span>
              <div>
                <h4>Analytics Dashboard</h4>
                <p>Track no-show rates and appointment trends</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>👥</span>
              <div>
                <h4>User Management</h4>
                <p>Manage clinic staff and permissions</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📝</span>
              <div>
                <h4>Blog Content</h4>
                <p>Create and manage blog posts</p>
              </div>
            </div>
          </div>

          {requiresTwoFactor && (
            <div className={styles.twoFactorHint}>
              <Shield size={14} />
              <span>Your account is protected with two-factor authentication</span>
            </div>
          )}
        </div>
      </div>

      {/* ============ RECOVERY MODAL ============ */}
      {showRecoveryModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRecoveryModal(false)}>
          <div className={styles.recoveryModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Recover 2FA Access</h3>
              <button onClick={() => setShowRecoveryModal(false)} className={styles.modalClose}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {recoveryStatus === "success" ? (
                <>
                  <div className={styles.successIcon}>✓</div>
                  <h4>Recovery Email Sent!</h4>
                  <p>Check your email for instructions to disable 2FA.</p>
                  <p className={styles.note}>The link will expire in 15 minutes.</p>
                  <button onClick={() => setShowRecoveryModal(false)} className={styles.modalBtn}>
                    Close
                  </button>
                </>
              ) : recoveryStatus === "loading" ? (
                <>
                  <Loader2 size={40} className={styles.spinning} />
                  <p>Sending recovery email...</p>
                </>
              ) : (
                <>
                  <AlertCircle size={48} className={styles.warningIcon} />
                  <p>Lost access to your authenticator app?</p>
                  <p className={styles.warningText}>
                    We'll send a recovery link to your email address to disable 2FA.
                    After disabling, you can set up 2FA again.
                  </p>
                  <button onClick={handleRecoveryRequest} className={styles.modalBtn}>
                    Send Recovery Email
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}