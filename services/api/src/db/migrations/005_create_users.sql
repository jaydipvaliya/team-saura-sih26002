-- Create Users Table for Authentication & Authorization
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookup by email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
