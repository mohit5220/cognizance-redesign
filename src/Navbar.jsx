
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const links = [
  ["Home", "/", "home"],
  ["Events", "/events", "events"],
  ["Workshops", "/workshops", "workshops"],
  ["RESULTS", "/results", "results"],
  ["Gallery", "/gallery", "gallery"],
  ["Sponsors", "/sponsors", "sponsors"],
  ["Team", "/team", "team"],
];

function CogniLogo() {
  return (
    <svg viewBox="0 0 48 48" fill="none">
      <g transform="translate(24 24)" fill="#20E9EB">
        {Array.from({ length: 6 }, (_, i) => (
          <path
            key={i}
            transform={`rotate(${i * 60})`}
            d="M-2 -2 C-8 -9 -11 -17 -5 -22 C3 -19 7 -11 3 -3 L1 3 Z"
          />
        ))}
      </g>
      <circle cx="24" cy="24" r="2.2" fill="#20E9EB" />
    </svg>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");

  function openLogin(mode = "login") {
    setActivePanel(null);
    setAuthMode(mode);
    setAuthMessage("");
    setLoginOpen(true);
    setMenuOpen(false);
  }

  function handleDemoSubmit(e) {
    e.preventDefault();

    if (authMode === "forgot") {
      setAuthMessage(
        "Password reset is not connected in this demo yet."
      );
    } else {
      setAuthMessage(
        "Frontend demo only. Connect an authentication service to enable accounts."
      );
    }
  }

  return (
    <>
      <header className="cog-header">
        <Link to="/" className="cog-brand">
          <span className="cog-symbol">
            <CogniLogo />
          </span>
          <span>COGNIZANCE 2026</span>
        </Link>

        <nav className={`cog-navigation ${menuOpen ? "is-open" : ""}`}>
          {links.map(([label, path, id]) => {
            const active =
              path === "/"
                ? pathname === "/"
                : pathname === path ||
                  pathname.startsWith(path + "/");

            return (
              <Link
                key={id}
                to={path}
                className={`${active ? "current" : ""} ${
                  id === "results" ? "results" : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="cog-actions">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() =>
              setActivePanel(
                activePanel === "notifications"
                  ? null
                  : "notifications"
              )
            }
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22a2.2 2.2 0 0 0 2.1-2h-4.2a2.2 2.2 0 0 0 2.1 2Zm7-5-2-2.2V10a5 5 0 0 0-4-4.9V4a1 1 0 0 0-2 0v1.1A5 5 0 0 0 7 10v4.8L5 17v1h14v-1Z" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Shopping cart"
            onClick={() =>
              setActivePanel(
                activePanel === "cart" ? null : "cart"
              )
            }
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 3h2l2.5 12h12L21 7H5M9 19a1.8 1.8 0 1 0 0 3.6A1.8 1.8 0 0 0 9 19Zm8 0a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z" />
            </svg>
          </button>

          <button
            type="button"
            className="cog-login"
            onClick={() => openLogin("login")}
          >
            LOGIN
          </button>
        </div>

        {activePanel === "notifications" && (
          <div className="cog-popover cog-notifications">
            <div className="cog-popover-heading">
              <span>NOTIFICATIONS</span>
              <button
                type="button"
                onClick={() => setActivePanel(null)}
              >
                ×
              </button>
            </div>

            <div className="cog-popover-empty">
              <em>No new notifications</em>
            </div>

            <button
              type="button"
              className="cog-popover-footer"
              onClick={() => setActivePanel(null)}
            >
              VIEW ALL NOTIFICATIONS
            </button>
          </div>
        )}

        {activePanel === "cart" && (
          <div className="cog-popover cog-cart">
            <div className="cog-popover-heading">
              <span>YOUR CART</span>
              <button
                type="button"
                onClick={() => setActivePanel(null)}
              >
                ×
              </button>
            </div>

            <div className="cog-cart-empty">
              <em>Your cart is empty</em>
            </div>
          </div>
        )}

        <button
          className="cog-hamburger"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {loginOpen && (
        <div className="cog-login-screen" role="dialog" aria-modal="true">
          <button
            type="button"
            className="cog-login-close"
            onClick={() => setLoginOpen(false)}
            aria-label="Close login"
          >
            ×
          </button>

          <div className="cog-login-visual" />

          <div className="cog-login-form-side">
            <div className="cog-login-brand">
              <span><CogniLogo /></span>
              COGNIZANCE<span>'26</span>
            </div>

            <div className="cog-login-content">
              <h2>
                {authMode === "login"
                  ? "HI, WELCOME BACK 👋"
                  : authMode === "signup"
                    ? "JOIN COGNIZANCE ✨"
                    : "RESET PASSWORD"}
              </h2>

              <h1>
                {authMode === "login"
                  ? "FILL YOUR LOGIN INFORMATION"
                  : authMode === "signup"
                    ? "CREATE YOUR ACCOUNT"
                    : "FORGOT YOUR PASSWORD?"}
              </h1>

              <p>To help us know you better</p>

              <form onSubmit={handleDemoSubmit}>
                {authMode === "signup" && (
                  <label>
                    Full Name
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      required
                    />
                  </label>
                )}

                <label>
                  Email
                  <input
                    type="email"
                    placeholder="Enter your email id"
                    required
                  />
                </label>

                {authMode !== "forgot" && (
                  <label>
                    Password
                    <input
                      type="password"
                      placeholder="Enter your password"
                      minLength={6}
                      required
                    />
                  </label>
                )}

                {authMode === "login" && (
                  <button
                    type="button"
                    className="cog-forgot"
                    onClick={() => openLogin("forgot")}
                  >
                    Forgot Password?
                  </button>
                )}

                <button
                  type="submit"
                  className="cog-submit-login"
                >
                  {authMode === "login"
                    ? "Login"
                    : authMode === "signup"
                      ? "Create an account"
                      : "Send reset link"}
                </button>
              </form>

              {authMessage && (
                <p className="cog-auth-message" role="status">
                  {authMessage}
                </p>
              )}

              {authMode === "login" && (
                <div className="cog-signup-link">
                  Create an account{" "}
                  <button
                    type="button"
                    onClick={() => openLogin("signup")}
                  >
                    SignUp!
                  </button>
                </div>
              )}

              {authMode === "signup" && (
                <div className="cog-signup-link">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => openLogin("login")}
                  >
                    Login
                  </button>
                </div>
              )}

              {authMode === "forgot" && (
                <div className="cog-signup-link">
                  Remembered your password?{" "}
                  <button
                    type="button"
                    onClick={() => openLogin("login")}
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



