import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";
import useCheckCookie from "./useCheckCookie";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

const API = "https://youtube.harshthakur.site/api";

export const Register = () => {
  const { cookieExists } = useCheckCookie();

  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
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
      await axios.post(`${API}/register`, formData, { withCredentials: true });
      await axios.post(`${API}/login`, formData, { withCredentials: true });
      window.location.reload();
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  if (cookieExists) return <Navigate to="/" />;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Get started with us today</p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label className="input-label">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="Full name"
                {...register("name")}
                className={`input-field ${errors.name ? "input-error" : ""}`}
              />
            </label>
            {errors.name && (
              <p className="error-message">{errors.name.message}</p>
            )}
          </div>

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
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
