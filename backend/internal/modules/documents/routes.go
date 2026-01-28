package documents

import "github.com/gofiber/fiber/v2"

func RegisterRoutes(r fiber.Router, h Handler) {
	g := r.Group("/documents")
	g.Post("/", h.Upload)
	g.Get("/:id/view", h.ViewInline)
	g.Get("/:id/download", h.Download)
}
