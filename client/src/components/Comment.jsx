import { useState, memo } from "react";
import { formatTime } from "../utils/app.js";
import PropTypes from "prop-types";

export const Comment = memo(
  ({ video, updateCommentMutation, deleteComment }) => {
    const [expandedComments, setExpandedComments] = useState(new Set());
    const [editText, setEditText] = useState({});

    const handleToggle = (commentId) => {
      setExpandedComments((prev) => {
        const newSet = new Set(prev);
        newSet.has(commentId)
          ? newSet.delete(commentId)
          : newSet.add(commentId);
        return newSet;
      });

      if (!editText[commentId]) {
        setEditText((prev) => ({
          ...prev,
          [commentId]: video.Comments.find((c) => c.ID === commentId).Body,
        }));
      }
    };

    const handleTextChange = (commentId, value) => {
      setEditText((prev) => ({ ...prev, [commentId]: value }));
    };

    const handleSubmit = (commentId) => {
      updateCommentMutation.mutate({ commentId, newBody: editText[commentId] });
    };

    const sortedComments = [...video.Comments].sort(
      (a, b) => a.Timestamp - b.Timestamp
    );

    return (
      <div className="space-y-4 comments-section">
        {sortedComments.map((comment) => (
          <div
            key={comment.ID}
            className={`comment-card ${
              expandedComments.has(comment.ID) ? "expanded" : ""
            }`}
          >
            <div className="comment-header">
              <time className="comment-time">
                {formatTime(comment.Timestamp)}
              </time>

              <div className="comment-actions">
                <button
                  onClick={() => handleToggle(comment.ID)}
                  className="toggle-btn"
                  aria-label={
                    expandedComments.has(comment.ID)
                      ? "Collapse comment"
                      : "Edit comment"
                  }
                  disabled={updateCommentMutation.isPending}
                >
                  {expandedComments.has(comment.ID) ? "Collapse" : "Edit"}
                </button>

                <button
                  onClick={() => deleteComment(comment.ID)}
                  className="delete-comment-btn"
                  aria-label="Delete comment"
                  disabled={updateCommentMutation.isPending}
                >
                  Delete
                </button>
              </div>
            </div>

            {expandedComments.has(comment.ID) ? (
              <div className="edit-comment-form">
                <textarea
                  value={editText[comment.ID] || ""}
                  onChange={(e) => handleTextChange(comment.ID, e.target.value)}
                  className="comment-textarea"
                  disabled={updateCommentMutation.isPending}
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
              </div>
            ) : (
              <p className="comment-body">{comment.Body}</p>
            )}
          </div>
        ))}
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
