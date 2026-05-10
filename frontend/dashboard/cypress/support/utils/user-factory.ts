export interface E2EUser {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const DEFAULT_PASSWORD = 'CypressPass123!';

/**
 * Creates deterministic unique user credentials for auth/account E2E flows.
 */
export function buildE2EUser(seed: number = Date.now()): E2EUser {
  const nonce = Math.floor(Math.random() * 100000);
  const identity = `${seed}${nonce}`;
  const firstName = 'Cypress';
  const lastName = `User${identity}`;
  const fullName = `${firstName} ${lastName}`;
  const email = `cypress.user.${identity}@example.com`;

  return {
    fullName,
    firstName,
    lastName,
    email,
    password: DEFAULT_PASSWORD,
  };
}
