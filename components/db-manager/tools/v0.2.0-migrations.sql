-- 1. Add the refUserUploader column
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

-- 2. accept note as ref_type to attachments
DO $$ 
DECLARE 
    constraint_name TEXT;
BEGIN
    -- Step 1: Identify the existing constraint name
    SELECT conname INTO constraint_name 
    FROM pg_constraint 
    WHERE conrelid = 'attachments'::regclass 
    AND contype = 'c' 
    AND conname LIKE '%ref_type%';

    -- Step 2: Drop the existing constraint if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE attachments DROP CONSTRAINT %I', constraint_name);
    END IF;

    -- Step 3: Add the updated constraint
    ALTER TABLE attachments 
    ADD CONSTRAINT attachments_ref_type_check 
    CHECK (ref_type IN ('spot', 'attachment', 'note'));
END $$;


