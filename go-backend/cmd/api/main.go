package main

import (
	"app/internal/server"
	"fmt"
)

func main() {

	server := server.NewServer()
	fmt.Println("Server started on port: ", server.Addr)
	err := server.ListenAndServe()
	if err != nil {
		panic(fmt.Sprintf("cannot start server: %s", err))
	}
}
