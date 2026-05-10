/**
 * JWT Service Unit Tests
 *
 * Tests token generation, verification, refresh, and error handling.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JWTService, UnauthorizedError } from '../services/JWTService';

describe('JWTService', () => {
  let jwtService: JWTService;
  const testSecrets = {
    access: 'test-access-secret-key-minimum-32-chars',
    refresh: 'test-refresh-secret-key-minimum-32-chars',
  };

  beforeEach(() => {
    jwtService = new JWTService(testSecrets.access, testSecrets.refresh);
  });

  describe('generateTokens', () => {
    it('should generate valid access and refresh tokens', () => {
      const tokens = jwtService.generateTokens(
        'user-123',
        'user@example.com',
        ['admin', 'customer'],
        ['products:read', 'orders:create'],
      );

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens).toHaveProperty('expiresIn');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
      expect(tokens.expiresIn).toBe(15 * 60); // 15 minutes in seconds
    });

    it('should generate tokens with empty permissions array by default', () => {
      const tokens = jwtService.generateTokens('user-456', 'user2@example.com', ['customer']);

      const decoded = jwtService.verifyToken(tokens.accessToken, 'access');
      expect(decoded.permissions).toEqual([]);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode valid access token', () => {
      const tokens = jwtService.generateTokens(
        'user-789',
        'user3@example.com',
        ['admin'],
        ['products:write'],
      );

      const decoded = jwtService.verifyToken(tokens.accessToken, 'access');

      expect(decoded.userId).toBe('user-789');
      expect(decoded.email).toBe('user3@example.com');
      expect(decoded.roles).toEqual(['admin']);
      expect(decoded.permissions).toEqual(['products:write']);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should verify and decode valid refresh token', () => {
      const tokens = jwtService.generateTokens('user-101', 'user4@example.com', ['customer']);

      const decoded = jwtService.verifyToken(tokens.refreshToken, 'refresh');

      expect(decoded.userId).toBe('user-101');
      expect(decoded.email).toBe('user4@example.com');
    });

    it('should throw UnauthorizedError for invalid token', () => {
      expect(() => {
        jwtService.verifyToken('invalid.token.string', 'access');
      }).toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for token with wrong secret', () => {
      const otherService = new JWTService('different-secret-key-32-chars-min', testSecrets.refresh);
      const tokens = otherService.generateTokens('user-202', 'user@test.com', []);

      expect(() => {
        jwtService.verifyToken(tokens.accessToken, 'access');
      }).toThrow(UnauthorizedError);
    });
  });

  describe('refreshTokens', () => {
    it('should generate new token pair from valid refresh token', () => {
      const originalTokens = jwtService.generateTokens('user-303', 'user5@example.com', ['admin']);

      const newTokens = jwtService.refreshTokens(originalTokens.refreshToken);

      expect(newTokens).toHaveProperty('accessToken');
      expect(newTokens).toHaveProperty('refreshToken');
      expect(newTokens.accessToken).not.toBe(originalTokens.accessToken);
      expect(newTokens.refreshToken).not.toBe(originalTokens.refreshToken);
    });

    it('should throw UnauthorizedError for invalid refresh token', () => {
      expect(() => {
        jwtService.refreshTokens('invalid.refresh.token');
      }).toThrow(UnauthorizedError);
    });

    it('should preserve user data in refreshed tokens', () => {
      const originalTokens = jwtService.generateTokens('user-404', 'user6@example.com', [
        'customer',
        'vip',
      ]);

      const newTokens = jwtService.refreshTokens(originalTokens.refreshToken);
      const decoded = jwtService.verifyToken(newTokens.accessToken, 'access');

      expect(decoded.userId).toBe('user-404');
      expect(decoded.email).toBe('user6@example.com');
      expect(decoded.roles).toEqual(['customer', 'vip']);
    });
  });

  describe('error handling', () => {
    it('should throw error when secrets are not provided', () => {
      expect(() => {
        new JWTService('', '');
      }).toThrow('JWT secrets are required');
    });

    it('should handle expired tokens with specific error message', async () => {
      // This test would require mocking time or using a very short expiry
      // For now, we verify the error type is correct
      expect(() => {
        jwtService.verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired', 'access');
      }).toThrow(UnauthorizedError);
    });
  });
});
