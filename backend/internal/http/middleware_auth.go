package http

import (
	"strings"

	"inventory-docs-portal/internal/modules/auth"

	"github.com/gofiber/fiber/v2"
)

func RequireAuth(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		h := c.Get("Authorization")
		if h == "" || !strings.HasPrefix(h, "Bearer ") {
			return fiber.NewError(fiber.StatusUnauthorized, "missing bearer token")
		}
		token := strings.TrimPrefix(h, "Bearer ")
		claims, err := auth.VerifyJWT(secret, token)
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		c.Locals("claims", claims)
		return c.Next()
	}
}

func RequireRole(allowed ...string) fiber.Handler {
	allow := map[string]bool{}
	for _, a := range allowed {
		allow[a] = true
	}
	return func(c *fiber.Ctx) error {
		claims := c.Locals("claims").(*auth.Claims)
		if !allow[claims.Role] {
			return fiber.NewError(fiber.StatusForbidden, "forbidden")
		}
		return c.Next()
	}
}
