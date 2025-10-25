package postgresql

import (
	"context"
	"fmt"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type PostgresComment struct{ db *sqlx.DB }

func NewPostgresComment() *PostgresComment { return &PostgresComment{db: connection.DB} }

func (r *PostgresComment) Create(ctx context.Context, c models.Comment) (models.Comment, error) {
	const q = `INSERT INTO comments (owner_id,text,audio_id,replies)
	           VALUES ($1,$2,$3,$4) RETURNING *`
	row := r.db.QueryRowxContext(ctx, q,
		c.OwnerID, c.Text, c.AudioID, pq.Array(c.Replies))
	if err := row.StructScan(&c); err != nil {
		return c, fmt.Errorf("create comment: %w", err)
	}
	return c, nil
}

func (r *PostgresComment) Get(ctx context.Context, id string) (models.Comment, error) {
	var c models.Comment
	err := r.db.GetContext(ctx, &c, "SELECT * FROM comments WHERE id=$1", id)
	return c, err
}

func (r *PostgresComment) Update(ctx context.Context, id string, c models.Comment) (models.Comment, error) {
	const q = `UPDATE comments
	           SET text=$1,audio_id=$2,replies=$3
	           WHERE id=$4 RETURNING *`
	row := r.db.QueryRowxContext(ctx, q,
		c.Text, c.AudioID, pq.Array(c.Replies), id)
	if err := row.StructScan(&c); err != nil {
		return c, fmt.Errorf("update comment: %w", err)
	}
	return c, nil
}

func (r *PostgresComment) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM comments WHERE id=$1`, id)
	return err
}

func (r *PostgresComment) List(ctx context.Context, limit, offset int) ([]models.Comment, int, error) {
	var total int
	if err := r.db.GetContext(ctx, &total, `SELECT COUNT(*) FROM comments`); err != nil {
		return nil, 0, err
	}
	var out []models.Comment
	if err := r.db.SelectContext(ctx, &out,
		`SELECT * FROM comments ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, offset); err != nil {
		return nil, 0, err
	}
	return out, total, nil
}
