import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VideoEmbed } from "./VideoEmbed";
import { Comment } from "./Comment";
import axios from "axios";
import { useMemo } from "react";

const API = "http://localhost:3000";

export const Video = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

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
    queryKey: ["Video", id],
  });

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
      await queryClient.cancelQueries(["Video", id]);
      const previousVideo = queryClient.getQueryData(["Video", id]);

      queryClient.setQueryData(["Video", id], (oldData) => ({
        ...oldData,
        Comments: oldData.Comments.map((comment) =>
          comment.ID === commentId ? { ...comment, Body: newBody } : comment
        ),
      }));

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
      await axios.delete(`${API}/video/${id}`, { withCredentials: true });
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`${API}/comment/${commentId}`, {
        withCredentials: true,
      });
      queryClient.setQueryData(["Video", id], (oldData) => ({
        ...oldData,
        Comments: oldData.Comments.filter(
          (comment) => comment.ID !== commentId
        ),
      }));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const memoizedVideo = useMemo(() => video, [video]);

  if (isLoading) return <div>Fetching posts...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div>
      <VideoEmbed
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${memoizedVideo.WatchID}`}
        title={memoizedVideo.Title}
      />
      <h2>{memoizedVideo.Title}</h2>
      <button onClick={deleteVideo}>Delete Video</button>
      <Comment
        video={memoizedVideo}
        updateCommentMutation={updateCommentMutation}
        deleteComment={deleteComment}
      />
    </div>
  );
};
