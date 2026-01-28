package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	AppName  string
	AppEnv   string
	HTTPPort string

	MaxUploadMB int64

	DatabaseURL string

	StorageDriver string // smb | webdav

	// SMB
	NASBasePath string

	// WebDAV
	WebDAVBaseURL string
	WebDAVUser    string
	WebDAVPass    string
	WebDAVTimeout time.Duration
}

func Load() Config {
	maxMB, _ := strconv.ParseInt(getenv("MAX_UPLOAD_MB", "50"), 10, 64)
	timeoutSec, _ := strconv.Atoi(getenv("WEBDAV_TIMEOUT_SECONDS", "60"))

	return Config{
		AppName:       getenv("APP_NAME", "inventory-docs-portal"),
		AppEnv:        getenv("APP_ENV", "dev"),
		HTTPPort:      getenv("HTTP_PORT", "8080"),
		MaxUploadMB:   maxMB,
		DatabaseURL:   getenv("DATABASE_URL", ""),
		StorageDriver: getenv("STORAGE_DRIVER", "webdav"),

		NASBasePath: getenv("NAS_BASE_PATH", "/mnt/nas/afc_docs"),

		WebDAVBaseURL: stringsTrimRightSlash(getenv("WEBDAV_BASE_URL", "")),
		WebDAVUser:    getenv("WEBDAV_USER", ""),
		WebDAVPass:    getenv("WEBDAV_PASS", ""),
		WebDAVTimeout: time.Duration(timeoutSec) * time.Second,
	}
}

func getenv(k, def string) string {
	v := os.Getenv(k)
	if v == "" {
		return def
	}
	return v
}

func stringsTrimRightSlash(s string) string {
	for len(s) > 0 && s[len(s)-1] == '/' {
		s = s[:len(s)-1]
	}
	return s
}
