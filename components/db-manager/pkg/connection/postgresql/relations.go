package postgresql

import (
	"context"
	"fmt"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"

	"github.com/jmoiron/sqlx"
)

type PostgresRelation struct{ db *sqlx.DB }

func NewPostgresRelation() *PostgresRelation { return &PostgresRelation{db: connection.DB} }

func (r *PostgresRelation) Create(ctx context.Context, rel models.Relation) (models.Relation, error) {
	const q = `INSERT INTO relations (source,target,label,is_ex)
	           VALUES ($1,$2,$3,$4) RETURNING *`
	row := r.db.QueryRowxContext(ctx, q, rel.Source, rel.Target, rel.Label, rel.IsEx)
	if err := row.StructScan(&rel); err != nil {
		return rel, fmt.Errorf("create relation: %w", err)
	}
	return rel, nil
}

func (r *PostgresRelation) Get(ctx context.Context, id string) (models.Relation, error) {
	var rel models.Relation
	err := r.db.GetContext(ctx, &rel, "SELECT * FROM relations WHERE id=$1", id)
	return rel, err
}

func (r *PostgresRelation) Update(ctx context.Context, id string, rel models.Relation) (models.Relation, error) {
	const q = `UPDATE relations
	           SET source=$1,target=$2,label=$3,is_ex=$4
	           WHERE id=$5 RETURNING *`
	row := r.db.QueryRowxContext(ctx, q, rel.Source, rel.Target, rel.Label, rel.IsEx, id)
	if err := row.StructScan(&rel); err != nil {
		return rel, fmt.Errorf("update relation: %w", err)
	}
	return rel, nil
}

func (r *PostgresRelation) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM relations WHERE id=$1`, id)
	return err
}

func (r *PostgresRelation) List(ctx context.Context, limit, offset int) ([]models.Relation, int, error) {
	var total int
	if err := r.db.GetContext(ctx, &total, `SELECT COUNT(*) FROM relations`); err != nil {
		return nil, 0, err
	}
	var out []models.Relation
	if err := r.db.SelectContext(ctx, &out,
		`SELECT * FROM relations ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, offset); err != nil {
		return nil, 0, err
	}
	return out, total, nil
}
