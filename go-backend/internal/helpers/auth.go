package helpers

import (
	// "app/internal/database"
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = os.Getenv("JWT_SECRET")

// GenerateJWT generates a JWT token with a given secret key and expiration time.
func GenerateJWT(claims jwt.MapClaims, expirationTime time.Duration) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token.Claims.(jwt.MapClaims)["exp"] = time.Now().Add(expirationTime).Unix()
	return token.SignedString([]byte(jwtSecret))
}

// RetrieveJWT parses and validates a JWT token with a given secret key.
func RetrieveJWT(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(jwtSecret), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid token")
}

// HashPassword hashes a password using bcrypt.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash checks if the provided password matches the hashed password.
func CheckPasswordHash(password, hash string) bool {
	// Debug logs
	fmt.Printf("DEBUG - CheckPasswordHash called\n")
	fmt.Printf("DEBUG - Password length: %d, Hash length: %d\n", len(password), len(hash))
	
	// Check if hash is a valid bcrypt hash
	if len(hash) < 60 { // bcrypt hashes are always 60 chars long
		fmt.Printf("DEBUG - Invalid hash length: %d\n", len(hash))
		return false
	}

	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		fmt.Printf("DEBUG - Password comparison failed: %v\n", err)
		return false
	}
	
	fmt.Println("DEBUG - Password matches hash")
	return true
}

// Context key type for request values
type contextKey string

// UserIDKey is the key used to store the user ID in the request context
const UserIDKey contextKey = "userId"

// Custom Auth Middleware
func Protect(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			errMsg := "missing authorization header"
			HandleError(w, errors.New(errMsg), http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == "" {
			errMsg := "bearer token not found"
			HandleError(w, errors.New(errMsg), http.StatusUnauthorized)
			return
		}

		claims, err := RetrieveJWT(tokenString)
		if err != nil {
			errMsg := fmt.Sprintf("invalid token: %v", err)
			HandleError(w, errors.New(errMsg), http.StatusUnauthorized)
			return
		}
		fmt.Println(claims)
		// Get user ID from claims
		userID, ok := claims["userId"].(string)
		if !ok || userID == "" {
			errMsg := "user ID not found in token claims"
			HandleError(w, errors.New(errMsg), http.StatusUnauthorized)
			return
		}

		fmt.Printf("Authenticated user ID: %s", userID)

		// Store the user ID as a string in the context
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		fmt.Println(ctx)

		// Verify the value was set in the context
		if ctxVal, ok := ctx.Value(UserIDKey).(string); !ok || ctxVal != userID {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
