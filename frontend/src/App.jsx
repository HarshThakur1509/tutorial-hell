import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useState } from "react";
import { Home } from "./components/Home";
import { Video } from "./components/Video";
import { Nav } from "./components/Nav";

export const videoContext = createContext();
const client = new QueryClient({
  // defaultOptions: {
  //   queries: {
  //     refetchOnWindowFocus: false,
  //     staleTime: 1000 * 60 * 5, // 5 minutes
  //   },
  // },
});

function App() {
  const [videos, setVideos] = useState();

  return (
    <div className="App">
      <QueryClientProvider client={client}>
        <videoContext.Provider value={{ videos, setVideos }}>
          <Router>
            <Nav />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/video/:id" element={<Video />} />
              <Route path="*" element={<div>No page found!</div>} />
            </Routes>
          </Router>
        </videoContext.Provider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
