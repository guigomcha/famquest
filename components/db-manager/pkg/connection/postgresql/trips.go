package postgresql

import (
	"context"
	"encoding/json"
	"fmt"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"

	"github.com/jmoiron/sqlx"
)

type PostgresTrip struct{ db *sqlx.DB }

func NewPostgresTrip() *PostgresTrip { return &PostgresTrip{db: connection.DB} }

func (r *PostgresTrip) Create(ctx context.Context, t models.Trip) (models.Trip, error) {
	stopsJSON, _ := json.Marshal(t.Stops)
	const q = `INSERT INTO trips (owner_id,name,description_id,transportation,participants,stops,start_at,end_at)
	           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`
	row := r.db.QueryRowxContext(ctx, q,
		t.OwnerID, t.Name, t.DescriptionId, t.Transportation, t.Participants, stopsJSON, t.StartAt, t.EndAt)
	if err := row.StructScan(&t); err != nil {
		return t, fmt.Errorf("create trip: %w", err)
	}
	return t, nil
}

func (r *PostgresTrip) Get(ctx context.Context, id string) (models.Trip, error) {
	var t models.Trip
	var stopsJSON []byte
	err := r.db.QueryRowxContext(ctx, `SELECT * FROM trips WHERE id=$1`, id).
		Scan(&t.ID, &t.OwnerID, &t.Name, &t.DescriptionId, &t.Transportation,
			&t.Participants, &stopsJSON, &t.StartAt, &t.EndAt, &t.UpdatedAt, &t.CreatedAt)
	if err != nil {
		return t, err
	}
	_ = json.Unmarshal(stopsJSON, &t.Stops)
	return t, nil
}

func (r *PostgresTrip) Update(ctx context.Context, id string, t models.Trip) (models.Trip, error) {
	stopsJSON, _ := json.Marshal(t.Stops)
	const q = `UPDATE trips
	           SET name=$1,description_id=$2,transportation=$3,participants=$4,stops=$5,start_at=$6,end_at=$7
	           WHERE id=$8 RETURNING *`
	row := r.db.QueryRowxContext(ctx, q,
		t.Name, t.DescriptionId, t.Transportation, t.Participants, stopsJSON, t.StartAt, t.EndAt, id)
	if err := row.StructScan(&t); err != nil {
		return t, fmt.Errorf("update trip: %w", err)
	}
	return t, nil
}

func (r *PostgresTrip) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM trips WHERE id=$1`, id)
	return err
}

func (r *PostgresTrip) List(ctx context.Context, limit, offset int) ([]models.Trip, int, error) {
	var total int
	if err := r.db.GetContext(ctx, &total, `SELECT COUNT(*) FROM trips`); err != nil {
		return nil, 0, err
	}
	rows, err := r.db.QueryxContext(ctx,
		`SELECT * FROM trips ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var out []models.Trip
	for rows.Next() {
		var t models.Trip
		var stopsJSON []byte
		if err := rows.Scan(&t.ID, &t.OwnerID, &t.Name, &t.DescriptionId, &t.Transportation,
			&t.Participants, &stopsJSON, &t.StartAt, &t.EndAt, &t.UpdatedAt, &t.CreatedAt); err != nil {
			continue
		}
		_ = json.Unmarshal(stopsJSON, &t.Stops)
		out = append(out, t)
	}
	return out, total, nil
}
