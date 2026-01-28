package utils

import (
	"regexp"

	"github.com/google/uuid"
)

var badChars = regexp.MustCompile(`[^a-zA-Z0-9._-]+`)

func NewUUID() string {
	return uuid.NewString()
}

func SanitizeFileName(name string) string {
	return badChars.ReplaceAllString(name, "_")
}
