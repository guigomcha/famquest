package postgresql

import (
	"context"
	"fmt"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"

	"github.com/jmoiron/sqlx"
)

type PostgresLocation struct{ db *sqlx.DB }

func NewPostgresLocation() *PostgresLocation { return &PostgresLocation{db: connection.DB} }

func (r *PostgresLocation) Create(ctx context.Context, l models.Location) (models.Location, error) {
	const q = `INSERT INTO locations (owner_id,name,description,address,lat,lng)
	           VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`
	row := r.db.QueryRowxContext(ctx, q,
		l.OwnerID, l.Name, l.Description, l.Address, l.Lat, l.Lng)
	if err := row.StructScan(&l); err != nil {
		return l, fmt.Errorf("create location: %w", err)
	}
	return l, nil
}

func (r *PostgresLocation) Get(ctx context.Context, id string) (models.Location, error) {
	var l models.Location
	err := r.db.GetContext(ctx, &l, "SELECT * FROM locations WHERE id=$1", id)
	return l, err
}

func (r *PostgresLocation) Update(ctx context.Context, id string, l models.Location) (models.Location, error) {
	const q = `UPDATE locations
	           SET name=$1,description=$2,address=$3,lat=$4,lng=$5
	           WHERE id=$6 RETURNING *`
	row := r.db.QueryRowxContext(ctx, q,
		l.Name, l.Description, l.Address, l.Lat, l.Lng, id)
	if err := row.StructScan(&l); err != nil {
		return l, fmt.Errorf("update location: %w", err)
	}
	return l, nil
}

func (r *PostgresLocation) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM locations WHERE id=$1`, id)
	return err
}

func (r *PostgresLocation) List(ctx context.Context, limit, offset int) ([]models.Location, int, error) {
	var total int
	if err := r.db.GetContext(ctx, &total, `SELECT COUNT(*) FROM locations`); err != nil {
		return nil, 0, err
	}
	var out []models.Location
	if err := r.db.SelectContext(ctx, &out,
		`SELECT * FROM locations ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, offset); err != nil {
		return nil, 0, err
	}
	return out, total, nil
}
