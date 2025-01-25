import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";
import useCheckCookie from "./useCheckCookie";

const API = "http://localhost:3000";

export const Login = () => {
  const { cookieExists } = useCheckCookie();

  const handleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `${API}/auth?provider=google`;
  };

  const schema = yup.object().shape({
    email: yup.string().required("Email is required"),
    password: yup.string().min(4).max(20).required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

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
    <div className="Login">
      <h1>Login</h1>
      <form className="Form" onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder="Email..." {...register("email")} />
        <p className="text-red-500">{errors.email?.message}</p>
        <input
          type="password"
          placeholder="Password..."
          {...register("password")}
        />
        <p className="text-red-500">{errors.password?.message}</p>
        <button className="btn3" type="submit">
          Submit
        </button>
      </form>
      <Link to="/register">Register</Link>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
};
