import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VideoEmbed } from "./VideoEmbed";
import { Comment } from "./Comment";
import axios from "axios";

const API = "http://localhost:3000";

export const Video = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: video,
    error,
    isLoading,
  } = useQuery({
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
    queryKey: ["video", id],
  });

  // Add back the missing mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, newBody }) => {
      const response = await axios.put(
        `${API}/comment/${commentId}`,
        { Body: newBody },
        { withCredentials: true }
      );
      return response.data;
    },
    onMutate: async ({ commentId, newBody }) => {
      await queryClient.cancelQueries(["video", id]);
      const previousVideo = queryClient.getQueryData(["video", id]);

      queryClient.setQueryData(["video", id], (oldData) => ({
        ...oldData,
        Comments: oldData.Comments.map((comment) =>
          comment.ID === commentId ? { ...comment, Body: newBody } : comment
        ),
      }));

      return { previousVideo };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["video", id], context.previousVideo);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["video", id]);
    },
  });

  const deleteVideo = async () => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      await axios.delete(`${API}/video/${id}`, { withCredentials: true });
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video. Please try again.");
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment permanently?")) return;

    try {
      await axios.delete(`${API}/comment/${commentId}`, {
        withCredentials: true,
      });
      queryClient.setQueryData(["video", id], (oldData) => ({
        ...oldData,
        Comments: oldData.Comments.filter(
          (comment) => comment.ID !== commentId
        ),
      }));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  if (isLoading) return <div>Loading video...</div>;
  if (error) return <div>Error loading video: {error.message}</div>;

  return (
    <div className="video-container">
      <VideoEmbed
        width="100%"
        height="480"
        src={`https://www.youtube.com/embed/${video.WatchID}`}
        title={video.Title}
      />

      <div className="video-header">
        <h2>{video.Title}</h2>
        <button
          onClick={deleteVideo}
          className="delete-video-btn"
          aria-label="Delete video"
        >
          Delete Video
        </button>
      </div>

      <Comment
        video={video}
        updateCommentMutation={updateCommentMutation}
        deleteComment={deleteComment}
      />
    </div>
  );
};
