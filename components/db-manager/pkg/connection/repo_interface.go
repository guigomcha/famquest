package connection

import (
	"context"
)

/* What is ctx ?
   ctx carries request-scoped values:
   - deadline / cancellation (from http.Request.Context())
   - logger, user-id, tracing info (we can inject via middleware)
   Every repo method accepts ctx as first param so we can:
   - timeout slow queries
   - propagate cancellation when client closes connection
   - pass request-scoped data without globals
*/

// CRUD is the minimal interface every repository must satisfy.
type CRUD[T any] interface {
	Create(ctx context.Context, entity T) (T, error)
	Get(ctx context.Context, id string) (T, error)
	Update(ctx context.Context, id string, entity T) (T, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, limit, offset int) ([]T, int, error)
}
