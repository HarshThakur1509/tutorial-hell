import { Link } from "react-router-dom";
import { useContext } from "react";
import { videoContext } from "../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";

export const Nav = () => {
  const { auth, setAuth } = useContext(videoContext);
  const navigate = useNavigate();

  const toggleTheme = () => {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    htmlElement.setAttribute("data-theme", newTheme);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("login");
      await axios.get(`${API}/auth/logout`, { withCredentials: true });
      setAuth(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="Nav">
      <nav>
        <div className="nav-left">
          <Link to="/">
            <img src="/logo.svg" alt="Logo" className="logo" />
          </Link>
        </div>
        <div className="nav-right">
          {!auth && (
            <Link to="/login" className="nav-link">
              Login
            </Link>
          )}
          {auth && (
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          )}
          <span className="theme-toggle" onClick={toggleTheme}>
            <span className="theme-icon">🌙</span>
            <span className="theme-icon">☀️</span>
          </span>
        </div>
      </nav>
    </header>
  );
};
