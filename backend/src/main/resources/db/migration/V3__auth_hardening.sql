ALTER TABLE app_users ADD COLUMN IF NOT EXISTS session_expires_at TIMESTAMP;
ALTER TABLE email_verifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE email_verifications ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS ix_email_verifications_email_created_at ON email_verifications (email, created_at DESC);
