-- We need to migrate the existing owner_user_id column logic
-- In V1__initial_schema.sql it was likely named owner_user_id due to Hibernate's implicit naming strategy on ownerUserId (owner_user_id), but just in case it was owner_user_id, we just add the FK.
-- If the column is actually owner_user_id, we just add the constraint.
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_receipts_owner_user'
  ) THEN
    ALTER TABLE receipts ADD CONSTRAINT fk_receipts_owner_user FOREIGN KEY (owner_user_id) REFERENCES app_users(id);
  END IF;
END $$;
