package main

import (
	"app/internal/server"
	"log"
)

func main() {

	srv := server.NewServer()

	if err := srv.Start(); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
