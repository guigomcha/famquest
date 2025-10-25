package postgresql

import (
	"context"
	"fmt"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type PostgresPost struct{ db *sqlx.DB }

func NewPostgresPost() *PostgresPost { return &PostgresPost{db: connection.DB} }

func (r *PostgresPost) Create(ctx context.Context, p models.Post) (models.Post, error) {
	const q = `INSERT INTO posts (owner_id,location_id,name,description_id,medias,tags,comments,start_at,end_at)
	           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`
	row := r.db.QueryRowxContext(ctx, q,
		p.OwnerID, p.LocationID, p.Name, p.DescriptionId,
		pq.Array(p.Medias), pq.Array(p.Tags), pq.Array(p.Comments), p.StartAt, p.EndAt)
	if err := row.StructScan(&p); err != nil {
		return p, fmt.Errorf("create post: %w", err)
	}
	return p, nil
}

func (r *PostgresPost) Get(ctx context.Context, id string) (models.Post, error) {
	var p models.Post
	err := r.db.GetContext(ctx, &p, "SELECT * FROM posts WHERE id=$1", id)
	return p, err
}

func (r *PostgresPost) Update(ctx context.Context, id string, p models.Post) (models.Post, error) {
	const q = `UPDATE posts
	           SET location_id=$1,name=$2,description_id=$3,medias=$4,tags=$5,comments=$6,start_at=$7,end_at=$8
	           WHERE id=$9 RETURNING *`
	row := r.db.QueryRowxContext(ctx, q,
		p.LocationID, p.Name, p.DescriptionId,
		pq.Array(p.Medias), pq.Array(p.Tags), pq.Array(p.Comments), p.StartAt, p.EndAt, id)
	if err := row.StructScan(&p); err != nil {
		return p, fmt.Errorf("update post: %w", err)
	}
	return p, nil
}

func (r *PostgresPost) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM posts WHERE id=$1`, id)
	return err
}

func (r *PostgresPost) List(ctx context.Context, limit, offset int) ([]models.Post, int, error) {
	var total int
	if err := r.db.GetContext(ctx, &total, `SELECT COUNT(*) FROM posts`); err != nil {
		return nil, 0, err
	}
	var out []models.Post
	if err := r.db.SelectContext(ctx, &out,
		`SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, offset); err != nil {
		return nil, 0, err
	}
	return out, total, nil
}
