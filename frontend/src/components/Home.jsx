import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { VideoThumbnail } from "./VideoThumbnail";
import { useContext } from "react";
import { videoContext } from "../App";
import axios from "axios";

export const Home = () => {
  const { videos, setVideos } = useContext(videoContext);

  const API = "https://tutorial.harshthakur.site/api";

  const fetchVideos = async () => {
    const res = await axios.get(`${API}/video`);
    setVideos(res.data);
    return res.data;
  };

  // Use Query to Fetch Videos
  const { isLoading, isError } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  const mutation = useMutation({
    mutationFn: fetchVideos,
    onSuccess: (updatedVideo) => {
      // Update the context with the modified video
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === updatedVideo.id ? updatedVideo : video
        )
      );
    },
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (isError) {
    return <p>Error!</p>;
  }

  return (
    <div>
      <h1>Videos</h1>
      <ul>
        {videos.map((video) => (
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
