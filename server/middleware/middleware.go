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

const SECRET = "l41^*&vjah4#%4565c4vty%#8b84"

type wrappedWrite struct {
	http.ResponseWriter
	statusCode int
}

func (w *wrappedWrite) writeHeader(statusCode int) {
	w.ResponseWriter.WriteHeader(statusCode)
	w.statusCode = statusCode
}

func Logger(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		wrapped := &wrappedWrite{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}
		next.ServeHTTP(wrapped, r)
		log.Println(wrapped.statusCode, r.Method, r.URL.Path, time.Since(start))
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

func UserDataAllowedMiddleware(next http.Handler) http.HandlerFunc {
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
