package main

import (
	"github.com/HarshThakur1509/tutorial-hell/backend/api"
	"github.com/HarshThakur1509/tutorial-hell/backend/initializers"
)

func init() {
	initializers.ConnectDB()
}

func main() {
	server := api.NewApiServer(":8080")
	server.Run()
}
