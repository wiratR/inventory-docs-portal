package http

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

type SignedLinkConfig struct {
	Secret string
	TTL    time.Duration
}

// payload ที่เอาไป sign (ต้อง stable)
func signedPayload(docID string, mode string, exp int64) string {
	return fmt.Sprintf("%s:%s:%d", docID, mode, exp)
}

func sign(secret, payload string) string {
	m := hmac.New(sha256.New, []byte(secret))
	m.Write([]byte(payload))
	return hex.EncodeToString(m.Sum(nil))
}

func verify(secret, payload, sig string) bool {
	want := sign(secret, payload)

	// constant-time compare
	if len(want) != len(sig) {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(want), []byte(sig)) == 1
}

// Middleware สำหรับ public routes: ต้องมี exp + sig
func RequireSignedLink(cfg SignedLinkConfig, mode string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		expStr := c.Query("exp", "")
		sig := c.Query("sig", "")
		if expStr == "" || sig == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "missing exp/sig")
		}

		exp, err := strconv.ParseInt(expStr, 10, 64)
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid exp")
		}

		if time.Now().Unix() > exp {
			return fiber.NewError(fiber.StatusUnauthorized, "link expired")
		}

		docID := c.Params("id")
		payload := signedPayload(docID, mode, exp)

		if !verify(cfg.Secret, payload, sig) {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid signature")
		}

		return c.Next()
	}
}
