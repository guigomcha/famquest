package memory

import (
	"context"
	"errors"
	"famquest/components/go-common/logger"
	"reflect"
	"sort"
	"sync"

	"github.com/google/uuid"
)

// MemoryCRUD is a generic thread-safe in-memory store.
type MemoryCRUD[T any] struct {
	mu    sync.RWMutex
	store map[string]T
}

func NewMemoryCRUD[T any]() *MemoryCRUD[T] {
	return &MemoryCRUD[T]{store: make(map[string]T)}
}

func (m *MemoryCRUD[T]) Create(_ context.Context, e T) (T, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	id := uuid.New()
	// use reflection to set the ID field (assumed named ID)
	v := reflect.ValueOf(&e).Elem()
	if f := v.FieldByName("ID"); f.IsValid() && f.CanSet() {
		logger.Log.Debugf("Create in memory %+v", f)
		f.Set(reflect.ValueOf(id))
	}
	m.store[id.String()] = e
	return e, nil
}

func (m *MemoryCRUD[T]) Get(_ context.Context, id string) (T, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	v, ok := m.store[id]
	if !ok {
		return v, errors.New("not found")
	}
	return v, nil
}

func (m *MemoryCRUD[T]) Update(_ context.Context, id string, e T) (T, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.store[id]; !ok {
		return e, errors.New("not found")
	}
	m.store[id] = e
	return e, nil
}

func (m *MemoryCRUD[T]) Delete(_ context.Context, id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.store[id]; !ok {
		return errors.New("not found")
	}
	delete(m.store, id)
	return nil
}

func (m *MemoryCRUD[T]) List(_ context.Context, limit, offset int) ([]T, int, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	total := len(m.store)
	logger.Log.Debugf("Store %+v, total %d", m.store, total)
	if offset > total {
		return nil, total, nil
	}
	end := offset + limit
	if end > total {
		end = total
	}
	// iterate in deterministic order
	keys := make([]string, 0, total)
	for k := range m.store {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	out := make([]T, 0, end-offset)
	for _, k := range keys[offset:end] {
		out = append(out, m.store[k])
	}
	return out, total, nil
}
