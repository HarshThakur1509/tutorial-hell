package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/HarshThakur1509/tutorial-hell/backend/initializers"
	"github.com/HarshThakur1509/tutorial-hell/backend/models"
	"github.com/markbates/goth/gothic"
	"golang.org/x/crypto/bcrypt"
)

func CustomRegister(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string
		Password string
		Name     string
	}

	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, "Failed to Read Body", http.StatusBadRequest)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)

	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusBadRequest)
		return

	}

	user := models.User{Email: body.Email, Password: string(hash), Name: body.Name}

	result := initializers.DB.FirstOrCreate(&user, "email = ?", user.Email)
	if result.Error != nil {
		http.Error(w, "Failed to Create User", http.StatusBadRequest)
		return

	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "Signup successful"})
}

func CustomLogin(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string
		Password string
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, "Failed to Read body", http.StatusBadRequest)
		return
	}

	var user models.User
	initializers.DB.First(&user, "email = ?", body.Email)

	if user.ID == 0 {
		http.Error(w, "Invalid email or password", http.StatusBadRequest)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusBadRequest)
		return
	}

	// Save user ID in the session
	var id string = strconv.FormatUint(uint64(user.ID), 10)
	err = gothic.StoreInSession("user_id", id, r, w)
	if err != nil {
		http.Error(w, "Failed to save session", http.StatusInternalServerError)
		log.Println(err)
		return
	}

	// Return an empty JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "Login successful"})
}

func ValidateUser(w http.ResponseWriter, r *http.Request) {
	// Get user from the context
	userID := r.Context().Value("userID")

	// Return an empty JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]interface{}{"userID": userID})
}
