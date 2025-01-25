import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import useCheckCookie from "./useCheckCookie";

const API = "http://localhost:3000";

export const Nav = () => {
  const navigate = useNavigate();
  const { cookieExists } = useCheckCookie();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Persist theme preference
  const toggleTheme = () => {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    htmlElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await axios.get(`${API}/auth/logout`, { withCredentials: true });
      localStorage.removeItem("login");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="Nav">
      <nav>
        <div className="nav-left">
          <Link to="/" aria-label="Home">
            <img src="/logo.svg" alt="Logo" className="logo" />
          </Link>
        </div>
        <div className="nav-right">
          {!cookieExists ? (
            <Link to="/login" className="nav-link" aria-label="Login">
              Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="logout-button"
              disabled={isLoggingOut}
              aria-label={isLoggingOut ? "Logging out..." : "Logout"}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            <span className="theme-icon">🌙</span>
            <span className="theme-icon">☀️</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
