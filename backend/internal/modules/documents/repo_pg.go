package documents

import (
	"database/sql"
	"errors"
)

type PGRepo struct {
	DB *sql.DB
}

func NewPGRepo(db *sql.DB) *PGRepo {
	return &PGRepo{DB: db}
}

func (r *PGRepo) Create(doc Document) (string, error) {
	var id string
	err := r.DB.QueryRow(`
		insert into documents
		  (sku, type, title, version, status, file_key, file_name, mime_type, file_size, checksum, created_by)
		values
		  ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
		returning id
	`,
		doc.SKU,
		doc.DocType,
		doc.Title,
		doc.Version,
		doc.Status,
		doc.FileKey,
		doc.FileName,
		doc.MimeType,
		doc.FileSize,
		doc.Checksum,
		doc.CreatedBy,
	).Scan(&id)

	return id, err
}

func (r *PGRepo) GetByID(id string) (Document, error) {
	var d Document
	err := r.DB.QueryRow(`
		select id, sku, type, version, title, status, file_key, file_name, mime_type, file_size, checksum, created_by, created_at
		from documents
		where id = $1
	`, id).Scan(
		&d.ID,
		&d.SKU,
		&d.DocType,
		&d.Version,
		&d.Title,
		&d.Status,
		&d.FileKey,
		&d.FileName,
		&d.MimeType,
		&d.FileSize,
		&d.Checksum,
		&d.CreatedBy,
		&d.CreatedAt,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return Document{}, errors.New("not found")
	}
	return d, err
}
