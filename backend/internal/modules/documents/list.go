package documents

import (
	"context"
	"fmt"
	"strings"
)

func (r *PGRepo) List(ctx context.Context, p ListParams) ([]Document, int, error) {
	// whitelist sort columns (DB column names)
	sortCol := map[string]string{
		"createdAt": "created_at",
		"sku":       "sku",
		"docType":   "type", // ✅ ของคุณชื่อ type
		"version":   "version",
		"title":     "title",
	}[p.Sort]
	if sortCol == "" {
		sortCol = "created_at"
	}

	order := strings.ToLower(strings.TrimSpace(p.Order))
	if order != "asc" && order != "desc" {
		order = "desc"
	}

	where := []string{"1=1"}
	args := []any{}
	i := 1

	if q := strings.TrimSpace(p.Q); q != "" {
		where = append(where, fmt.Sprintf("(sku ILIKE $%d OR title ILIKE $%d)", i, i+1))
		args = append(args, "%"+q+"%", "%"+q+"%")
		i += 2
	}

	if dt := strings.TrimSpace(p.DocType); dt != "" {
		where = append(where, fmt.Sprintf(`"type" = $%d`, i)) // ✅ ใส่ quote กัน reserved word
		args = append(args, dt)
		i++
	}

	// total
	countSQL := "SELECT COUNT(1) FROM documents WHERE " + strings.Join(where, " AND ")
	var total int
	if err := r.DB.QueryRowContext(ctx, countSQL, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// list
	listSQL := fmt.Sprintf(`
SELECT id, sku, "type", version, title, status, file_key, file_name, mime_type, file_size, checksum, created_by, created_at
FROM documents
WHERE %s
ORDER BY %s %s
LIMIT %d OFFSET %d
`, strings.Join(where, " AND "), sortCol, order, p.Limit, p.Offset)

	rows, err := r.DB.QueryContext(ctx, listSQL, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	out := []Document{}
	for rows.Next() {
		var d Document
		if err := rows.Scan(
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
		); err != nil {
			return nil, 0, err
		}
		out = append(out, d)
	}
	return out, total, rows.Err()
}
