package controllers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/HarshThakur1509/tutorial-hell/backend/initializers"
	"github.com/HarshThakur1509/tutorial-hell/backend/models"
)

type Response struct {
	Status  string    `json:"status"`
	Message string    `json:"message"`
	Time    time.Time `json:"time"`
}

type HealthResponse struct {
	Status string `json:"status"`
	DB     string `json:"database"`
}

func Health(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{Status: "UP", DB: "OK"}

	// Ping the database
	sqlDB, err := initializers.DB.DB()
	if err != nil || sqlDB.Ping() != nil {
		response.DB = "DOWN"
		w.WriteHeader(http.StatusInternalServerError)
	} else {
		w.WriteHeader(http.StatusOK)
	}

	// Write the JSON response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func PostVideo(w http.ResponseWriter, r *http.Request) {

	var body struct {
		Url           string
		Title         string
		Timestamp     float64
		FormattedTime string
	}

	json.NewDecoder(r.Body).Decode(&body)

	// Get user from the context
	userID := r.Context().Value("userID")

	var user models.User
	initializers.DB.First(&user, userID)

	// Extract watch ID
	watchID, err := getWatchID(body.Url)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	video := models.VideoData{
		WatchID: watchID,
		Title:   body.Title,
		UserID:  user.ID,
	}
	comment := models.Comment{
		Timestamp: body.Timestamp,
	}

	initializers.DB.FirstOrCreate(&video, "watch_id = ? AND user_id = ?", video.WatchID, user.ID)

	comment.VideoDataID = video.ID
	initializers.DB.Create(&comment)

	// Log the received data
	log.Printf("Received video: %s at %.2f seconds\n",
		video.Title, comment.Timestamp)

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode("Success")
}

func ListVideo(w http.ResponseWriter, r *http.Request) {

	// Get user from the context
	userID := r.Context().Value("userID")

	var video []models.VideoData
	initializers.DB.Preload("Comments").Find(&video, "user_id = ?", userID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(video)
}

func ListVideoId(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	// Get user from the context
	// userID := r.Context().Value("userID")

	var video models.VideoData
	initializers.DB.Preload("Comments").Find(&video, id)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(video)
}

func DeleteVideo(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	// Get user from the context
	// userID := r.Context().Value("userID")

	var video models.VideoData
	initializers.DB.Delete(&video, id)
	w.WriteHeader(http.StatusNoContent) // 204 No Content
}

func UpdateComment(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var comment models.Comment
	initializers.DB.First(&comment, id)

	// var video models.VideoData
	// initializers.DB.First(&video, comment.VideoDataID)

	// userId, err := strconv.ParseUint(r.Context().Value("userID").(string), 10, 32)
	// if err != nil {
	// 	fmt.Println(err)
	// }

	// if video.UserID != uint(userId) {
	// 	http.Error(w, "Unauthorized", http.StatusUnauthorized)
	// 	return
	// }

	var body struct {
		Body string
	}
	json.NewDecoder(r.Body).Decode(&body)

	comment.Body = body.Body
	initializers.DB.Save(&comment)
	w.WriteHeader(http.StatusAccepted) // 204 No Content
}

func DeleteComment(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var comment models.Comment

	// initializers.DB.First(&comment, id)

	// var video models.VideoData
	// initializers.DB.First(&video, comment.VideoDataID)

	// userId, err := strconv.ParseUint(r.Context().Value("userID").(string), 10, 32)
	// if err != nil {
	// 	fmt.Println(err)
	// }

	// if video.UserID != uint(userId) {
	// 	http.Error(w, "Unauthorized", http.StatusUnauthorized)
	// 	return
	// }
	initializers.DB.Delete(&comment, id)

	w.WriteHeader(http.StatusNoContent) // 204 No Content
}
