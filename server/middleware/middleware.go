package middleware

import (
	"context"
	"log"
	"net/http"
	"runtime/debug"
	"strconv"
	"time"

	"github.com/HarshThakur1509/tutorial-hell/backend/controllers"
	"github.com/markbates/goth/gothic"
)

// responseWriterWrapper wraps the http.ResponseWriter to capture the status code
type responseWriterWrapper struct {
	http.ResponseWriter
	status      int
	wroteHeader bool
}

func (w *responseWriterWrapper) WriteHeader(code int) {
	if w.wroteHeader {
		return
	}
	w.status = code
	w.ResponseWriter.WriteHeader(code)
	w.wroteHeader = true
}

// LoggingMiddleware logs incoming HTTP requests
func Logger(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Wrap the response writer to capture the status code
		wrapped := &responseWriterWrapper{ResponseWriter: w, status: http.StatusOK}

		// Process the request
		next.ServeHTTP(wrapped, r)

		// Calculate duration
		duration := time.Since(start)

		// Log request details
		log.Printf(
			"method=%s path=%s remote_addr=%s status=%d duration=%s",
			r.Method,
			r.URL.Path,
			r.RemoteAddr,
			wrapped.status,
			duration,
		)
	}
}
func RecoveryMiddleware(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		defer func() {
			if err := recover(); err != nil {
				msg := "Caught panic: %v, Stack treace: %s"
				log.Printf(msg, err, string(debug.Stack()))

				er := http.StatusInternalServerError
				http.Error(w, "Internal Server Error", er)
			}
		}()

		next.ServeHTTP(w, r)
	}
}
func AuthMiddleware(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Retrieve user ID from the session
		userID, err := gothic.GetFromSession("user_id", r)
		if err != nil || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Refresh the session's lifetime
		session, _ := gothic.Store.Get(r, gothic.SessionName)
		session.Options.MaxAge = 86400 // Extend by 1 day (adjust as needed)
		err = session.Save(r, w)
		if err != nil {
			http.Error(w, "Failed to refresh session", http.StatusInternalServerError)
			return
		}

		// Attach user ID to the request context
		ctx := context.WithValue(r.Context(), "userID", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

func UserDataAllowedMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get the user ID from the request context
		userId, err := strconv.ParseUint(r.Context().Value("userID").(string), 10, 32)
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}

		// Get the resource ID from the URL path
		id := r.PathValue("id")
		// if id == "" {
		// 	http.Error(w, "Resource ID is required", http.StatusBadRequest)
		// 	return
		// }

		// Check the URL path using regex to determine the type of resource
		switch {
		case controllers.IsCommentIdURL(r.URL.Path):
			if !controllers.ValidateCommentIdOwnership(w, id, uint(userId)) {
				return
			}

		case controllers.IsVideoIdURL(r.URL.Path):
			if !controllers.ValidateVideoIdOwnership(w, id, uint(userId)) {
				return
			}

		case controllers.IsVideoURL(r.URL.Path):
			if !controllers.ValidateVideosOwnership(w, uint(userId)) {
				return
			}

		default:
			http.Error(w, "Invalid resource type", http.StatusBadRequest)
			return
		}

		// If the resource belongs to the user, proceed to the next handler
		next.ServeHTTP(w, r)
	}
}

type Middleware func(http.Handler) http.HandlerFunc

func MiddlewareChain(middlewares ...Middleware) Middleware {
	return func(next http.Handler) http.HandlerFunc {
		for _, middleware := range middlewares {
			next = middleware(next)
		}
		return next.ServeHTTP
	}
}
