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

    const handleDelete = (commentId) => {
      deleteComment(commentId);
    };

    const sortedComments = [...video.Comments].sort(
      (a, b) => a.Timestamp - b.Timestamp
    );

    return (
      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <div
            key={comment.ID}
            className={`card p-4 border rounded-lg ${
              expandedComments.has(comment.ID) ? "bg-gray-50" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">
                {formatTime(comment.Timestamp)}
              </span>
              <button
                onClick={() => handleToggle(comment.ID)}
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                {expandedComments.has(comment.ID) ? "Collapse" : "Edit"}
              </button>
              <button
                onClick={() => handleDelete(comment.ID)}
                className="text-red-500"
              >
                X
              </button>
            </div>

            {expandedComments.has(comment.ID) && (
              <div className="space-y-2">
                <textarea
                  value={editText[comment.ID] || ""}
                  onChange={(e) => handleTextChange(comment.ID, e.target.value)}
                  className="w-full p-2 border rounded resize-y min-h-[100px]"
                />
                <button
                  onClick={() => handleSubmit(comment.ID)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Submit
                </button>
              </div>
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
