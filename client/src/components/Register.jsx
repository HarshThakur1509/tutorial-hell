import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";
import useCheckCookie from "./useCheckCookie";

const API = "http://localhost:3000";

export const Register = () => {
  const { cookieExists } = useCheckCookie();

  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
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
      await axios.post(`${API}/register`, formData, { withCredentials: true });
      await axios.post(`${API}/login`, formData, { withCredentials: true });
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  if (cookieExists) return <Navigate to="/" />;

  return (
    <div className="Register">
      <h1>Register</h1>
      <form className="Form" onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder="Name..." {...register("name")} />
        <p className="text-red-500">{errors.name?.message}</p>
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
      <Link to="/login">Login</Link>
    </div>
  );
};
