package controllers

import (
	"fmt"
	"net/http"
	"net/url"
	"regexp"

	"github.com/HarshThakur1509/tutorial-hell/backend/initializers"
	"github.com/HarshThakur1509/tutorial-hell/backend/models"
)

func getWatchID(youtubeURL string) (string, error) {
	parsedURL, err := url.Parse(youtubeURL)
	if err != nil {
		return "", fmt.Errorf("invalid URL: %v", err)
	}

	// Extract query parameters
	queryParams := parsedURL.Query()
	watchID := queryParams.Get("v")
	if watchID == "" {
		return "", fmt.Errorf("no watch ID found in the URL")
	}

	return watchID, nil
}

// FOR MIDDLEWARE

// isCommentURL checks if the URL path contains /comment
func IsCommentIdURL(path string) bool {
	match, _ := regexp.MatchString(`^/comment/\d+/?$`, path)
	return match
}

// isVideoURL checks if the URL path contains /video
func IsVideoIdURL(path string) bool {
	match, _ := regexp.MatchString(`^/video/\d+/?$`, path)
	return match
}
func IsVideoURL(path string) bool {
	match, _ := regexp.MatchString(`^/video/?$`, path)
	return match
}

// validateCommentOwnership checks if the comment belongs to the current user
func ValidateCommentIdOwnership(w http.ResponseWriter, commentId string, userId uint) bool {
	var comment models.Comment
	if err := initializers.DB.First(&comment, commentId).Error; err != nil {
		http.Error(w, "Comment not found", http.StatusNotFound)
		return false
	}

	var video models.VideoData
	if err := initializers.DB.First(&video, comment.VideoDataID).Error; err != nil {
		// Log the error for debugging
		fmt.Printf("Video not found for comment ID %s: %v\n", commentId, err)
		http.Error(w, "Video not found", http.StatusNotFound)
		return false
	}

	if video.UserID != userId {
		http.Error(w, "Unauthorized: You do not own this comment", http.StatusUnauthorized)
		return false
	}

	return true
}

// validateVideoOwnership checks if the video belongs to the current user
func ValidateVideoIdOwnership(w http.ResponseWriter, videoId string, userId uint) bool {
	var video models.VideoData
	if err := initializers.DB.First(&video, videoId).Error; err != nil {
		http.Error(w, "Video not found", http.StatusNotFound)
		return false
	}

	if video.UserID != userId {
		http.Error(w, "Unauthorized: You do not own this video", http.StatusUnauthorized)
		return false
	}

	return true
}

func ValidateVideosOwnership(w http.ResponseWriter, userId uint) bool {
	var videos []models.VideoData
	if err := initializers.DB.Find(&videos, "user_id=?", userId).Error; err != nil {
		http.Error(w, "Videos not found", http.StatusNotFound)
		return false
	}

	return true
}
