import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useState, useEffect, useMemo } from "react"; // Import useEffect
import { Home } from "./components/Home";
import { Video } from "./components/Video";
import { Nav } from "./components/Nav";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import axios from "axios"; // Import axios

export const videoContext = createContext();
const client = new QueryClient();

function App() {
  const [videos, setVideos] = useState();
  const [auth, setAuth] = useState(() => {
    // Initialize auth state from localStorage
    return localStorage.getItem("login") === "true";
  });
  const [userDetails, setUserDetails] = useState({});

  // Validate user authentication status when the app loads
  useEffect(() => {
    const validateUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/validate", {
          withCredentials: true,
        });
        if (response.status === 202) {
          // User is authenticated
          localStorage.setItem("login", "true");
          setAuth(true);
        }
      } catch (err) {
        // User is not authenticated
        localStorage.removeItem("login");
        console.log(err);

        setAuth(false);
      }
    };

    validateUser();
  }, []); // Run only once when the app loads

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      videos,
      setVideos,
      auth,
      setAuth,
      userDetails,
      setUserDetails,
    }),
    [videos, auth, userDetails] // Dependencies
  );

  return (
    <div className="App">
      <QueryClientProvider client={client}>
        <videoContext.Provider value={contextValue}>
          <Router>
            <Nav />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/video/:id" element={<Video />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<div>No page found!</div>} />
            </Routes>
          </Router>
        </videoContext.Provider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
