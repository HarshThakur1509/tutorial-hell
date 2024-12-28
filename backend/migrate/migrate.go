package main

import (
	"github.com/HarshThakur1509/tutorial-hell/backend/initializers"
	"github.com/HarshThakur1509/tutorial-hell/backend/models"
)

func init() {
	initializers.ConnectDB()
}

func main() {

	VideoData := &models.VideoData{}
	Comment := &models.Comment{}

	// Add code here

	initializers.DB.AutoMigrate(VideoData, Comment)
}
