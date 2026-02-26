BEGIN;

DROP TABLE IF EXISTS guest_principals;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS organization_memberships;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS password_credentials;
DROP TABLE IF EXISTS auth_accounts;

COMMIT;
