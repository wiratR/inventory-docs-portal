package main

import (
	"log"
	"time"

	"inventory-docs-portal/internal/config"
	"inventory-docs-portal/internal/db"
	httpserver "inventory-docs-portal/internal/http"
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

	// Documents module
	docRepo := documents.NewPGRepo(pg)
	docSvc := documents.NewService(docRepo, store)

	// ✅ Option A: Signed link (ใช้ JWT_SECRET เป็น secret ได้)
	// แนะนำ TTL 5-15 นาที
	docHandler := documents.NewHandlerWithSignedLink(
		docSvc,
		cfg.MaxUploadMB,
		cfg.JWTSecret,
		10*time.Minute,
	)

	// HTTP server (wire ทุกอย่างที่นี่)
	app := httpserver.New(cfg, httpserver.Deps{
		DB:         pg,
		DocHandler: docHandler,
	})

	log.Printf(
		"%s listening on :%s (storage=%s)",
		cfg.AppName,
		cfg.HTTPPort,
		cfg.StorageDriver,
	)
	log.Fatal(app.Listen(":" + cfg.HTTPPort))
}
