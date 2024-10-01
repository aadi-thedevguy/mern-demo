package handlers

import (
	"app/internal/helpers"
	"app/internal/repository"
	"context"
	"encoding/json"
	"net/http"
)

type UserHandler struct {
	repo *repository.UserRepository
}

func NewUserHandler(repo *repository.UserRepository) *UserHandler {
	return &UserHandler{repo: repo}
}

func (h *UserHandler) RegisterUser(w http.ResponseWriter, r *http.Request) {

	var user repository.User
	decodeError := json.NewDecoder(r.Body).Decode(&user)
	if decodeError != nil {
		helpers.HandleError(w, decodeError, http.StatusBadRequest)
		return
	}
	if err := h.repo.InsertUser(context.Background(), &user); err != nil {
		helpers.HandleError(w, err, http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)

}
func (h *UserHandler) LoginUser(w http.ResponseWriter, r *http.Request) {

}
