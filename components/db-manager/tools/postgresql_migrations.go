package main

import (
	"famquest/components/db-manager/pkg/connection"
	"famquest/components/go-common/logger"
)

func main() {
	// Define the database connection string
	db, err := connection.ConnectToPostgreSQL()
	if err != nil {
		logger.Log.Fatal(err.Error())
		return
	}
	defer db.Close()

	// Check if the connection is alive
	if err := db.Ping(); err != nil {
		logger.Log.Fatal("Error connecting to database: ", err)
	}

	// Add the refUserUploader column
	sqlScript := `
    DO $$
    DECLARE
        table_to_update TEXT;
    BEGIN
        -- List of tables to modify
        FOR table_to_update IN
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' -- Modify 'public' if your schema is different
            AND table_name IN ('attachments', 'known_locations', 'spots')
        LOOP
            -- Dynamically execute the ALTER TABLE command to add the column
            EXECUTE format('
                ALTER TABLE %I
                ADD COLUMN IF NOT EXISTS ref_user_uploader INT DEFAULT 0;', table_to_update);
            
            -- Optionally, you can explicitly set the value to 0 if the column already exists
            EXECUTE format('
                UPDATE %I
                SET ref_user_uploader = 0
                WHERE ref_user_uploader IS NULL;', table_to_update);
        END LOOP;
    END $$;
    `

	// Execute the SQL script
	_, err = db.Exec(sqlScript)
	if err != nil {
		logger.Log.Fatal("Error executing script: ", err)
	}
	logger.Log.Info("Column added and updated successfully!")
}
