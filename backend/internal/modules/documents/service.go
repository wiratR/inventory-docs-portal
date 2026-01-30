package documents

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"time"

	"inventory-docs-portal/internal/storage"
	"inventory-docs-portal/internal/utils"
)

type Repo interface {
	Create(doc Document) (string, error)
	GetByID(id string) (Document, error)

	// ✅ เพิ่มสำหรับ list
	List(ctx context.Context, p ListParams) ([]Document, int, error)
}

type Service struct {
	Repo  Repo
	Store storage.Storage
}

func NewService(repo Repo, store storage.Storage) *Service {
	return &Service{Repo: repo, Store: store}
}

func (s *Service) Upload(
	sku, docType, version, title,
	originalFileName, mime string,
	size int64,
	file io.Reader,
) (Document, error) {
	internalName := utils.NewUUID() + "_" + utils.SanitizeFileName(originalFileName)
	fileKey := "products/" + sku + "/" + docType + "/" + version + "/" + internalName

	hasher := sha256.New()
	tee := io.TeeReader(file, hasher)

	if err := s.Store.Save(fileKey, tee); err != nil {
		return Document{}, err
	}

	checksum := hex.EncodeToString(hasher.Sum(nil))
	if title == "" {
		title = originalFileName
	}
	if mime == "" {
		mime = "application/octet-stream"
	}

	doc := Document{
		SKU:       sku,
		DocType:   docType,
		Version:   version,
		Title:     title,
		Status:    "draft",
		FileKey:   fileKey,
		FileName:  originalFileName,
		MimeType:  mime,
		FileSize:  size,
		Checksum:  checksum,
		CreatedBy: "system",
		CreatedAt: time.Now(),
	}

	id, err := s.Repo.Create(doc)
	if err != nil {
		return Document{}, err
	}
	doc.ID = id
	return doc, nil
}

func (s *Service) Get(id string) (Document, error) {
	return s.Repo.GetByID(id)
}

func (s *Service) OpenFile(fileKey string) (storage.Stream, error) {
	return s.Store.Open(fileKey)
}

// ✅ List สำหรับ handler
func (s *Service) List(ctx context.Context, p ListParams) ([]Document, int, error) {
	return s.Repo.List(ctx, p)
}
