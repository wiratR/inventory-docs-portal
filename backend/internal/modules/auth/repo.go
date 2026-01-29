package auth

import (
	"context"
	"database/sql"
)

type Repo struct {
	db *sql.DB
}

func NewRepo(db *sql.DB) *Repo { return &Repo{db: db} }

func (r *Repo) FindByUsername(ctx context.Context, username string) (*User, error) {
	row := r.db.QueryRowContext(ctx, `
SELECT id, username, password_hash, role
FROM users
WHERE username = $1
`, username)

	var u User
	if err := row.Scan(&u.ID, &u.Username, &u.PasswordHash, &u.Role); err != nil {
		return nil, err
	}
	return &u, nil
}
