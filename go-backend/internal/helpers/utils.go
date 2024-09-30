package helpers

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Message string `json:"message"`
}

func HandleError(w http.ResponseWriter, err error, statusCode int) {
	w.WriteHeader(statusCode)
	response := ErrorResponse{Message: err.Error()}
	json.NewEncoder(w).Encode(response)
}
