package api

import (
	"fmt"
	"net/http"

	"github.com/HarshThakur1509/tutorial-hell/backend/controllers"
	"github.com/HarshThakur1509/tutorial-hell/backend/middleware"
	"github.com/markbates/goth/gothic"
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

	router.HandleFunc("GET /health", controllers.Health)
	router.HandleFunc("GET /test", controllers.Test)

	// USER AUTHENTICATION

	router.HandleFunc("POST /login", controllers.CustomLogin)
	router.HandleFunc("POST /register", controllers.CustomRegister)

	router.HandleFunc("GET /auth", gothic.BeginAuthHandler)
	router.HandleFunc("GET /auth/callback", controllers.GoogleCallbackHandler)

	router.HandleFunc("GET /cookie", controllers.GetCookie)

	authRouter := http.NewServeMux()

	authRouter.HandleFunc("GET /auth/logout", controllers.GothLogout)
	authRouter.HandleFunc("GET /api/user", controllers.GetUser)

	authRouter.HandleFunc("POST /send", controllers.PostVideo)

	authRouter.HandleFunc("GET /video", controllers.ListVideo)
	authRouter.HandleFunc("GET /video/{id}", middleware.UserDataAllowedMiddleware(controllers.ListVideoId))
	authRouter.HandleFunc("DELETE /video/{id}", middleware.UserDataAllowedMiddleware(controllers.DeleteVideo))

	authRouter.HandleFunc("DELETE /comment/{id}", middleware.UserDataAllowedMiddleware(controllers.DeleteComment))
	authRouter.HandleFunc("PUT /comment/{id}", middleware.UserDataAllowedMiddleware(controllers.UpdateComment))

	router.Handle("/", middleware.AuthMiddleware(authRouter))

	stack := middleware.MiddlewareChain(middleware.RecoveryMiddleware, middleware.Logger)

	corsHandler := cors.New(cors.Options{
		AllowedOrigins: []string{
			"chrome-extension://ookoamekfiigagodlifaglakmjggchen", // Allow Chrome extension
			"https://youtube.harshthakur.site",
			"https://www.youtube.harshthakur.site",
			"https://www.youtube.com"}, // Specify your frontend origin
		AllowCredentials: true, // Allow cookies and credentials
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{
			"Content-Type",
			"Authorization",
			"Cookie",
			"Set-Cookie",
			"Accept",
			"Origin",
			"X-Requested-With"},
	}).Handler(stack(router))

	server := http.Server{
		Addr:    s.addr,
		Handler: corsHandler,
	}
	fmt.Println("Server has started", s.addr)
	return server.ListenAndServe()
}
