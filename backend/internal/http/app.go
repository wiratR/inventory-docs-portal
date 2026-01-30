package http

import (
	"inventory-docs-portal/internal/config"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	frecover "github.com/gofiber/fiber/v2/middleware/recover"
)

func New(cfg config.Config, deps Deps) *fiber.App {
	app := fiber.New(fiber.Config{
		BodyLimit: int(cfg.MaxUploadMB * 1024 * 1024),
	})

	app.Use(frecover.New()) // ✅ สำคัญมาก จะเห็น panic
	app.Use(logger.New())   // (ถ้ายังไม่ได้ใส่)

	// ✅ CORS ต้องมาก่อน routes
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Authorization,Content-Type,Accept,Origin",
		ExposeHeaders:    "Content-Disposition",
		AllowCredentials: false, // ถ้าไม่ได้ใช้ cookie ให้ false
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("ok")
	})

	Register(app, cfg, deps)
	return app
}
