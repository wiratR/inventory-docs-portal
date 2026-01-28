package storage

import (
	"errors"
	"path/filepath"
	"strings"
)

// Ensure key is relative and safe (no ../ , no absolute path)
func SafeKey(key string) (string, error) {
	if strings.TrimSpace(key) == "" {
		return "", errors.New("empty file key")
	}

	key = strings.ReplaceAll(key, "\\", "/")
	key = strings.TrimPrefix(key, "/")

	clean := filepath.ToSlash(filepath.Clean(key))
	if clean == "." || strings.Contains(clean, "..") || strings.HasPrefix(clean, "/") {
		return "", errors.New("invalid file key")
	}

	return clean, nil
}
