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
import { IAuthService } from "../interfaces/IAuthService";
import { IUserRepository } from "../interfaces/IUserRepository";
import { ISessionProvider } from "@/features/core/application/interfaces/ISessionProvider";
import { AuthResult, RegisterInput, SessionPayload } from "@/features/core/domain/auth";
/**
 * Authentication Service
 *
 * Handles user authentication, session management, and admin validation.
 * Uses bcryptjs for secure password verification.
 */
export declare class AuthService implements IAuthService {
    private userRepository;
    private sessionProvider;
    /**
     * Creates an instance of AuthService
     *
     * @param userRepository - User data access layer
     * @param sessionProvider - Session management provider (cookie-based or JWT)
     */
    constructor(userRepository: IUserRepository, sessionProvider: ISessionProvider);
    /**
     * Authenticates a user with email and password
     *
     * Validates credentials, checks admin role, and creates a session.
     *
     * @param email - User email address
     * @param password - Plain text password
     * @returns Authentication result with user data or error message
     */
    login(email: string, password: string): Promise<AuthResult>;
    /**
     * Registers a new user account and logs them in automatically.
     *
     * @param input - Registration data including email, password, and profile details.
     * @returns Authentication result containing the new user profile or an error message.
     */
    register(input: RegisterInput): Promise<AuthResult>;
    /**
     * Logs out the current user
     *
     * Deletes the active session (cookie or token invalidation).
     */
    logout(): Promise<void>;
    /**
     * Retrieves the current session payload
     *
     * @returns Session payload with user ID, email, and role, or null if not authenticated
     */
    getSession(): Promise<SessionPayload | null>;
    /**
     * Validates that the current user is an admin
     *
     * @returns Session payload if user is authenticated and has admin role
     * @throws Error if not authenticated or not an admin
     */
    validateAdmin(): Promise<SessionPayload>;
}
