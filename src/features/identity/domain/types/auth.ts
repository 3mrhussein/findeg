import { User } from "../entities/User";
import { Email, UserRole } from "@/features/core/domain/types/common";

export interface SessionPayload {
  userId: number;
  email: Email;
  role: UserRole;
}

export interface AuthResult {
  success: boolean;
  user?: Partial<User>;
  error?: string;
}

export interface UserWithPassword extends Omit<Partial<User>, "role" | "email"> {
  id: number;
  email: Email;
  role: UserRole;
  password?: string | null;
}
