package http

import (
	"database/sql"

	"inventory-docs-portal/internal/modules/documents"
)

type Deps struct {
	DB         *sql.DB
	DocHandler documents.Handler
}
