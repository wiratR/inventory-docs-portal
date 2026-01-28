package storage

import (
	"errors"
	"io"
	"time"

	"inventory-docs-portal/internal/config"
)

type Driver string

const (
	DriverSMB    Driver = "smb"
	DriverWebDAV Driver = "webdav"
)

type Storage interface {
	Save(fileKey string, r io.Reader) error
	Open(fileKey string) (Stream, error)
}

type Stream struct {
	Reader      io.ReadCloser
	ContentType string
	Size        int64 // -1 if unknown
}

func NewFromConfig(cfg config.Config) (Storage, error) {
	switch Driver(cfg.StorageDriver) {
	case DriverSMB:
		if cfg.NASBasePath == "" {
			return nil, errors.New("NAS_BASE_PATH is required for smb driver")
		}
		return NewSMBStore(cfg.NASBasePath), nil

	case DriverWebDAV:
		if cfg.WebDAVBaseURL == "" || cfg.WebDAVUser == "" || cfg.WebDAVPass == "" {
			return nil, errors.New("WEBDAV_BASE_URL/WEBDAV_USER/WEBDAV_PASS are required for webdav driver")
		}
		timeout := cfg.WebDAVTimeout
		if timeout <= 0 {
			timeout = 60 * time.Second
		}
		return NewWebDAVStore(cfg.WebDAVBaseURL, cfg.WebDAVUser, cfg.WebDAVPass, timeout), nil

	default:
		return nil, errors.New("invalid STORAGE_DRIVER (use smb|webdav)")
	}
}
