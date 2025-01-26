package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/HarshThakur1509/tutorial-hell/backend/initializers"
	"github.com/HarshThakur1509/tutorial-hell/backend/models"
	"github.com/markbates/goth/gothic"
)

func GetUser(w http.ResponseWriter, r *http.Request) {

	// Get user from the context
	userID := r.Context().Value("userID")

	var user models.User
	initializers.DB.First(&user, "id = ?", userID)

	// Respond with user data
	json.NewEncoder(w).Encode(user)
}

func GoogleCallbackHandler(w http.ResponseWriter, r *http.Request) {

	// Finalize the authentication process
	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		http.Error(w, "Authentication failed", http.StatusUnauthorized)
		log.Println(err)
		return
	}

	// Save user to the database
	userModel := models.User{
		Name:  user.Name,
		Email: user.Email,
	}

	result := initializers.DB.FirstOrCreate(&userModel, "email = ?", userModel.Email)
	if result.Error != nil {
		http.Error(w, "Failed to Create User", http.StatusBadRequest)
		return

	}

	// Save user ID in the session
	var id string = strconv.FormatUint(uint64(userModel.ID), 10)
	err = gothic.StoreInSession("user_id", id, r, w)
	if err != nil {
		http.Error(w, "Failed to save session", http.StatusInternalServerError)
		log.Println(err)
		return
	}

	// Redirect to the secure area
	redirectSecure := os.Getenv("REDIRECT_SECURE")
	if redirectSecure == "" {
		redirectSecure = "https://youtube.harshthakur.site"
	}

	http.Redirect(w, r, redirectSecure, http.StatusFound)
}

func GothLogout(w http.ResponseWriter, r *http.Request) {
	// Clear session
	err := gothic.Logout(w, r)
	if err != nil {
		http.Error(w, "Failed to logout", http.StatusInternalServerError)
		return
	}

	// Redirect to login page
	http.Redirect(w, r, "/login", http.StatusTemporaryRedirect)
}
