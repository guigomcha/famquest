package postgresql

import (
	"context"
	"errors"
	"fmt"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type PostgresUser struct{ db *sqlx.DB }

func NewPostgresUser() *PostgresUser { return &PostgresUser{db: connection.DB} }

/* ---------- standard CRUD ---------- */

func (r *PostgresUser) Create(ctx context.Context, u models.User) (models.User, error) {
	const q = `INSERT INTO users (name,email,avatar,bio,ext_ref,is_virtual,memories,start_at,end_at)
	           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`
	row := r.db.QueryRowxContext(ctx, q,
		u.Name, u.Email, u.Avatar, u.Bio, u.ExtRef, u.IsVirtual, pq.Array(u.Memories), u.StartAt, u.EndAt)
	if err := row.StructScan(&u); err != nil {
		return u, fmt.Errorf("create user: %w", err)
	}
	return u, nil
}

func (r *PostgresUser) Get(ctx context.Context, id string) (models.User, error) {
	var u models.User
	err := r.db.GetContext(ctx, &u, "SELECT * FROM users WHERE id=$1", id)
	return u, err
}

func (r *PostgresUser) Update(ctx context.Context, id string, u models.User) (models.User, error) {
	const q = `UPDATE users
	           SET name=$1,email=$2,avatar=$3,bio=$4,ext_ref=$5,is_virtual=$6,memories=$7,start_at=$8,end_at=$9
	           WHERE id=$10 RETURNING *`
	row := r.db.QueryRowxContext(ctx, q,
		u.Name, u.Email, u.Avatar, u.Bio, u.ExtRef, u.IsVirtual, pq.Array(u.Memories), u.StartAt, u.EndAt, id)
	if err := row.StructScan(&u); err != nil {
		return u, fmt.Errorf("update user: %w", err)
	}
	return u, nil
}

/* ---------- DELETE with referential guard ---------- */

var ErrUserStillReferenced = errors.New("user is still referenced in media, comments, memories or trips")

func (r *PostgresUser) Delete(ctx context.Context, id string) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	// 1. check owner_id references
	var n int
	err = tx.GetContext(ctx, &n,
		`SELECT 1 FROM media     WHERE owner_id = $1 UNION
		 SELECT 1 FROM comments  WHERE owner_id = $1 UNION
		 SELECT 1 FROM memories  WHERE owner_id = $1 UNION
		 SELECT 1 FROM trips     WHERE owner_id = $1 LIMIT 1`, id)
	if err == nil { // found at least one row
		return ErrUserStillReferenced
	}

	// 2. delete user and relations
	if _, err := tx.ExecContext(ctx, `DELETE FROM users WHERE id = $1`, id); err != nil {
		return fmt.Errorf("delete user: %w", err)
	}
	if _, err := tx.ExecContext(ctx, `DELETE FROM relations  WHERE source = $1 OR target = $1`, id); err != nil {
		return fmt.Errorf("delete relations: %w", err)
	}

	return tx.Commit()
}

/* ---------- list ---------- */

func (r *PostgresUser) List(ctx context.Context, limit, offset int) ([]models.User, int, error) {
	var total int
	var out []models.User
	if err := r.db.GetContext(ctx, &total, `SELECT COUNT(*) FROM users`); err != nil {
		return out, 0, err
	}
	if err := r.db.SelectContext(ctx, &out,
		`SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, offset); err != nil {
		return out, 0, err
	}
	return out, total, nil
}
