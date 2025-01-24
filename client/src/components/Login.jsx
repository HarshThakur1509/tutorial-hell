import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect } from "react"; // Import useEffect
import { videoContext } from "../App";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:3000";

export const Login = () => {
  const { auth, setAuth } = useContext(videoContext);

  const handleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `${API}/auth?provider=google`;
  };

  // Validate user authentication status when the component mounts
  useEffect(() => {
    const validateUser = async () => {
      try {
        const response = await axios.get(`${API}/validate`, {
          withCredentials: true,
        });
        if (response.status === 202) {
          // User is authenticated
          localStorage.setItem("login", "true");
          setAuth(true);
        }
      } catch (err) {
        // User is not authenticated
        console.log(err);

        localStorage.removeItem("login");
        setAuth(false);
      }
    };

    validateUser();
  }, [setAuth]);

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
      localStorage.setItem("login", "true");
      setAuth(true);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  if (auth) return <Navigate to="/" />;

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
