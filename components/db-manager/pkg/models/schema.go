package models

const Schema = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Enable UUID generation


CREATE TABLE IF NOT EXISTS known_locations (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID as primary key
    id SERIAL UNIQUE NOT NULL, -- Auto-incremented integer ID
    name TEXT NOT NULL,
    longitude FLOAT NOT NULL, -- Longitude as signed float
    latitude FLOAT NOT NULL, -- Latitude as signed float
    ref_type TEXT DEFAULT 'spot' CHECK (ref_type IN ('spot')), -- Constraint for ref_type
    ref_id INT DEFAULT 0,
    ref_user_uploader INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically generated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatically managed by trigger
);

CREATE TABLE IF NOT EXISTS spots (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID as primary key
    id SERIAL UNIQUE NOT NULL, -- Auto-incremented integer ID
    name TEXT NOT NULL,
    description TEXT,
    ref_user_uploader INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically generated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatically managed by trigger
);

CREATE TABLE IF NOT EXISTS notes (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID as primary key
    id SERIAL UNIQUE NOT NULL, -- Auto-incremented integer ID
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    ref_user_uploader INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically generated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatically managed by trigger
);

CREATE TABLE IF NOT EXISTS attachments (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID as primary key
    id SERIAL UNIQUE NOT NULL, -- Auto-incremented integer ID
    ref_type TEXT DEFAULT 'spot' CHECK (ref_type IN ('spot', 'note', 'attachment' )), -- Constraint for ref_type
    ref_id INT DEFAULT 0,
    name TEXT NOT NULL,
    description TEXT,
    content_type TEXT DEFAULT 'image/jpeg', -- Constraint for ref_type
    url TEXT NOT NULL,
    ref_user_uploader INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically generated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatically managed by trigger
);

CREATE TABLE IF NOT EXISTS users (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- UUID as primary key
    id SERIAL UNIQUE NOT NULL,                         -- Auto-incremented integer ID
    ext_ref TEXT NOT NULL,                                -- User UUID from keycloak
    email TEXT NOT NULL,                               -- Email of the user
    role TEXT CHECK (role IN ('owner', 'contributor', 'admin', 'target', 'hybrid')),  -- Role with constraints
    name TEXT NOT NULL,                  -- Preferred Username in keycloak
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically generated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatically managed by trigger
);

-- Trigger functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table
CREATE OR REPLACE TRIGGER update_spots_updated_at
BEFORE UPDATE ON spots
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_known_locations_updated_at
BEFORE UPDATE ON known_locations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_attachments_updated_at
BEFORE UPDATE ON attachments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_users_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`
