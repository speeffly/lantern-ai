-- Email Verification Schema
-- Add these columns to the existing users table and create the email verification tokens table

-- Add email verification columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;

-- Create email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_email_verification_token (token),
    INDEX idx_email_verification_user_id (user_id),
    INDEX idx_email_verification_expires (expires_at)
);

-- Clean up expired tokens (optional maintenance query)
-- DELETE FROM email_verification_tokens WHERE expires_at < NOW() - INTERVAL '7 days';

-- Example queries for testing:
-- Check verification status: SELECT email, email_verified, email_verified_at FROM users WHERE id = ?;
-- List pending tokens: SELECT * FROM email_verification_tokens WHERE used_at IS NULL AND expires_at > NOW();
-- Verify token: SELECT * FROM email_verification_tokens WHERE token = ? AND used_at IS NULL;