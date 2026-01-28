package storage

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type WebDAVStore struct {
	BaseURL string
	User    string
	Pass    string
	Client  *http.Client
}

func NewWebDAVStore(baseURL, user, pass string, timeout time.Duration) *WebDAVStore {
	baseURL = strings.TrimRight(baseURL, "/")
	return &WebDAVStore{
		BaseURL: baseURL,
		User:    user,
		Pass:    pass,
		Client:  &http.Client{Timeout: timeout},
	}
}

// Save file via WebDAV PUT (auto create directories using MKCOL)
func (w *WebDAVStore) Save(fileKey string, r io.Reader) error {
	key, err := SafeKey(fileKey)
	if err != nil {
		return err
	}

	// ensure parent directories exist
	if err := w.ensureDirs(key); err != nil {
		return err
	}

	req, err := http.NewRequest("PUT", w.BaseURL+"/"+key, r)
	if err != nil {
		return err
	}
	req.SetBasicAuth(w.User, w.Pass)

	resp, err := w.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
		return fmt.Errorf("webdav PUT failed: %s - %s", resp.Status, string(bytes.TrimSpace(b)))
	}

	return nil
}

// Open file via WebDAV GET
func (w *WebDAVStore) Open(fileKey string) (Stream, error) {
	key, err := SafeKey(fileKey)
	if err != nil {
		return Stream{}, err
	}

	req, err := http.NewRequest("GET", w.BaseURL+"/"+key, nil)
	if err != nil {
		return Stream{}, err
	}
	req.SetBasicAuth(w.User, w.Pass)

	resp, err := w.Client.Do(req)
	if err != nil {
		return Stream{}, err
	}

	if resp.StatusCode >= 400 {
		defer resp.Body.Close()
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
		return Stream{}, fmt.Errorf("webdav GET failed: %s - %s", resp.Status, string(bytes.TrimSpace(b)))
	}

	ct := resp.Header.Get("Content-Type")
	if ct == "" {
		ct = "application/octet-stream"
	}

	return Stream{
		Reader:      resp.Body,
		ContentType: ct,
		Size:        -1,
	}, nil
}

// ensureDirs creates all parent folders for the given key using MKCOL.
// Example key: products/ABC123/datasheet/v1/uuid_file.pdf
func (w *WebDAVStore) ensureDirs(key string) error {
	// strip filename
	lastSlash := strings.LastIndex(key, "/")
	if lastSlash <= 0 {
		return nil // no parent dir needed
	}
	dir := key[:lastSlash] // products/ABC123/datasheet/v1

	parts := strings.Split(dir, "/")
	cur := w.BaseURL
	for _, p := range parts {
		if p == "" {
			continue
		}
		cur = cur + "/" + p

		req, err := http.NewRequest("MKCOL", cur, nil)
		if err != nil {
			return err
		}
		req.SetBasicAuth(w.User, w.Pass)

		resp, err := w.Client.Do(req)
		if err != nil {
			return err
		}
		resp.Body.Close()

		// MKCOL responses:
		// 201 Created (created ok)
		// 405 Method Not Allowed (already exists)
		// 409 Conflict (parent missing) -> but we create sequentially so shouldn't happen
		// Some servers return 200/204 as well
		switch resp.StatusCode {
		case 200, 201, 204, 405:
			// ok
		default:
			return fmt.Errorf("webdav MKCOL failed: %s (url=%s)", resp.Status, cur)
		}
	}
	return nil
}
