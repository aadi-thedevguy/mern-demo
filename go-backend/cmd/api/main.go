package main

import (
	"app/internal/server"
	"log"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	srv := server.NewServer()

	if err := srv.Start(); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
