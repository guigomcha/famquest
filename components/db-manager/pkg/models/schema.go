package models

const Schema = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


/* 
    #################################################################
                        Base Content Types
    #################################################################
*/

/* ----------  Media  ---------- */
CREATE TABLE IF NOT EXISTS media  (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id      UUID, -- nullable user id
    name          TEXT,
    url           TEXT NOT NULL,
    content_type  TEXT NOT NULL, -- Enum complaince checked at the API level
    participants  UUID[] NOT NULL DEFAULT '{}',  -- user ids
    tags          TEXT[] NOT NULL DEFAULT '{}',  -- tag names (or tag ids if you prefer)
    comments      UUID[] NOT NULL DEFAULT '{}',  -- comment ids
    is_at         TIMESTAMPTZ,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/* ----------  COMMENTS  ---------- */
CREATE TABLE IF NOT EXISTS comments  (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id    UUID, -- nullable user id
    text        TEXT,
    audio_id    UUID, -- nullable media id
    replies     UUID[] NOT NULL DEFAULT '{}',  -- comment ids
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/* ----------  LOCATIONS  ---------- */
CREATE TABLE IF NOT EXISTS locations  (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id    UUID, -- nullable user id
    name        TEXT,
    description_id UUID, -- nullable comment id
    address     TEXT,
    lat         NUMERIC(9,6),
    lng         NUMERIC(9,6),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/* 
    #################################################################
    Complementary Data Models that build on top of base content types
    #################################################################  
*/

/* ----------  USERS  ---------- */
CREATE TABLE IF NOT EXISTS users  (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    ext_ref     TEXT,
    email       TEXT,
    avatar      UUID,                -- nullable media id
    bio         UUID,       -- nullable comment id
    is_virtual  BOOLEAN NOT NULL DEFAULT FALSE,
    posts    UUID[] NOT NULL DEFAULT '{}',  -- list of memory ids
    start_at    TIMESTAMPTZ NOT NULL,
    end_at      TIMESTAMPTZ,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


/* ----------  TRIPS  ---------- */
CREATE TABLE IF NOT EXISTS trips  (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id        UUID, -- nullable user id
    name            TEXT NOT NULL,
    description     UUID, -- nullable comment id
    transportation  TEXT, -- Enum checked at the API level
    participants    UUID[] DEFAULT '{}',  -- user ids
    stops           JSONB NOT NULL DEFAULT '[]',   -- array of {memoryId, order}
    start_at        TIMESTAMPTZ,
    end_at          TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
/* ----------  RELATIONS  ---------- */
DO $$
BEGIN
    CREATE TYPE relation_label AS ENUM ('spouse','friend','parent','pet');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
CREATE TABLE IF NOT EXISTS relations  (
    id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source UUID NOT NULL REFERENCES users(id),
    target UUID NOT NULL REFERENCES users(id),
    label  relation_label NOT NULL,
    is_ex  BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source, target, label, is_ex)
);

/* ----------  posts  ---------- */
CREATE TABLE IF NOT EXISTS posts  (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id     UUID, -- nullable user id
    location_id  UUID, -- nullable location id
    name         TEXT NOT NULL,
    description_id  UUID, -- nullable comment id
    medias        UUID[] NOT NULL DEFAULT '{}',  -- media ids
    tags         TEXT[] NOT NULL DEFAULT '{}',  -- tag names
    comments     UUID[] NOT NULL DEFAULT '{}',  -- comment ids
    start_at     TIMESTAMPTZ,
    end_at       TIMESTAMPTZ,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


/* ----------  useful GIN indexes for array lookups  ---------- */
CREATE INDEX IF NOT EXISTS posts    ON users    USING GIN (posts);
CREATE INDEX IF NOT EXISTS idx_media_participants ON media   USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_media_comments     ON media   USING GIN (comments);
CREATE INDEX IF NOT EXISTS posts_media     ON posts USING GIN (media);
CREATE INDEX IF NOT EXISTS posts_comments  ON posts USING GIN (comments);
CREATE INDEX IF NOT EXISTS idx_trips_participants ON trips   USING GIN (participants);


-- Trigger functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.  install trigger on every table that has updated_at
DO
$$
DECLARE
    t  text;
    trg text;
BEGIN
    FOR t IN
        SELECT table_schema||'.'||table_name
        FROM   information_schema.columns
        WHERE  column_name = 'updated_at'
          AND  table_schema NOT IN ('pg_catalog','information_schema')
    LOOP
        trg := 'trg_' || regexp_replace(t, '\W', '_', 'g') || '_updated_at';
        EXECUTE format(
            'CREATE OR REPLACE TRIGGER %I '
            'BEFORE UPDATE ON %s '
            'FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
            trg, t
        );
    END LOOP;
END;
$$;

`
