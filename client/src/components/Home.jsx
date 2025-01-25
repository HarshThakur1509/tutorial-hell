import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { VideoThumbnail } from "./VideoThumbnail";
import axios from "axios";
import useCheckCookie from "./useCheckCookie";

const API = "http://localhost:3000";

export const Home = () => {
  const { cookieExists, loading } = useCheckCookie();

  const {
    data: videos,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const res = await axios.get(`${API}/video`, {
        withCredentials: true,
      });
      return res.data;
    },
    enabled: cookieExists,
    staleTime: 60 * 1000, // Cache for 1 minute
    refetchOnWindowFocus: true,
    retry: 1,
  });

  if (loading) return <p>Checking authentication...</p>;
  if (!cookieExists) return <p>Please login to view videos</p>;
  if (isLoading) return <p>Loading videos...</p>;
  if (isError) return <p>Error loading videos: {error.message}</p>;

  return (
    <div className="video-grid">
      <h1 className="page-title">Videos</h1>
      <div className="video-list">
        {videos?.map((video) => (
          <article key={video.ID} className="video-card">
            <Link to={`/video/${video.ID}`} aria-label={`View ${video.Title}`}>
              <VideoThumbnail
                src={video.WatchID}
                alt={video.Title}
                width={"40%"}
              />
              <h3 className="video-title">{video.Title}</h3>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};
