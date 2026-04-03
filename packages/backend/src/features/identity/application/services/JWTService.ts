/**
 * JWT Token Service
 * 
 * Provides JWT token generation, verification, and refresh functionality.
 * Uses HS256 algorithm with configurable secrets.
 * 
 * Token Specifications:
 * - Access Token: 15 minutes expiry
 * - Refresh Token: 7 days expiry
 * - Algorithm: HS256 (HMAC SHA-256)
 */

import jwt from 'jsonwebtoken';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
};

export type JWTPayload = {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat: number; // issued at (Unix timestamp)
  exp: number; // expires at (Unix timestamp)
};

export type TokenType = 'access' | 'refresh';

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export interface IJWTService {
  generateTokens(userId: string, email: string, roles: string[], permissions?: string[]): TokenPair;
  verifyToken(token: string, type: TokenType): JWTPayload;
  refreshTokens(refreshToken: string): TokenPair;
}

/**
 * JWT Service Implementation
 * 
 * Handles JWT token operations using jsonwebtoken library.
 * Requires JWT_SECRET and JWT_REFRESH_SECRET environment variables.
 */
export class JWTService implements IJWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string = '15m'; // 15 minutes
  private readonly refreshTokenExpiry: string = '7d'; // 7 days

  constructor(
    accessTokenSecret?: string,
    refreshTokenSecret?: string
  ) {
    this.accessTokenSecret = accessTokenSecret || process.env.JWT_SECRET || '';
    this.refreshTokenSecret = refreshTokenSecret || process.env.JWT_REFRESH_SECRET || '';

    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error('JWT secrets are required. Set JWT_SECRET and JWT_REFRESH_SECRET environment variables.');
    }
  }

  /**
   * Generate JWT access and refresh tokens
   * 
   * @param userId - Unique user identifier
   * @param email - User email address
   * @param roles - User roles for authorization
   * @param permissions - Optional user permissions array
   * @returns Token pair with access and refresh tokens
   */
  generateTokens(
    userId: string,
    email: string,
    roles: string[],
    permissions: string[] = []
  ): TokenPair {
    const payload = {
      userId,
      email,
      roles,
      permissions,
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      algorithm: 'HS256' as const,
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(
      { userId, email },
      this.refreshTokenSecret,
      {
        algorithm: 'HS256' as const,
        expiresIn: '7d',
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  /**
   * Verify and decode a JWT token
   * 
   * @param token - JWT token string
   * @param type - Token type ('access' or 'refresh')
   * @returns Decoded payload if valid
   * @throws {UnauthorizedError} if token is invalid or expired
   */
  verifyToken(token: string, type: TokenType = 'access'): JWTPayload {
    try {
      const secret = type === 'access' ? this.accessTokenSecret : this.refreshTokenSecret;
      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256'],
      }) as jwt.JwtPayload;

      return {
        userId: decoded.userId as string,
        email: decoded.email as string,
        roles: (decoded.roles as string[]) || [],
        permissions: (decoded.permissions as string[]) || [],
        iat: decoded.iat!,
        exp: decoded.exp!,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  /**
   * Refresh access token using refresh token
   * 
   * @param refreshToken - Valid refresh token
   * @returns New token pair with rotated refresh token
   * @throws {UnauthorizedError} if refresh token is invalid
   */
  refreshTokens(refreshToken: string): TokenPair {
    try {
      // Verify the refresh token
      const decoded = this.verifyToken(refreshToken, 'refresh');

      // Generate new token pair
      // Note: In production, you should fetch the latest user roles/permissions from DB
      return this.generateTokens(
        decoded.userId,
        decoded.email,
        decoded.roles,
        decoded.permissions
      );
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}

/**
 * Helper function to create JWT service instance
 * Uses environment variables by default
 */
export function createJWTService(): IJWTService {
  return new JWTService();
}
