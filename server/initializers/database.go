package initializers

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	var err error

	config := &gorm.Config{
		PrepareStmt: true, // Enable statement caching
	}

	// Environment variables for database connection
	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbPort := os.Getenv("DB_PORT")

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		dbHost, dbUser, dbPassword, dbName, dbPort,
	)

	// Retry logic with exponential backoff and maximum timeout
	maxAttempts := 10
	for attempts := 0; attempts < maxAttempts; attempts++ {
		DB, err = gorm.Open(postgres.Open(dsn), config)
		if err == nil {
			log.Println("Connected to the database successfully!")
			return
		}

		log.Printf(
			"Database connection failed (attempt %d/%d): %v",
			attempts+1, maxAttempts, err,
		)

		// Exponential backoff
		time.Sleep(time.Duration(attempts+1) * time.Second)
	}

	// Exit if the connection fails after retries
	log.Fatalf("Failed to connect to the database after %d attempts: %v", maxAttempts, err)
}
