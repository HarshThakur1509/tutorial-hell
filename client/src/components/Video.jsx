import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VideoEmbed } from "./VideoEmbed";
import { Comment } from "./Comment";
import axios from "axios";

const API = "https://youtube.harshthakur.site/api";

export const Video = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: video,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const res = await axios.get(`${API}/video/${id}`, {
        withCredentials: true,
      });
      return {
        ...res.data,
        Comments: [...res.data.Comments].sort(
          (a, b) => a.Timestamp - b.Timestamp
        ),
      };
    },
    retry: 1,
    refetchOnWindowFocus: true,
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, newBody }) => {
      const res = await axios.put(
        `${API}/comment/${commentId}`,
        { Body: newBody },
        { withCredentials: true }
      );
      return res.data;
    },
    onError: (error) => console.error("Update failed:", error),
    onSettled: () => queryClient.invalidateQueries(["video", id]),
  });

  const deleteVideo = useMutation({
    mutationFn: () =>
      axios.delete(`${API}/video/${id}`, {
        withCredentials: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["videos"]); // Invalidate videos list
      navigate("/", { replace: true });
    },
    onError: (error) => alert(`Deletion failed: ${error.message}`),
  });

  const deleteComment = useMutation({
    mutationFn: (commentId) =>
      axios.delete(`${API}/comment/${commentId}`, {
        withCredentials: true,
      }),
    onSuccess: () => queryClient.invalidateQueries(["video", id]),
    onError: (error) => alert(`Comment deletion failed: ${error.message}`),
  });

  if (isLoading) return <div>Loading video...</div>;
  if (error) return <div>Error loading video: {error.message}</div>;

  return (
    <div className="video-page-container">
      <div className="video-main-content">
        <div className="video-player-container">
          <VideoEmbed
            src={`https://www.youtube.com/embed/${video.WatchID}`}
            title={video.Title}
            width={"100%"}
            // height={"360px"}
          />
        </div>

        <div className="video-metadata">
          <h1 className="video-title">{video.Title}</h1>

          <div className="video-actions">
            <button
              onClick={() => {
                if (window.confirm("Delete this video?")) deleteVideo.mutate();
              }}
              className="delete-video-btn"
              aria-label="Delete video"
              disabled={deleteVideo.isLoading}
            >
              {deleteVideo.isLoading ? "Deleting..." : "Delete Video"}
            </button>
          </div>
        </div>

        <div className="comments-section">
          <h2 className="comments-title">Comments</h2>
          <Comment
            video={video}
            updateCommentMutation={updateCommentMutation}
            deleteComment={deleteComment.mutate}
          />
        </div>
      </div>
    </div>
  );
};
