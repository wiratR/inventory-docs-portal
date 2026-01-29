package documents

import (
	"net/url"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	Svc       *Service
	MaxUpload int64 // bytes
}

func NewHandler(svc *Service, maxUploadMB int64) Handler {
	return Handler{
		Svc:       svc,
		MaxUpload: maxUploadMB * 1024 * 1024,
	}
}

// POST /api/documents (multipart/form-data)
// fields: sku, docType, version, title(optional), file
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

	ct := doc.MimeType
	if stream.ContentType != "" {
		ct = stream.ContentType
	}

	c.Set("Content-Type", ct)
	c.Set("Content-Disposition", "inline; filename*=UTF-8''"+url.PathEscape(doc.FileName))
	return c.SendStream(stream.Reader)
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

	ct := doc.MimeType
	if stream.ContentType != "" {
		ct = stream.ContentType
	}

	c.Set("Content-Type", ct)
	c.Set("Content-Disposition", "attachment; filename*=UTF-8''"+url.PathEscape(doc.FileName))
	return c.SendStream(stream.Reader)
}

// GET /api/documents?q=&docType=&sort=&order=&limit=&offset=
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
