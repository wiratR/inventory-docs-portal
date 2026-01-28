package main

import (
	"log"

	"inventory-docs-portal/internal/config"
	"inventory-docs-portal/internal/db"
	httpapp "inventory-docs-portal/internal/http"
	"inventory-docs-portal/internal/modules/documents"
	"inventory-docs-portal/internal/storage"
)

func main() {
	cfg := config.Load()

	// DB
	pg, err := db.Open(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	if err := db.Migrate(pg, "./migrations"); err != nil {
		log.Fatal(err)
	}

	// Storage
	store, err := storage.NewFromConfig(cfg)
	if err != nil {
		log.Fatal(err)
	}

	// Modules
	docRepo := documents.NewPGRepo(pg)
	docSvc := documents.NewService(docRepo, store)
	docHandler := documents.NewHandler(docSvc, cfg.MaxUploadMB)

	// HTTP
	app := httpapp.New(cfg)
	httpapp.Register(app, httpapp.Deps{
		DocHandler: docHandler,
	})

	log.Printf("%s listening on :%s (storage=%s)", cfg.AppName, cfg.HTTPPort, cfg.StorageDriver)
	log.Fatal(app.Listen(":" + cfg.HTTPPort))
}
