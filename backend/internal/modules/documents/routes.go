package documents

import "github.com/gofiber/fiber/v2"

func RegisterRoutes(r fiber.Router, h Handler) {
	// ตอนนี้ยังไม่มี read routes
	// เดี๋ยวค่อยเติมเมื่อ Handler มี ViewInline/Download
}
