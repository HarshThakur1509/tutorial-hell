import { useState, memo, useCallback, useMemo } from "react";
import { formatTime } from "../utils/app.js";
import PropTypes from "prop-types";

export const Comment = memo(
  ({ video, updateCommentMutation, deleteComment }) => {
    // Store expanded state and edit text per comment
    const [commentStates, setCommentStates] = useState({});

    const handleToggle = useCallback(
      (commentId) => {
        setCommentStates((prev) => ({
          ...prev,
          [commentId]: {
            expanded: !prev[commentId]?.expanded,
            text:
              prev[commentId]?.text ||
              video.Comments.find((c) => c.ID === commentId).Body,
          },
        }));
      },
      [video.Comments]
    );

    const handleTextChange = useCallback((commentId, value) => {
      setCommentStates((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          text: value,
        },
      }));
    }, []);

    const handleSubmit = useCallback(
      (commentId) => {
        updateCommentMutation.mutate({
          commentId,
          newBody: commentStates[commentId]?.text || "",
        });
      },
      [commentStates, updateCommentMutation]
    );

    const sortedComments = useMemo(
      () => [...video.Comments].sort((a, b) => a.Timestamp - b.Timestamp),
      [video.Comments]
    );

    return (
      <div className="space-y-4 comments-section">
        {sortedComments.map((comment) => {
          const state = commentStates[comment.ID] || {};
          return (
            <div
              key={comment.ID}
              className={`comment-card ${state.expanded ? "expanded" : ""}`}
            >
              <div className="comment-header">
                <time className="comment-time">
                  {formatTime(comment.Timestamp)}
                </time>
                <div className="comment-actions">
                  <button
                    onClick={() => handleToggle(comment.ID)}
                    className="toggle-btn"
                    aria-label={state.expanded ? "Collapse" : "Edit"}
                    disabled={updateCommentMutation.isPending}
                  >
                    {state.expanded ? "Collapse" : "Edit"}
                  </button>
                  <button
                    onClick={() => deleteComment(comment.ID)}
                    className="delete-comment-btn"
                    aria-label="Delete"
                    disabled={updateCommentMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {state.expanded ? (
                <div className="edit-comment-form">
                  <textarea
                    value={state.text || ""}
                    onChange={(e) =>
                      handleTextChange(comment.ID, e.target.value)
                    }
                    className="comment-textarea"
                    disabled={updateCommentMutation.isPending}
                    aria-label="Edit comment"
                  />
                  <button
                    onClick={() => handleSubmit(comment.ID)}
                    className="submit-edit-btn"
                    disabled={updateCommentMutation.isPending}
                  >
                    {updateCommentMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                  {updateCommentMutation.isError && (
                    <p className="error-message">
                      Error saving: {updateCommentMutation.error.message}
                    </p>
                  )}
                </div>
              ) : (
                <p className="comment-body">{comment.Body}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

Comment.propTypes = {
  video: PropTypes.object.isRequired,
  updateCommentMutation: PropTypes.object.isRequired,
  deleteComment: PropTypes.func.isRequired,
};

Comment.displayName = "Comment";
