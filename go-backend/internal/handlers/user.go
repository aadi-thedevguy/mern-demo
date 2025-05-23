package handlers

import (
	"app/internal/helpers"
	"app/internal/repository"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserHandler struct {
	userRepo repository.UserRepository
}

func NewUserHandler(userRepo repository.UserRepository) *UserHandler {
	return &UserHandler{userRepo: userRepo}
}

func (h *UserHandler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	var user repository.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		helpers.HandleError(w, err, http.StatusBadRequest)
		return
	}

	// Check if user already exists
	_, err := h.userRepo.FindUserByEmail(r.Context(), user.Email)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// User doesn't exist, proceed with registration
		} else {
			helpers.HandleError(w, err, http.StatusInternalServerError)
			return
		}
	} else {
		helpers.HandleError(w, errors.New("user already exists"), http.StatusConflict)
		return
	}

	// Hash password before saving
	hashedPassword, err := helpers.HashPassword(user.Password)
	if err != nil {
		helpers.HandleError(w, err, http.StatusInternalServerError)
		return
	}
	user.Password = hashedPassword

	err, insertedUser := h.userRepo.InsertUser(r.Context(), &user)
	if err != nil {
		helpers.HandleError(w, err, http.StatusInternalServerError)
		return
	}

	// Generate JWT token
	claims := jwt.MapClaims{
		"userId": insertedUser.ID,
	}
	token, err := helpers.GenerateJWT(claims, 24*time.Hour)
	if err != nil {
		helpers.HandleError(w, err, http.StatusInternalServerError)
		return
	}

	// Return success response with user ID
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": token,
		"_id":   insertedUser.ID,
		"name":  insertedUser.Name,
		"email": insertedUser.Email,
	})
}

func (h *UserHandler) LoginUser(w http.ResponseWriter, r *http.Request) {
	var user repository.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		helpers.HandleError(w, err, http.StatusInternalServerError)
		return
	}

	// Find user by email
	existingUser, err := h.userRepo.FindUserByEmail(r.Context(), user.Email)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			helpers.HandleError(w, errors.New("user not found"), http.StatusUnauthorized)
			return
		}
		helpers.HandleError(w, err, http.StatusInternalServerError)
		return
	}

	// Debug: Print the password and hash being compared
	fmt.Printf("DEBUG - Login attempt for user: %s\n", user.Email)
	fmt.Printf("DEBUG - Input password length: %d\n", len(user.Password))
	fmt.Printf("DEBUG - Stored hash length: %d\n", len(existingUser.Password))

	// Verify password
	match := helpers.CheckPasswordHash(user.Password, existingUser.Password)
	if !match {
		fmt.Printf("DEBUG - Password comparison failed for user: %s\n", user.Email)
		helpers.HandleError(w, errors.New("invalid credentials"), http.StatusUnauthorized)
		return
	}
	fmt.Printf("DEBUG - Password matched for user: %s\n", user.Email)

	// Generate JWT token
	claims := jwt.MapClaims{
		"userId": existingUser.ID,
	}
	token, err := helpers.GenerateJWT(claims, 24*time.Hour)
	if err != nil {
		helpers.HandleError(w, err, http.StatusInternalServerError)
		return
	}

	// Set response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": token,
		"_id":   existingUser.ID,
		"name":  existingUser.Name,
		"email": existingUser.Email,
	})
}
