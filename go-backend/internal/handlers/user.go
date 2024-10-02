package handlers

import (
	"app/internal/helpers"
	"app/internal/repository"
	"encoding/json"
	"net/http"
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
		helpers.HandleError(w, err, http.StatusInternalServerError)
	}

	err := h.userRepo.InsertUser(r.Context(), &user)

	if err != nil {
		helpers.HandleError(w, err, http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	// json.NewEncoder(w).Encode(user.ID)
}

func (h *UserHandler) LoginUser(w http.ResponseWriter, r *http.Request) {

}
