package middleware

import (
	"app/internal/database"
	"app/internal/helpers"
	"net/http"
	"os"
	"strings"
)

func Protect(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			helpers.HandleError(w, http.ErrNoCookie, http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := helpers.RetrieveJWT(tokenString, os.Getenv("JWT_SECRET"))

		if err != nil {
			helpers.HandleError(w, http.ErrNoCookie, http.StatusUnauthorized)
			return
		}

		userId := claims["userId"].(string)
		var user database.User

		// err = collection.FindOne(context.TODO(), bson.M{"_id": userId}).Decode(&user)
		// if err != nil {
		// 	helpers.HandleError(w, err, http.StatusUnauthorized)
		// 	return
		// }

		// ctx := context.WithValue(r.Context(), "user", user)
		// next.ServeHTTP(w, r.WithContext(ctx))

		next.ServeHTTP(w, r)
	})
}
