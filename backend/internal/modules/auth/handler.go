package auth

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type Handler struct {
	repo    *Repo
	secret  string
	expires time.Duration
}

func NewHandler(repo *Repo, secret string, expires time.Duration) *Handler {
	return &Handler{repo: repo, secret: secret, expires: expires}
}

type loginReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h *Handler) Login(c *fiber.Ctx) error {
	var req loginReq
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid body")
	}
	if req.Username == "" || req.Password == "" {
		return fiber.NewError(fiber.StatusBadRequest, "username/password required")
	}

	u, err := h.repo.FindByUsername(c.Context(), req.Username)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.Password)); err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid credentials")
	}

	token, err := SignJWT(h.secret, h.expires, u)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "sign token failed")
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user": fiber.Map{
			"id": u.ID, "username": u.Username, "role": u.Role,
		},
	})
}

func (h *Handler) Me(c *fiber.Ctx) error {
	claims := c.Locals("claims").(*Claims)
	return c.JSON(fiber.Map{
		"id": claims.UserID, "username": claims.Username, "role": claims.Role,
	})
}
