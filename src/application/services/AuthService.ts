/**
 * Auth Service Implementation
 *
 * Handles authentication logic. Depends on:
 * - IUserRepository: to look up users
 * - ISessionProvider: to create/verify/delete sessions
 *
 * Uses bcryptjs for password verification.
 * When splitting apps, swap ISessionProvider implementation.
 */

import { IAuthService } from "./interfaces/IAuthService";
import { IUserRepository } from "../repositories/IUserRepository";
import { ISessionProvider } from "./interfaces/ISessionProvider";
import { AuthResult, SessionPayload } from "@/domain/types/admin";
import bcrypt from "bcryptjs";

/**
 *
 */
export class AuthService implements IAuthService {
  /**
   *
   */
  constructor(
    private userRepository: IUserRepository,
    private sessionProvider: ISessionProvider,
  ) {}

  /**
   *
   */
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.getByEmailWithPassword(email);

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    if (!user.password) {
      return { success: false, error: "Account has no password set" };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    if (user.role !== "admin") {
      return { success: false, error: "Access denied. Admin privileges required." };
    }

    const payload: SessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    await this.sessionProvider.createSession(payload);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   *
   */
  async logout(): Promise<void> {
    await this.sessionProvider.deleteSession();
  }

  /**
   *
   */
  async getSession(): Promise<SessionPayload | null> {
    return this.sessionProvider.getSession();
  }

  /**
   *
   */
  async validateAdmin(): Promise<SessionPayload> {
    const session = await this.sessionProvider.getSession();
    if (!session) {
      throw new Error("Not authenticated");
    }
    if (session.role !== "admin") {
      throw new Error("Admin privileges required");
    }
    return session;
  }
}
