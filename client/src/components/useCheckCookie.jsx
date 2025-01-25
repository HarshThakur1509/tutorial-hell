// useCheckCookie.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const useCheckCookie = () => {
  const [cookieExists, setCookieExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCookie = async () => {
      try {
        const response = await axios.get("http://localhost:3000/cookie", {
          withCredentials: true,
        });
        setCookieExists(response.data.exists);
      } catch (error) {
        console.error("Error checking cookie:", error);
        setCookieExists(false);
      } finally {
        setLoading(false);
      }
    };

    checkCookie();
  }, []);

  return { cookieExists, loading };
};

export default useCheckCookie;
