import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VideoEmbed } from "./VideoEmbed";
import { Comment } from "./Comment";
import axios from "axios";

export const Video = () => {
  const id = useParams().id;
  const queryClient = useQueryClient();

  const API = "https://tutorial.harshthakur.site/api";

  const {
    data: video,
    error,
    isLoading,
  } = useQuery({
    queryFn: async () => {
      const res = await axios.get(`${API}/video/${id}`);
      // Sort comments by timestamp or ID to maintain consistent order
      return {
        ...res.data,
        Comments: [...res.data.Comments].sort(
          (a, b) => a.Timestamp - b.Timestamp
        ),
      };
    },
    queryKey: ["Video", id],
  });

  // Mutation for updating a comment
  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, newBody }) => {
      const response = await axios.put(`${API}/comment/${commentId}`, {
        Body: newBody,
      });
      return response.data;
    },
    onMutate: async ({ commentId, newBody }) => {
      await queryClient.cancelQueries(["Video", id]);
      const previousVideo = queryClient.getQueryData(["Video", id]);

      queryClient.setQueryData(["Video", id], (oldData) => {
        const updatedComments = oldData.Comments.map((comment) =>
          comment.ID === commentId ? { ...comment, Body: newBody } : comment
        );
        // Maintain the same order
        return {
          ...oldData,
          Comments: updatedComments,
        };
      });

      return { previousVideo };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["Video", id], context.previousVideo);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["Video", id]);
    },
  });

  const deleteVideo = async () => {
    try {
      await axios.delete(`${API}/video/${id}`);
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  // Function to handle comment deletion
  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`${API}/comment/${commentId}`);
      queryClient.setQueryData(["Video", id], (oldData) => {
        const updatedComments = oldData.Comments.filter(
          (comment) => comment.ID !== commentId
        );
        return {
          ...oldData,
          Comments: updatedComments,
        };
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (isLoading) return <div className="Todo">Fetching posts...</div>;
  if (error)
    return <div className="Todo">An error occurred: {error.message}</div>;

  return (
    <div>
      <VideoEmbed
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${video.WatchID}`}
        title={video.Title}
      />
      <h2>{video.Title}</h2>
      <button onClick={deleteVideo}>X</button>
      <Comment
        video={video}
        updateCommentMutation={updateCommentMutation}
        deleteComment={deleteComment}
      />
    </div>
  );
};
