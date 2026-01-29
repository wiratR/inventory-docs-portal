package main

import (
	"context"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	timeoutSec := envInt("SEED_TIMEOUT_SECONDS", 30)

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeoutSec)*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("connect db failed: %v", err)
	}
	defer pool.Close()

	// ensure users table (idempotent)
	_, err = pool.Exec(ctx, `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','uploader','viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`)
	if err != nil {
		log.Fatalf("create users table failed: %v", err)
	}

	seedUser(ctx, pool, "admin", envOr("SEED_ADMIN_PASSWORD", "admin123"), "admin")
	seedUser(ctx, pool, "uploader", envOr("SEED_UPLOADER_PASSWORD", "uploader123"), "uploader")
	seedUser(ctx, pool, "viewer", envOr("SEED_VIEWER_PASSWORD", "viewer123"), "viewer")

	log.Println("✅ seed done")
}

func seedUser(ctx context.Context, pool *pgxpool.Pool, username, password, role string) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("bcrypt failed: %v", err)
	}

	id := uuid.New().String()

	// idempotent insert
	ct, err := pool.Exec(ctx, `
INSERT INTO users (id, username, password_hash, role)
VALUES ($1, $2, $3, $4)
ON CONFLICT (username) DO NOTHING
`, id, username, string(hash), role)

	if err != nil {
		log.Fatalf("seed user %s failed: %v", username, err)
	}

	if ct.RowsAffected() == 0 {
		log.Printf("ℹ️ user '%s' already exists (skip)", username)
	} else {
		log.Printf("✅ created user '%s' role=%s", username, role)
	}
}

func envOr(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func envInt(k string, def int) int {
	v := os.Getenv(k)
	if v == "" {
		return def
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return def
	}
	return n
}
