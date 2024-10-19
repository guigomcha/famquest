package models

/*
Input for chatGPT based on the structs from models.go

Create the associated SQL instructions as a string schema to represent the following data in a
postgresql db using Go and the sqlx module. Make sure that all databases include an addition uuid
as primary key and that they all autoinclude a column for the first update and last updated
I want created_at and updated_at to be automatically generated by the database
*/
const Schema = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Enable UUID generation

CREATE TABLE IF NOT EXISTS known_locations (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID as primary key
    id SERIAL UNIQUE, -- Auto-incremented integer ID
    name TEXT NOT NULL,
    longitude FLOAT NOT NULL, -- Longitude as signed float
    latitude FLOAT NOT NULL, -- Latitude as signed float
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically generated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatically managed by trigger
);

CREATE TABLE IF NOT EXISTS spots (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID as primary key
    id SERIAL UNIQUE, -- Auto-incremented integer ID
    location_ref INT REFERENCES known_locations(id), -- Foreign key
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically generated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatically managed by trigger
);

CREATE TABLE IF NOT EXISTS tasks (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID as primary key
    id SERIAL UNIQUE, -- Auto-incremented integer ID
    ref_type TEXT,
    ref INT,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically generated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatically managed by trigger
);

CREATE TABLE IF NOT EXISTS attachments (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID as primary key
    id SERIAL UNIQUE, -- Auto-incremented integer ID
    ref_type TEXT,
    ref INT,
    name TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
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

CREATE OR REPLACE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_attachments_updated_at
BEFORE UPDATE ON attachments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`
