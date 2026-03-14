-- Make portal_role NOT NULL
ALTER TABLE identity.users ALTER COLUMN portal_role SET NOT NULL;

-- Drop obsolete identity columns
ALTER TABLE identity.users DROP COLUMN IF EXISTS name;
ALTER TABLE identity.users DROP COLUMN IF EXISTS password;
ALTER TABLE identity.users DROP COLUMN IF EXISTS role;
