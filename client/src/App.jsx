import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useState, useMemo } from "react"; // Import useEffect
import { Home } from "./components/Home";
import { Video } from "./components/Video";
import { Nav } from "./components/Nav";
import { Login } from "./components/Login";
import { Register } from "./components/Register";

export const videoContext = createContext();
const client = new QueryClient();

function App() {
  const [videos, setVideos] = useState();

  const [userDetails, setUserDetails] = useState({});

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      videos,
      setVideos,
      userDetails,
      setUserDetails,
    }),
    [videos, userDetails] // Dependencies
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
