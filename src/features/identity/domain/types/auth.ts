import { User } from "../entities/User";

export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthResult {
  success: boolean;
  user?: Partial<User>;
  error?: string;
}

export interface UserWithPassword extends Partial<User> {
  id: number;
  email: string;
  role: string;
  password?: string | null;
}
