package httpapp

import (
	"inventory-docs-portal/internal/modules/documents"

	"github.com/gofiber/fiber/v2"
)

type Deps struct {
	DocHandler documents.Handler
}

func Register(app *fiber.App, deps Deps) {
	api := app.Group("/api")
	documents.RegisterRoutes(api, deps.DocHandler)
}
