package handlers

import (
	"app/internal/helpers"
	"app/internal/repository"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type QuizHandler struct {
	userRepo repository.UserRepository
	quizRepo repository.QuizRepository
}

func NewQuizHandler(userRepo repository.UserRepository, quizRepo repository.QuizRepository) *QuizHandler {
	return &QuizHandler{
		userRepo: userRepo,
		quizRepo: quizRepo,
	}
}

func (h *QuizHandler) CreateQuiz(w http.ResponseWriter, r *http.Request) {
	var quiz repository.Quiz
	if err := json.NewDecoder(r.Body).Decode(&quiz); err != nil {
		helpers.HandleError(w, err, http.StatusBadRequest)
		return
	}

	// Get user ID from context
	ctx := r.Context()
	userID, ok := ctx.Value(helpers.UserIDKey).(string)
	if !ok || userID == "" {
		helpers.HandleError(w, errors.New("user ID not found in context"), http.StatusInternalServerError)
		return
	}

	// Convert to ObjectID for database operation
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		helpers.HandleError(w, errors.New("invalid user ID format"), http.StatusBadRequest)
		return
	}

	quiz.CreatedBy = userObjectID
	if err := h.quizRepo.CreateQuiz(ctx, &quiz); err != nil {
		helpers.HandleError(w, err, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"quizId": quiz.ID.Hex()})
}

func (h *QuizHandler) GetQuizzes(w http.ResponseWriter, r *http.Request) {
	log.Println("GetQuizzes handler called")
	ctx := r.Context()
	
	// Log all context keys for debugging
	log.Printf("Context keys: %+v", ctx)
	
	// Get user ID from context
	userID, ok := ctx.Value(helpers.UserIDKey).(string)
	if !ok || userID == "" {
		errMsg := "user ID not found in context"
		log.Printf("Error: %s", errMsg)
		help, _ := fmt.Fprintf(w, "Context keys: %+v", ctx)
		log.Println(help)
		help2 := fmt.Sprintf("UserIDKey type: %T, value: %v", helpers.UserIDKey, helpers.UserIDKey)
		log.Println(help2)
		help3 := fmt.Sprintf("Context value type: %T, value: %v", ctx.Value(helpers.UserIDKey), ctx.Value(helpers.UserIDKey))
		log.Println(help3)
		help4 := fmt.Sprintf("Context value as string: %s", ctx.Value(helpers.UserIDKey))
		log.Println(help4)
		
		helpers.HandleError(w, errors.New(errMsg), http.StatusInternalServerError)
		return
	}

	log.Printf("Found user ID in context: %s", userID)

	// Convert to ObjectID for database operation
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		errMsg := fmt.Sprintf("invalid user ID format: %v", err)
		log.Printf("Error: %s", errMsg)
		help := fmt.Sprintf("User ID that failed to convert: %s", userID)
		log.Println(help)
		helpers.HandleError(w, errors.New("invalid user ID format"), http.StatusBadRequest)
		return
	}

	log.Printf("Converted user ID to ObjectID: %v", userObjectID)

	quizzes, err := h.quizRepo.GetQuizzes(ctx, userObjectID)
	if err != nil {
		errMsg := fmt.Sprintf("error getting quizzes: %v", err)
		log.Printf("Error: %s", errMsg)
		help := fmt.Sprintf("User ID that caused the error: %v", userObjectID)
		log.Println(help)
		helpers.HandleError(w, err, http.StatusInternalServerError)
		return
	}

	log.Printf("Successfully retrieved %d quizzes for user %s", len(quizzes), userID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(quizzes); err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}

func (h *QuizHandler) GetQuizById(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(helpers.UserIDKey).(string)
	if !ok || userID == "" {
		helpers.HandleError(w, errors.New("user ID not found in context"), http.StatusInternalServerError)
		return
	}

	// Convert to ObjectID for database operation
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		helpers.HandleError(w, errors.New("invalid user ID format"), http.StatusBadRequest)
		return
	}

	quizId := chi.URLParam(r, "id")
	id, err := primitive.ObjectIDFromHex(quizId)
	if err != nil {
		helpers.HandleError(w, err, http.StatusBadRequest)
		return
	}

	quiz, err := h.quizRepo.GetQuizById(ctx, id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			helpers.HandleError(w, errors.New("quiz not found"), http.StatusNotFound)
		} else {
			helpers.HandleError(w, err, http.StatusInternalServerError)
		}
		return
	}

	// Check if user owns the quiz
	if quiz.CreatedBy != userObjectID {
		helpers.HandleError(w, errors.New("unauthorized"), http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(quiz)
}

func (h *QuizHandler) UpdateQuiz(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Get user ID from context
	userID, ok := ctx.Value(helpers.UserIDKey).(string)
	if !ok || userID == "" {
		helpers.HandleError(w, errors.New("user ID not found in context"), http.StatusInternalServerError)
		return
	}

	// Convert to ObjectID for database operation
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		helpers.HandleError(w, errors.New("invalid user ID format"), http.StatusBadRequest)
		return
	}

	quizId := chi.URLParam(r, "id")
	id, err := primitive.ObjectIDFromHex(quizId)
	if err != nil {
		helpers.HandleError(w, err, http.StatusBadRequest)
		return
	}

	var quiz repository.Quiz
	if err := json.NewDecoder(r.Body).Decode(&quiz); err != nil {
		helpers.HandleError(w, err, http.StatusBadRequest)
		return
	}

	// Get existing quiz to check ownership
	existingQuiz, err := h.quizRepo.GetQuizById(ctx, id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			helpers.HandleError(w, errors.New("quiz not found"), http.StatusNotFound)
		} else {
			helpers.HandleError(w, err, http.StatusInternalServerError)
		}
		return
	}

	// Check if user owns the quiz
	if existingQuiz.CreatedBy != userObjectID {
		helpers.HandleError(w, errors.New("unauthorized"), http.StatusUnauthorized)
		return
	}

	quiz.ID = id
	quiz.CreatedBy = userObjectID
	if err := h.quizRepo.UpdateQuiz(ctx, id, &quiz); err != nil {
		helpers.HandleError(w, err, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *QuizHandler) DeleteQuiz(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(helpers.UserIDKey).(string)
	if !ok || userID == "" {
		helpers.HandleError(w, errors.New("user ID not found in context"), http.StatusInternalServerError)
		return
	}

	// Convert to ObjectID for database operation
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		helpers.HandleError(w, errors.New("invalid user ID format"), http.StatusBadRequest)
		return
	}

	quizId := chi.URLParam(r, "id")
	id, err := primitive.ObjectIDFromHex(quizId)
	if err != nil {
		helpers.HandleError(w, err, http.StatusBadRequest)
		return
	}

	// Get existing quiz to check ownership
	existingQuiz, err := h.quizRepo.GetQuizById(ctx, id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			helpers.HandleError(w, errors.New("quiz not found"), http.StatusNotFound)
		} else {
			helpers.HandleError(w, err, http.StatusInternalServerError)
		}
		return
	}

	// Check if user owns the quiz
	if existingQuiz.CreatedBy != userObjectID {
		helpers.HandleError(w, errors.New("unauthorized"), http.StatusUnauthorized)
		return
	}

	if err := h.quizRepo.DeleteQuiz(ctx, id); err != nil {
		helpers.HandleError(w, err, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *QuizHandler) GetQuizReports(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(helpers.UserIDKey).(string)
	if !ok || userID == "" {
		helpers.HandleError(w, errors.New("user ID not found in context"), http.StatusInternalServerError)
		return
	}

	// Convert to ObjectID for database operation
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		helpers.HandleError(w, errors.New("invalid user ID format"), http.StatusBadRequest)
		return
	}

	quizId := chi.URLParam(r, "id")
	id, err := primitive.ObjectIDFromHex(quizId)
	if err != nil {
		helpers.HandleError(w, err, http.StatusBadRequest)
		return
	}

	// Get existing quiz to check ownership
	existingQuiz, err := h.quizRepo.GetQuizById(ctx, id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			helpers.HandleError(w, errors.New("quiz not found"), http.StatusNotFound)
		} else {
			helpers.HandleError(w, err, http.StatusInternalServerError)
		}
		return
	}

	// Check if user owns the quiz
	if existingQuiz.CreatedBy != userObjectID {
		helpers.HandleError(w, errors.New("unauthorized"), http.StatusUnauthorized)
		return
	}

	reports, err := h.quizRepo.GetQuizReports(ctx, id)
	if err != nil {
		helpers.HandleError(w, err, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(reports)
}

func (h *QuizHandler) SubmitQuiz(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(helpers.UserIDKey).(string)
	if !ok || userID == "" {
		helpers.HandleError(w, errors.New("user ID not found in context"), http.StatusInternalServerError)
		return
	}

	// Convert to ObjectID for database operation
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		helpers.HandleError(w, errors.New("invalid user ID format"), http.StatusBadRequest)
		return
	}

	quizId := chi.URLParam(r, "id")
	id, err := primitive.ObjectIDFromHex(quizId)
	if err != nil {
		helpers.HandleError(w, err, http.StatusBadRequest)
		return
	}

	var submission QuizSubmission
	if err := json.NewDecoder(r.Body).Decode(&submission); err != nil {
		helpers.HandleError(w, err, http.StatusBadRequest)
		return
	}

	// Get quiz to verify answers
	quiz, err := h.quizRepo.GetQuizById(ctx, id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			helpers.HandleError(w, errors.New("quiz not found"), http.StatusNotFound)
		} else {
			helpers.HandleError(w, err, http.StatusInternalServerError)
		}
		return
	}

	// Calculate score
	score := 0
	for i, answer := range submission.Answers {
		if i < len(quiz.Questions) && quiz.Questions[i].CorrectAnswer == answer {
			score++
		}
	}

	// Create and save the quiz report
	report := repository.QuizReport{
		ID:        primitive.NewObjectID(),
		QuizId:    id,
		UserId:    userObjectID,
		Score:     score,
		CreatedAt: primitive.Timestamp{T: uint32(time.Now().Unix()), I: 0},
	}

	if err := h.quizRepo.CreateQuizReport(ctx, &report); err != nil {
		helpers.HandleError(w, err, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]int{"score": score})
}

type QuizSubmission struct {
	Answers []int `json:"answers"`
}

func CreateQuiz(w http.ResponseWriter, r *http.Request) {
	// Your logic here
	// Example error handling:
	// err := someFunction()
	// if err != nil {
	//     utils.HandleError(w, err, http.StatusInternalServerError)
	//     return
	// }
}

func GetQuizzes(w http.ResponseWriter, r *http.Request) {
	// Your logic here
}

func GetQuizById(w http.ResponseWriter, r *http.Request) {
	// Your logic here
}

func UpdateQuiz(w http.ResponseWriter, r *http.Request) {
	// Your logic here
}

func DeleteQuiz(w http.ResponseWriter, r *http.Request) {
	// Your logic here
}

func SubmitQuiz(w http.ResponseWriter, r *http.Request) {
	// Your logic here
}

func GetQuizReports(w http.ResponseWriter, r *http.Request) {
	// Your logic here
}

func GetUserQuizById(w http.ResponseWriter, r *http.Request) {
	// Your logic here
}
