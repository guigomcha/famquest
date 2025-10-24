package utils

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
)

// // StrSliceToUUIDSlice converts []*string → UUIDArray (skip nils)
// func StrSliceToUUIDSlice(in []string) UUIDArray {
// 	out := make(UUIDArray, 0, len(in))
// 	for _, s := range in {
// 		if s == "" {
// 			continue
// 		}
// 		if uid, err := uuid.Parse(s); err == nil {
// 			out = append(out, uid)
// 		}
// 	}
// 	return out
// }

// UnixPtrToTime converts a *int64 (unix ms) → *time.Time
func UnixPtrToTime(ms *int64) *time.Time {
	if ms == nil {
		return nil
	}
	t := time.UnixMilli(*ms)
	return &t
}

// UnixToTime converts int64 (unix ms) → time.Time
func UnixToTime(ms int64) time.Time {
	return time.UnixMilli(ms)
}

// MustGetUserID returns the UUID of the authenticated user injected in context
func MustGetUserID(ctx context.Context) uuid.UUID {
	uid, _ := ctx.Value("userID").(uuid.UUID) // adapt to your middleware key
	return uid
}

func parseId(stringId string) (int, error) {
	intId, err := strconv.Atoi(stringId) //ParseInt(id, 0 , 64)
	if err != nil {
		return 0, err
	}
	return intId, nil
}

func WriteJSON(w http.ResponseWriter, code int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func GetLimitOffset(r *http.Request) (limit, offset int) {
	if v, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && v > 0 {
		limit = v
	} else {
		limit = 1000
	}
	if v, err := strconv.Atoi(r.URL.Query().Get("offset")); err == nil && v >= 0 {
		offset = v
	}
	return
}
