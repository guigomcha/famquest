-- 1. Add the datetime column
DO $$ 
DECLARE
    table_to_update TEXT;
BEGIN
    -- List of tables to modify
    FOR table_to_update IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' -- Modify 'public' if your schema is different
        AND table_name IN ('attachments', 'notes')
    LOOP
        -- Dynamically execute the ALTER TABLE command to add the column without a default
        EXECUTE format('
            ALTER TABLE %I
            ADD COLUMN IF NOT EXISTS datetime TIMESTAMP;', table_to_update);
        
        -- Update the new column with the value from created_at
        EXECUTE format('
            UPDATE %I
            SET datetime = created_at
            WHERE created_at IS NOT NULL;', table_to_update);
    END LOOP;
END $$;
