import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";
import useCheckCookie from "./useCheckCookie";
import { FaGoogle, FaEnvelope, FaLock } from "react-icons/fa";

const API = "https://youtube.harshthakur.site/api";

export const Login = () => {
  const { cookieExists } = useCheckCookie();

  const handleLogin = () => {
    window.location.href = `${API}/auth?provider=google`;
  };

  const schema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().min(4).max(20).required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (formData) => {
    try {
      await axios.post(`${API}/login`, formData, { withCredentials: true });
      window.location.reload();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  if (cookieExists) return <Navigate to="/" />;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue</p>

        <button
          onClick={handleLogin}
          className="social-login-btn"
          type="button"
        >
          <FaGoogle className="social-icon" />
          Continue with Google
        </button>

        <div className="auth-divider">
          <span className="divider-line"></span>
          <span className="divider-text">or</span>
          <span className="divider-line"></span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label className="input-label">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Email address"
                {...register("email")}
                className={`input-field ${errors.email ? "input-error" : ""}`}
              />
            </label>
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className={`input-field ${
                  errors.password ? "input-error" : ""
                }`}
              />
            </label>
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>

          <button className="auth-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          {" "}
          <Link to="/register" className="auth-link">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};
