package http

import (
	"inventory-docs-portal/internal/config"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func New(cfg config.Config, deps Deps) *fiber.App {
	app := fiber.New(fiber.Config{
		BodyLimit: int(cfg.MaxUploadMB * 1024 * 1024),
	})

	app.Use(logger.New())

	// ✅ CORS for Vite dev server
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("ok")
	})

	Register(app, cfg, deps)
	return app
}
