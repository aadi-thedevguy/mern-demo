package routes

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func UserRoutes() http.Handler {
	r := chi.NewRouter()

	return r
}
