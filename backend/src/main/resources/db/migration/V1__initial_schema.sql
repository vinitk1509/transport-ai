CREATE TABLE app_users (
    id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    company VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(255),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    session_token VARCHAR(255),
    session_expires_at TIMESTAMP,
    created_at TIMESTAMP
);

CREATE UNIQUE INDEX ux_app_users_email ON app_users (email);
CREATE UNIQUE INDEX ux_app_users_session_token ON app_users (session_token);

CREATE TABLE email_verifications (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP,
    attempts INTEGER NOT NULL DEFAULT 0,
    used BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX ix_email_verifications_email_code ON email_verifications (email, code, used);

CREATE TABLE receipts (
    id VARCHAR(255) PRIMARY KEY,
    uploaded_at TIMESTAMP,
    processed_at TIMESTAMP,
    status VARCHAR(255),
    uploaded_by VARCHAR(255),
    owner_user_id VARCHAR(255),
    company VARCHAR(255),
    gr_number VARCHAR(255),
    consignor VARCHAR(255),
    consignee VARCHAR(255),
    source VARCHAR(255),
    destination VARCHAR(255),
    packages INTEGER NOT NULL DEFAULT 0,
    material VARCHAR(255),
    description VARCHAR(255),
    charges DOUBLE PRECISION NOT NULL DEFAULT 0,
    amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    confidence_overall INTEGER NOT NULL DEFAULT 0,
    original_filename VARCHAR(255),
    stored_filename VARCHAR(255),
    content_type VARCHAR(255),
    rejection_reason VARCHAR(255),
    extracted_json TEXT
);

CREATE INDEX ix_receipts_company_uploaded_at ON receipts (company, uploaded_at DESC);
CREATE INDEX ix_receipts_owner_user_id ON receipts (owner_user_id);
