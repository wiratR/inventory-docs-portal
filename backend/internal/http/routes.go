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

	// ---- Protected group
	apiAuth := api.Group("", RequireAuth(cfg.JWTSecret))
	apiAuth.Get("/auth/me", authHandler.Me)

	// ---- Documents (read routes: ทุก role)
	apiAuth.Get("/documents", deps.DocHandler.List)

	// ✅ route เดิม (protected) - จะยังใช้งานได้ผ่าน API client ที่ส่ง Bearer
	apiAuth.Get("/documents/:id/view", deps.DocHandler.ViewInline)
	apiAuth.Get("/documents/:id/download", deps.DocHandler.Download)

	// ✅ Signed link (protected) - เอาไว้ให้ FE ขอ URL ไปเปิดใน browser
	apiAuth.Get("/documents/:id/link", deps.DocHandler.Link)

	// ✅ upload เฉพาะ admin/uploader
	apiWrite := apiAuth.Group("", RequireRole("admin", "uploader"))
	documents.RegisterUploadRoutes(apiWrite, deps.DocHandler)

	// ---- Public routes (Option A): ไม่ต้อง Bearer token
	pub := api.Group("/public/documents")
	pub.Get("/:id/view", deps.DocHandler.PublicView)
	pub.Get("/:id/download", deps.DocHandler.PublicDownload)

	// (ถ้ามี routes อื่น ๆ ใน documents.RegisterRoutes ก็เรียกได้ แต่ตอนนี้คุณคอมเมนต์ไว้)
	// documents.RegisterRoutes(apiAuth, deps.DocHandler)
}
