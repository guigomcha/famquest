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

-- 1. Add the missing refs to notes column
DO $$ 
DECLARE
    table_to_update TEXT;
BEGIN
    -- List of tables to modify
    FOR table_to_update IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' -- Modify 'public' if your schema is different
        AND table_name IN ('notes')
    LOOP
        -- Dynamically execute the ALTER TABLE command to add the column without a default
        EXECUTE format('
            ALTER TABLE %I
            ADD COLUMN IF NOT EXISTS ref_type TEXT DEFAULT ''user'' CHECK (ref_type IN (''spot'', ''user'' ));', table_to_update);
        EXECUTE format('
            ALTER TABLE %I
            ADD COLUMN IF NOT EXISTS ref_id INT DEFAULT 0;', table_to_update);
        EXECUTE format('
            UPDATE %I
            SET ref_id = ref_user_uploader;', table_to_update);
    END LOOP;
END $$;

--- Attachments are now linked only to notes and other attachments, not to spots

BEGIN;

-- Step 1: Insert new notes for each spot with attachments
WITH inserted_notes AS (
    INSERT INTO notes (name, description, ref_type, ref_id, ref_user_uploader, category, datetime)
    SELECT 
        s.name,
        s.description,
        'spot' AS ref_type,
        s.id AS ref_id,
        s.ref_user_uploader,
        'general' AS category,
        s.created_at AS datetime
    FROM spots s
    WHERE EXISTS (
        SELECT 1 
        FROM attachments a
        WHERE a.ref_type = 'spot'
          AND a.ref_id = s.id
    )
    RETURNING id AS note_id, ref_id AS spot_id
)

-- Step 2: Update attachments to reference the new notes
UPDATE attachments a
SET 
    ref_type = 'note',
    ref_id = n.note_id
FROM inserted_notes n
WHERE a.ref_type = 'spot'
  AND a.ref_id = n.spot_id;

COMMIT;


--- Known locations will be linked to users too to be able to create custom masks for each one

BEGIN;

-- 1. accept user as ref_type to known_locations

DO $$ 
DECLARE 
    constraint_name TEXT;
BEGIN
    -- Step 1: Identify the existing constraint name
    SELECT conname INTO constraint_name 
    FROM pg_constraint 
    WHERE conrelid = 'known_locations'::regclass 
    AND contype = 'c' 
    AND conname LIKE '%ref_type%';

    -- Step 2: Drop the existing constraint if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE known_locations DROP CONSTRAINT %I', constraint_name);
    END IF;

    -- Step 3: Add the updated constraint
    ALTER TABLE known_locations 
    ADD CONSTRAINT known_locations_ref_type_check 
    CHECK (ref_type IN ('spot', 'user'));
END $$;
-- 1. Update existing locations to a user
UPDATE known_locations
SET 
    ref_type = 'user',
    ref_id = 1
WHERE ref_id = 0;

COMMIT;

--- Add ref_user_uploader to discovered table so that each user has their own mask

DO $$
DECLARE
    table_to_update TEXT;
BEGIN
    -- List of tables to modify
    FOR table_to_update IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' -- Modify 'public' if your schema is different
        AND table_name IN ('discovered')
    LOOP
        -- Dynamically execute the ALTER TABLE command to add the column
        EXECUTE format('
            ALTER TABLE %I
            ADD COLUMN IF NOT EXISTS ref_user_uploader INT DEFAULT 0;', table_to_update);
        
        -- You will have to set the ref_user_uploader to a known user id. By default set to 1
        EXECUTE format('
            UPDATE %I
            SET ref_user_uploader = 1;', table_to_update);
    END LOOP;
END $$;

--- Add passing to users table so that we have users that have passed away in the family tree and family tabs

DO $$
DECLARE
    table_to_update TEXT;
BEGIN
    -- List of tables to modify
    FOR table_to_update IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' -- Modify 'public' if your schema is different
        AND table_name IN ('users')
    LOOP
        -- Dynamically execute the ALTER TABLE command to add the column
        EXECUTE format('
            ALTER TABLE %I
            ADD COLUMN IF NOT EXISTS passing TEXT DEFAULT '';', table_to_update);

    END LOOP;
END $$;