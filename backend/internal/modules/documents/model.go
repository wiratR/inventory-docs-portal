package documents

import "time"

type Document struct {
	ID        string    `json:"id"`
	SKU       string    `json:"sku"`
	DocType   string    `json:"docType"`
	Version   string    `json:"version"`
	Title     string    `json:"title"`
	Status    string    `json:"status"`
	FileKey   string    `json:"fileKey"`
	FileName  string    `json:"fileName"`
	MimeType  string    `json:"mimeType"`
	FileSize  int64     `json:"fileSize"`
	Checksum  string    `json:"checksum"`
	CreatedBy string    `json:"createdBy"`
	CreatedAt time.Time `json:"createdAt"`
}
