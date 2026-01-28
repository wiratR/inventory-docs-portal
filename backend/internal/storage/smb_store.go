package storage

import (
	"io"
	"os"
	"path/filepath"
)

type SMBStore struct {
	BasePath string
}

func NewSMBStore(base string) *SMBStore {
	return &SMBStore{BasePath: base}
}

func (s *SMBStore) Save(fileKey string, r io.Reader) error {
	key, err := SafeKey(fileKey)
	if err != nil {
		return err
	}

	full := filepath.Join(s.BasePath, filepath.FromSlash(key))
	if err := os.MkdirAll(filepath.Dir(full), 0750); err != nil {
		return err
	}

	f, err := os.Create(full)
	if err != nil {
		return err
	}
	defer f.Close()

	_, err = io.Copy(f, r)
	return err
}

func (s *SMBStore) Open(fileKey string) (Stream, error) {
	key, err := SafeKey(fileKey)
	if err != nil {
		return Stream{}, err
	}

	full := filepath.Join(s.BasePath, filepath.FromSlash(key))
	f, err := os.Open(full)
	if err != nil {
		return Stream{}, err
	}

	st, err := f.Stat()
	if err != nil {
		_ = f.Close()
		return Stream{}, err
	}

	return Stream{Reader: f, ContentType: "", Size: st.Size()}, nil
}
