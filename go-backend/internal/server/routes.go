package server

import (
	"app/internal/handlers"
	"app/internal/helpers"
	"app/internal/repository"
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

	userRepo := repository.NewUserRepository(s.db.GetCollection("users"))
	quizRepo := repository.NewQuizRepository(s.db.GetCollection("quizzes"))

	// User routes
	userHandler := handlers.NewUserHandler(*userRepo)
	r.Route("/api/users", func(r chi.Router) {
		r.Post("/", userHandler.RegisterUser)
		r.Post("/auth", userHandler.LoginUser)
	})

	// Quiz routes
	quizHandler := handlers.NewQuizHandler(*userRepo, *quizRepo)
	r.Route("/api/quizzes", func(r chi.Router) {
		r.With(helpers.Protect).Post("/", quizHandler.CreateQuiz)
		r.With(helpers.Protect).Get("/", quizHandler.GetQuizzes)
		r.With(helpers.Protect).Get("/edit/{id}", quizHandler.GetUserQuizById)
		r.With(helpers.Protect).Put("/{id}", quizHandler.UpdateQuiz)
		r.With(helpers.Protect).Delete("/{id}", quizHandler.DeleteQuiz)
		r.With(helpers.Protect).Get("/{id}/reports", quizHandler.GetQuizReports)
		r.Get("/{id}", quizHandler.GetQuizById)
		r.Post("/submit/{id}", quizHandler.SubmitQuiz)
	})

	r.NotFoundHandler()

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
