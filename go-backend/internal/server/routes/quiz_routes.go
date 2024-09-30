package routes

import (
	"app/internal/controllers"
	"app/internal/server/middleware"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func QuizRoutes() http.Handler {
	r := chi.NewRouter()

	// Define routes with specific middleware
	r.With(middleware.Protect).Post("/", http.HandlerFunc(controllers.CreateQuiz))
	r.With(middleware.Protect).Get("/", http.HandlerFunc(controllers.GetQuizzes))
	r.With(middleware.Protect).Get("/edit/{id}", http.HandlerFunc(controllers.GetUserQuizById))
	r.With(middleware.Protect).Put("/{id}", http.HandlerFunc(controllers.UpdateQuiz))
	r.With(middleware.Protect).Delete("/{id}", http.HandlerFunc(controllers.DeleteQuiz))
	r.With(middleware.Protect).Get("/{id}/reports", http.HandlerFunc(controllers.GetQuizReports))
	r.Get("/{id}", http.HandlerFunc(controllers.GetQuizById))        // public to get quiz for users
	r.Post("/submit/{id}", http.HandlerFunc(controllers.SubmitQuiz)) // public to submit quiz answers

	return r
}
