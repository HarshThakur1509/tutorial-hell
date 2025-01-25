package main

import (
	"log"

	"github.com/HarshThakur1509/tutorial-hell/backend/initializers"
	"github.com/HarshThakur1509/tutorial-hell/backend/models"
)

func init() {
	initializers.LoadEnv()
	initializers.ConnectDB()
}

func main() {

	log.Println("Starting database migrations...")

	// Ensure models are defined correctly in the models package
	err := initializers.DB.AutoMigrate(
		&models.User{},
		&models.VideoData{},
		&models.Comment{},
	)

	if err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	log.Println("Database migrations completed successfully!")
}
