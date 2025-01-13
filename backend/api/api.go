package api

import (
	"fmt"
	"net/http"

	"github.com/HarshThakur1509/tutorial-hell/backend/controllers"
	"github.com/HarshThakur1509/tutorial-hell/backend/middleware"
	"github.com/rs/cors"
)

type ApiServer struct {
	addr string
}

func NewApiServer(addr string) *ApiServer {
	return &ApiServer{addr: addr}
}

func (s *ApiServer) Run() error {
	router := http.NewServeMux()

	router.HandleFunc("POST /send", controllers.PostVideo)

	router.HandleFunc("GET /video", controllers.ListVideo)
	router.HandleFunc("GET /video/{id}", controllers.ListVideoId)
	router.HandleFunc("DELETE /video/{id}", controllers.DeleteVideo)

	router.HandleFunc("DELETE /comment/{id}", controllers.DeleteComment)
	router.HandleFunc("PUT /comment/{id}", controllers.UpdateComment)

	// Add code here

	stack := middleware.MiddlewareChain(middleware.Logger, middleware.RecoveryMiddleware)

	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"https://tutorial.harshthakur.site", "https://www.tutorial.harshthakur.site", "https://www.youtube.com"}, // Specify your frontend origin
		AllowCredentials: true,                                                                                                              // Allow cookies and credentials
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
	}).Handler(stack(router))

	server := http.Server{
		Addr:    s.addr,
		Handler: corsHandler,
	}
	fmt.Println("Server has started", s.addr)
	return server.ListenAndServe()
}
