import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { VideoThumbnail } from "./VideoThumbnail";
import { useContext, useMemo } from "react";
import { videoContext } from "../App";
import axios from "axios";

const API = "http://localhost:3000";

export const Home = () => {
  const { videos, setVideos, auth } = useContext(videoContext);

  const fetchVideos = async () => {
    const res = await axios.get(`${API}/video`, { withCredentials: true });
    setVideos(res.data);
    return res.data;
  };

  const { isLoading, isError, error } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
    enabled: auth, // Only fetch videos if the user is logged in
  });

  const mutation = useMutation({
    mutationFn: fetchVideos,
    onSuccess: (updatedVideo) => {
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === updatedVideo.id ? updatedVideo : video
        )
      );
    },
  });

  const memoizedVideos = useMemo(() => videos, [videos]);

  if (!auth) {
    return <p>User is not logged in. Please log in to view videos.</p>;
  }

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Videos</h1>
      <ul>
        {memoizedVideos.map((video) => (
          <div key={video.ID}>
            <VideoThumbnail
              src={video.WatchID}
              alt={video.Title}
              width={"480px"}
              height={"360px"}
            />
            <Link to={`/video/${video.ID}`}>{video.Title}</Link>
          </div>
        ))}
      </ul>
      {mutation.isLoading && <p>Updating video...</p>}
      {mutation.isError && <p>Error updating video!</p>}
      {mutation.isSuccess && <p>Video updated successfully!</p>}
    </div>
  );
};
