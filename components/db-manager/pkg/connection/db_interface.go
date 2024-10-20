package connection

type DbInterface interface {
	GetTableName() string
	GetInsertQuery() string
	GetUpdateQuery() string
	GetDeleteExtraQueries() []string
	GetInsertExtraQueries() []string
}

// switch m := model.(type) {
// case *models.Attachments:
// 	query = `
// 		INSERT INTO attachments (name, description, url, ref_type, ref)
// 		VALUES (:name, :description, :url, :ref_type, :ref) RETURNING id`
// case *models.Spots:
// 	query = `
// 		INSERT INTO spots (name, location, description, attachment_refs, task_refs)
// 		VALUES (:name, :locationºº, :description, :attachment_refs, :task_refs) RETURNING id`
// case *models.KnownLocations:
// 	query = `
// 		INSERT INTO known_locations (name, longitude, latitude)
// 		VALUES (:name, :longitude, :latitude) RETURNING id`
// case *models.Tasks:
// 	query = `
// 		INSERT INTO tasks (name, description, ref_type, ref)
// 		VALUES (:name, :description, :ref_type, :ref) RETURNING id`
// default:
// 	return 0, fmt.Errorf("unsupported model type: %T", m)
// }

// switch m := model.(type) {
// case *models.Attachments:
// 	query = `
// 		UPDATE attachments
// 		SET name = :name, description = :description, url = :url, ref_type = :ref_type, ref = :ref
// 		WHERE id = :id`
// 	_, err := db.NamedExec(query, m)
// 	return err

// case *models.Spots:
// 	query = `
// 		UPDATE spots
// 		SET name = :name, locationºº = :locationºº, description = :description,
// 				attachment_refs = :attachment_refs, task_refs = :task_refs
// 		WHERE id = :id`
// 	_, err := db.NamedExec(query, m)
// 	return err

// case *models.KnownLocations:
// 	if ok := checkIDExists(db, "known_locations", m.ID); !ok {
// 		return errors.New(ErrorIdDoesNotExits)
// 	}
// 	query = `
// 		UPDATE known_locations
// 		SET name = :name, longitude = :longitude, latitude = :latitude
// 		WHERE id = :id`
// 	_, err := db.NamedExec(query, m)
// 	return err

// case *models.Tasks:
// 	query = `
// 		UPDATE tasks
// 		SET name = :name, description = :description, ref_type = :ref_type, ref = :ref
// 		WHERE id = :id`
// 	_, err := db.NamedExec(query, m)
// 	return err

// default:
// 	return fmt.Errorf("unsupported model type: %T", model)
// }
