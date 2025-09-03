-- PostgreSQL initialization script for Argo Conversational Platform
-- This script sets up the database schema with PostGIS and pgvector extensions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas for different data types
CREATE SCHEMA IF NOT EXISTS argo_data;
CREATE SCHEMA IF NOT EXISTS vector_store;
CREATE SCHEMA IF NOT EXISTS metadata;

-- Set default search path
ALTER DATABASE argo_db SET search_path TO public, argo_data, vector_store, metadata, postgis;

-- Create basic indexes for performance
-- (Detailed table creation will be handled by Alembic migrations)
