package helpers

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// GenerateJWT generates a JWT token with a given secret key and expiration time.
func GenerateJWT(secretKey string, claims jwt.MapClaims, expirationTime time.Duration) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token.Claims.(jwt.MapClaims)["exp"] = time.Now().Add(expirationTime).Unix()
	return token.SignedString([]byte(secretKey))
}

// RetrieveJWT parses and validates a JWT token with a given secret key.
func RetrieveJWT(tokenString string, secretKey string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secretKey), nil
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
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
