package server

import (
	"app/internal/handlers"
	"app/internal/helpers"
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := chi.NewRouter()

	// A good base middleware stack
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Basic CORS
	// for more ideas, see: https://developer.github.com/v3/#cross-origin-resource-sharing
	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Get("/health", s.healthHandler)
	// r.Route("/api/users", func(r chi.Router) {
	// 	r.Post("/", http.HandlerFunc(handlers.Register))
	// 	r.Post("/auth", http.HandlerFunc(handlers.Login))
	// })

	r.Route("/api/quizzes", func(r chi.Router) {

		// Define routes with specific middleware
		r.With(helpers.Protect).Post("/", http.HandlerFunc(handlers.CreateQuiz))
		r.With(helpers.Protect).Get("/", http.HandlerFunc(handlers.GetQuizzes))
		r.With(helpers.Protect).Get("/edit/{id}", http.HandlerFunc(handlers.GetUserQuizById))
		r.With(helpers.Protect).Put("/{id}", http.HandlerFunc(handlers.UpdateQuiz))
		r.With(helpers.Protect).Delete("/{id}", http.HandlerFunc(handlers.DeleteQuiz))
		r.With(helpers.Protect).Get("/{id}/reports", http.HandlerFunc(handlers.GetQuizReports))
		r.Get("/{id}", http.HandlerFunc(handlers.GetQuizById))        // public to get quiz for users
		r.Post("/submit/{id}", http.HandlerFunc(handlers.SubmitQuiz)) // public to submit quiz answers
	})

	r.NotFoundHandler()
	r.MethodNotAllowedHandler()

	return r
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	jsonResp, _ := json.Marshal(s.db.Health())
	_, _ = w.Write(jsonResp)
}
