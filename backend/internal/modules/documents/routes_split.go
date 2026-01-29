package documents

import "github.com/gofiber/fiber/v2"

func RegisterUploadRoutes(r fiber.Router, h Handler) {
	r.Post("/documents", h.Upload)
}
