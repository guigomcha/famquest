package postgresql

import (
	"context"
	"fmt"

	"famquest/components/db-manager/pkg/connection"
	"famquest/components/db-manager/pkg/models"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type PostgresMedia struct{ db *sqlx.DB }

func NewPostgresMedia() *PostgresMedia { return &PostgresMedia{db: connection.DB} }

func (r *PostgresMedia) Create(ctx context.Context, m models.Media) (models.Media, error) {
	const q = `INSERT INTO media (owner_id,name,url,content_type,participants,tags,comments,is_at)
	           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`
	row := r.db.QueryRowxContext(ctx, q,
		m.OwnerID, m.Name, m.URL, m.ContentType, pq.Array(m.Participants), pq.Array(m.Tags), m.Comments, m.IsAt)
	if err := row.StructScan(&m); err != nil {
		return m, fmt.Errorf("create media: %w", err)
	}
	return m, nil
}

func (r *PostgresMedia) Get(ctx context.Context, id string) (models.Media, error) {
	var m models.Media
	err := r.db.GetContext(ctx, &m, "SELECT * FROM media WHERE id=$1", id)
	return m, err
}

func (r *PostgresMedia) Update(ctx context.Context, id string, m models.Media) (models.Media, error) {
	const q = `UPDATE media
	           SET name=$1,participants=$2,tags=$3,comments=$4,is_at=$5,url=$6,content_type=$7,owner_id=$8
	           WHERE id=$9 RETURNING *`
	row := r.db.QueryRowxContext(ctx, q,
		m.Name, pq.Array(m.Participants), pq.Array(m.Tags), pq.Array(m.Comments), m.IsAt, m.URL, m.ContentType, m.OwnerID, id)
	if err := row.StructScan(&m); err != nil {
		return m, fmt.Errorf("update media: %w", err)
	}
	return m, nil
}

// Delete removes the media row **and every FK reference** wherever media.id appears
func (r *PostgresMedia) Delete(ctx context.Context, id string) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	uid := uuid.MustParse(id)

	// // 1. arrays (GIN)
	// for _, tbl := range []string{"media", "memories", "trips"} {
	// 	var rows models.UUIDArray
	// 	err := tx.SelectContext(ctx, &rows,
	// 		`SELECT id FROM `+tbl+` WHERE $1 = ANY(media)`, uid) // media column
	// 	for _, rid := range rows {
	// 		log.Printf("DELETE ref: removing media at %s from %s.media[%s]", id, tbl, rid)
	// 		_, _ = tx.ExecContext(ctx,
	// 			`UPDATE `+tbl+` SET media = array_remove(media, $1) WHERE id = $2`, uid, rid)
	// 	}
	// }

	// // 2. avatar (users.avatar)
	// if _, err := tx.ExecContext(ctx,
	// 	`UPDATE users SET avatar = NULL WHERE avatar = $1`, uid); err != nil {
	// 	return fmt.Errorf("clear avatar: %w", err)
	// }
	// log.Printf("DELETE ref: cleared avatar for media %s", id)

	// // 3. audio_id (comments.audio_id)
	// if _, err := tx.ExecContext(ctx,
	// 	`UPDATE comments SET audio_id = NULL WHERE audio_id = $1`, uid); err != nil {
	// 	return fmt.Errorf("clear audio_id: %w", err)
	// }
	// log.Printf("DELETE ref: cleared audio_id for media %s", id)

	// 4. description columns that point to comments that point to media …
	//    (not needed unless you store media id inside comment text – skipped)

	// 5. finally delete the media row
	if _, err := tx.ExecContext(ctx, `DELETE FROM media WHERE id = $1`, uid); err != nil {
		return fmt.Errorf("delete media: %w", err)
	}

	return tx.Commit()
}

func (r *PostgresMedia) List(ctx context.Context, limit, offset int) ([]models.Media, int, error) {
	var total int
	if err := r.db.GetContext(ctx, &total, `SELECT COUNT(*) FROM media`); err != nil {
		return nil, 0, err
	}
	var out []models.Media
	if err := r.db.SelectContext(ctx, &out,
		`SELECT * FROM media ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, offset); err != nil {
		return nil, 0, err
	}
	return out, total, nil
}
