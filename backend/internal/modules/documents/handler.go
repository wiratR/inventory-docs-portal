package documents

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"fmt"
	"io"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	Svc       *Service
	MaxUpload int64 // bytes

	// ✅ Option A: signed link
	SignedSecret string        // ใช้ JWT_SECRET ได้
	SignedTTL    time.Duration // เช่น 10 * time.Minute
}

func NewHandler(svc *Service, maxUploadMB int64) Handler {
	return Handler{
		Svc:       svc,
		MaxUpload: maxUploadMB * 1024 * 1024,
	}
}

func NewHandlerWithSignedLink(svc *Service, maxUploadMB int64, secret string, ttl time.Duration) Handler {
	return Handler{
		Svc:          svc,
		MaxUpload:    maxUploadMB * 1024 * 1024,
		SignedSecret: secret,
		SignedTTL:    ttl,
	}
}

// -------------------------------
// Upload (protected: admin/uploader)
// -------------------------------

func (h Handler) Upload(c *fiber.Ctx) error {
	sku := strings.TrimSpace(c.FormValue("sku"))
	docType := strings.TrimSpace(c.FormValue("docType"))
	version := strings.TrimSpace(c.FormValue("version"))
	title := strings.TrimSpace(c.FormValue("title"))

	if sku == "" || docType == "" || version == "" {
		return fiber.NewError(fiber.StatusBadRequest, "sku, docType, version are required")
	}

	fh, err := c.FormFile("file")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "file is required")
	}
	if fh.Size > h.MaxUpload {
		return fiber.NewError(fiber.StatusRequestEntityTooLarge, "file too large")
	}

	src, err := fh.Open()
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "cannot open file")
	}
	defer src.Close()

	mime := fh.Header.Get("Content-Type")

	doc, err := h.Svc.Upload(sku, docType, version, title, fh.Filename, mime, fh.Size, src)
	if err != nil {
		return fiber.NewError(fiber.StatusBadGateway, err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(doc)
}

// -------------------------------
// View / Download (protected)
// -------------------------------
// GET /api/documents/:id/view
func (h Handler) ViewInline(c *fiber.Ctx) error {
	id := c.Params("id")

	doc, err := h.Svc.Get(id)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "document not found")
	}

	stream, err := h.Svc.OpenFile(doc.FileKey)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "file not found")
	}
	defer stream.Reader.Close()

	// ✅ อ่านเป็น bytes (กันปัญหา stream ตัด)
	b, err := io.ReadAll(stream.Reader)
	if err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "read file failed")
	}

	ct := doc.MimeType
	if stream.ContentType != "" {
		ct = stream.ContentType
	}
	if ct == "" {
		ct = "application/octet-stream"
	}

	c.Set("Content-Type", ct)
	c.Set("Content-Disposition", "inline; filename*=UTF-8''"+url.PathEscape(doc.FileName))
	c.Set("Content-Length", strconv.Itoa(len(b)))

	return c.Send(b)
}

// GET /api/documents/:id/download
func (h Handler) Download(c *fiber.Ctx) error {
	id := c.Params("id")

	doc, err := h.Svc.Get(id)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "document not found")
	}

	stream, err := h.Svc.OpenFile(doc.FileKey)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "file not found")
	}
	defer stream.Reader.Close()

	b, err := io.ReadAll(stream.Reader)
	if err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "read file failed")
	}

	ct := doc.MimeType
	if stream.ContentType != "" {
		ct = stream.ContentType
	}
	if ct == "" {
		ct = "application/octet-stream"
	}

	c.Set("Content-Type", ct)
	c.Set("Content-Disposition", "attachment; filename*=UTF-8''"+url.PathEscape(doc.FileName))
	c.Set("Content-Length", strconv.Itoa(len(b)))

	return c.Send(b)
}

// -------------------------------
// List (protected)
// -------------------------------

func (h Handler) List(c *fiber.Ctx) error {
	q := c.Query("q", "")
	docType := c.Query("docType", "")
	sort := c.Query("sort", "createdAt")
	order := c.Query("order", "desc")

	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	offset, _ := strconv.Atoi(c.Query("offset", "0"))

	if limit <= 0 || limit > 200 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	items, total, err := h.Svc.List(c.Context(), ListParams{
		Q:       q,
		DocType: docType,
		Sort:    sort,
		Order:   order,
		Limit:   limit,
		Offset:  offset,
	})
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.JSON(fiber.Map{
		"items":  items,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// ==========================================================
// ✅ Option A: Signed Link (public view/download)
// ==========================================================

func (h Handler) requireSignedEnabled() error {
	if strings.TrimSpace(h.SignedSecret) == "" || h.SignedTTL <= 0 {
		return fmt.Errorf("signed link disabled: set SignedSecret and SignedTTL")
	}
	return nil
}

func signedPayload(docID, mode string, exp int64) string {
	return fmt.Sprintf("%s:%s:%d", docID, mode, exp)
}

func sign(secret, payload string) string {
	m := hmac.New(sha256.New, []byte(secret))
	m.Write([]byte(payload))
	return hex.EncodeToString(m.Sum(nil))
}

func verify(secret, payload, sig string) bool {
	want := sign(secret, payload)
	if len(want) != len(sig) {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(want), []byte(sig)) == 1
}

// GET /api/documents/:id/link?type=view|download  (protected)
func (h Handler) Link(c *fiber.Ctx) error {
	if err := h.requireSignedEnabled(); err != nil {
		return fiber.NewError(fiber.StatusNotImplemented, err.Error())
	}

	id := c.Params("id")
	t := strings.ToLower(strings.TrimSpace(c.Query("type", "view")))
	if t != "view" && t != "download" {
		return fiber.NewError(fiber.StatusBadRequest, "type must be view or download")
	}

	if _, err := h.Svc.Get(id); err != nil {
		return fiber.NewError(fiber.StatusNotFound, "document not found")
	}

	exp := time.Now().Add(h.SignedTTL).Unix()
	payload := signedPayload(id, t, exp)
	sig := sign(h.SignedSecret, payload)

	publicPath := "/api/public/documents/" + url.PathEscape(id) + "/" + t
	full := publicPath + "?exp=" + strconv.FormatInt(exp, 10) + "&sig=" + url.QueryEscape(sig)

	return c.JSON(fiber.Map{
		"url":       full,
		"expiresAt": exp,
	})
}

// GET /api/public/documents/:id/view?exp=...&sig=... (public)
func (h Handler) PublicView(c *fiber.Ctx) error {
	if err := h.requireSignedEnabled(); err != nil {
		return fiber.NewError(fiber.StatusNotImplemented, err.Error())
	}
	if err := h.verifySignedQuery(c, "view"); err != nil {
		return err
	}
	return h.ViewInline(c)
}

// GET /api/public/documents/:id/download?exp=...&sig=... (public)
func (h Handler) PublicDownload(c *fiber.Ctx) error {
	if err := h.requireSignedEnabled(); err != nil {
		return fiber.NewError(fiber.StatusNotImplemented, err.Error())
	}
	if err := h.verifySignedQuery(c, "download"); err != nil {
		return err
	}
	return h.Download(c)
}

func (h Handler) verifySignedQuery(c *fiber.Ctx, mode string) error {
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

	id := c.Params("id")
	payload := signedPayload(id, mode, exp)
	if !verify(h.SignedSecret, payload, sig) {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid signature")
	}
	return nil
}
