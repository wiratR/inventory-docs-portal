package http

import (
	"time"

	"inventory-docs-portal/internal/config"
	"inventory-docs-portal/internal/modules/auth"
	"inventory-docs-portal/internal/modules/documents"

	"github.com/gofiber/fiber/v2"
)

func Register(app *fiber.App, cfg config.Config, deps Deps) {
	api := app.Group("/api")

	// ---- Auth
	authRepo := auth.NewRepo(deps.DB)
	authHandler := auth.NewHandler(
		authRepo,
		cfg.JWTSecret,
		time.Duration(cfg.JWTExpiresMinutes)*time.Minute,
	)

	api.Post("/auth/login", authHandler.Login)

	apiAuth := api.Group("", RequireAuth(cfg.JWTSecret))
	apiAuth.Get("/auth/me", authHandler.Me)

	// (ถ้ามี routes อื่น ๆ ใน documents.RegisterRoutes ก็เรียกได้)
	documents.RegisterRoutes(apiAuth, deps.DocHandler)

	// read routes: ทุก role
	apiAuth.Get("/documents", deps.DocHandler.List)
	apiAuth.Get("/documents/:id/view", deps.DocHandler.ViewInline)
	apiAuth.Get("/documents/:id/download", deps.DocHandler.Download)

	// ✅ upload เฉพาะ admin/uploader
	apiWrite := apiAuth.Group("", RequireRole("admin", "uploader"))
	documents.RegisterUploadRoutes(apiWrite, deps.DocHandler)

}
