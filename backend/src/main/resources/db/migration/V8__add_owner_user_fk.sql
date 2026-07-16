-- Add the FK constraint to owner_user_id linking to app_users
ALTER TABLE receipts ADD CONSTRAINT fk_receipts_owner_user FOREIGN KEY (owner_user_id) REFERENCES app_users(id);

