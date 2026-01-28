package httpapp

import (
	"inventory-docs-portal/internal/config"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func New(cfg config.Config) *fiber.App {
	app := fiber.New(fiber.Config{
		BodyLimit: int(cfg.MaxUploadMB * 1024 * 1024),
	})
	app.Use(logger.New())

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("ok")
	})

	return app
}
