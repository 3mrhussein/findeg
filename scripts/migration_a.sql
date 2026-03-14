-- Step 1: Migrate passwords to password_credentials
-- Only insert where not already present (idempotent)
INSERT INTO identity.password_credentials (user_id, password_hash, hash_strategy)
SELECT id, password, 'bcrypt'
FROM identity.users
WHERE password IS NOT NULL
  AND id NOT IN (SELECT user_id FROM identity.password_credentials)
ON CONFLICT (user_id) DO NOTHING;

-- Step 2: Migrate role values to new portalRole values
UPDATE identity.users SET portal_role = 'staff'    WHERE role = 'admin';
UPDATE identity.users SET portal_role = 'customer' WHERE role = 'user';
