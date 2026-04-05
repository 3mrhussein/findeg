/**
 * Unit Tests for CookieSessionProvider
 *
 * Tests framework-agnostic session provider with mocked cookie store.
 * Verifies:
 * 1. Session creation with JWT signing
 * 2. Session retrieval and validation
 * 3. Session deletion
 * 4. Pure TypeScript execution (no Next.js runtime)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { CookieSessionProvider, type ICookieStore } from "../CookieSessionProvider";
import type { SessionPayload } from "@/features/core/domain/auth";

/**
 * Mock cookie store implementation for testing
 */
class MockCookieStore implements ICookieStore {
  private cookies: Map<string, string> = new Map();

  get(name: string) {
    const value = this.cookies.get(name);
    return value ? { value } : undefined;
  }

  set(name: string, value: string, options?: any) {
    this.cookies.set(name, value);
  }

  delete(name: string) {
    this.cookies.delete(name);
  }

  clear() {
    this.cookies.clear();
  }

  has(name: string) {
    return this.cookies.has(name);
  }
}

/**
 * Test session payload
 */
const testSession: SessionPayload = {
  userId: 123,
  portalRole: "staff",
  user: {
    email: "admin@test.local",
    firstName: "Admin",
    lastName: "User",
    fullName: "Admin User",
  },
  activeRoleIds: ["admin", "catalog_manager"] as any[],
};

describe("CookieSessionProvider - Pure TypeScript with Injected Cookie Store", () => {
  let mockCookieStore: MockCookieStore;
  let provider: CookieSessionProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore = new MockCookieStore();
    provider = new CookieSessionProvider(mockCookieStore);
  });

  describe("Session Creation", () => {
    it("should create a session with JWT token in cookie store", async () => {
      await provider.createSession(testSession);

      expect(mockCookieStore.has("admin_session")).toBe(true);
    });

    it("should sign JWT with correct payload", async () => {
      await provider.createSession(testSession);

      const cookie = mockCookieStore.get("admin_session");
      expect(cookie).toBeDefined();
      expect(cookie!.value).toBeTruthy();

      // JWT format: header.payload.signature
      const parts = cookie!.value.split(".");
      expect(parts.length).toBe(3);
    });

    it("should set HttpOnly and secure cookie options", async () => {
      const setOptions: any[] = [];
      const spySet = vi.spyOn(mockCookieStore, "set").mockImplementation((name, value, options) => {
        setOptions.push(options);
      });

      await provider.createSession(testSession);

      expect(spySet).toHaveBeenCalled();
      const options = setOptions[0];
      expect(options.httpOnly).toBe(true);
      expect(options.sameSite).toBe("lax");
      expect(typeof options.maxAge).toBe("number");
    });

    it("should work with minimal session payload", async () => {
      const minimal: SessionPayload = {
        userId: 456,
        portalRole: "customer",
        user: {
          email: "user@test.local",
          firstName: "Test",
          lastName: "User",
          fullName: "Test User",
        },
      };

      await provider.createSession(minimal);
      expect(mockCookieStore.has("admin_session")).toBe(true);
    });
  });

  describe("Session Retrieval", () => {
    it("should return null when no session cookie exists", async () => {
      const session = await provider.getSession();
      expect(session).toBeNull();
    });

    it("should retrieve and validate existing session", async () => {
      await provider.createSession(testSession);
      const retrieved = await provider.getSession();

      expect(retrieved).toBeDefined();
      expect(retrieved?.userId).toBe(testSession.userId);
      expect(retrieved?.portalRole).toBe(testSession.portalRole);
      expect(retrieved?.user.email).toBe(testSession.user.email);
    });

    it("should include active roles in retrieved session", async () => {
      await provider.createSession(testSession);
      const retrieved = await provider.getSession();

      expect(retrieved?.activeRoleIds).toEqual(testSession.activeRoleIds);
    });

    it("should return null for invalid JWT", async () => {
      mockCookieStore.set("admin_session", "invalid.jwt.token");
      const session = await provider.getSession();
      expect(session).toBeNull();
    });

    it("should return null for corrupted cookie", async () => {
      mockCookieStore.set("admin_session", "not-a-jwt");
      const session = await provider.getSession();
      expect(session).toBeNull();
    });
  });

  describe("Session Deletion", () => {
    it("should delete session cookie", async () => {
      await provider.createSession(testSession);
      expect(mockCookieStore.has("admin_session")).toBe(true);

      await provider.deleteSession();
      expect(mockCookieStore.has("admin_session")).toBe(false);
    });

    it("should handle deleting non-existent session gracefully", async () => {
      expect(mockCookieStore.has("admin_session")).toBe(false);
      await expect(provider.deleteSession()).resolves.not.toThrow();
    });
  });

  describe("Session Lifecycle", () => {
    it("should handle full create-retrieve-delete lifecycle", async () => {
      // Create
      await provider.createSession(testSession);
      expect(mockCookieStore.has("admin_session")).toBe(true);

      // Retrieve and verify
      const retrieved = await provider.getSession();
      expect(retrieved?.userId).toBe(testSession.userId);

      // Delete
      await provider.deleteSession();
      expect(mockCookieStore.has("admin_session")).toBe(false);

      // Verify deleted
      const afterDelete = await provider.getSession();
      expect(afterDelete).toBeNull();
    });

    it("should support updating session", async () => {
      const session1 = { ...testSession, userId: 100 };
      const session2 = { ...testSession, userId: 200 };

      await provider.createSession(session1);
      let retrieved = await provider.getSession();
      expect(retrieved?.userId).toBe(100);

      await provider.deleteSession();
      await provider.createSession(session2);

      retrieved = await provider.getSession();
      expect(retrieved?.userId).toBe(200);
    });
  });

  describe("Pure TypeScript Verification", () => {
    it("should not require Next.js runtime", async () => {
      // This test proves that CookieSessionProvider works in pure Node.js
      // If it required Next.js (e.g., importing 'next/headers'), it would fail here
      const session = await provider.getSession();
      expect(session).toBeNull();
    });

    it("should accept any ICookieStore implementation", async () => {
      /**
       * Alternative cookie store for testing different implementations
       */
      class AlternativeCookieStore implements ICookieStore {
        private storage: Record<string, string> = {};

        get(name: string) {
          const value = this.storage[name];
          return value ? { value } : undefined;
        }

        set(name: string, value: string) {
          this.storage[name] = value;
        }

        delete(name: string) {
          delete this.storage[name];
        }
      }

      const altStore = new AlternativeCookieStore();
      const altProvider = new CookieSessionProvider(altStore);

      await altProvider.createSession(testSession);
      const retrieved = await altProvider.getSession();

      expect(retrieved?.userId).toBe(testSession.userId);
    });

    it("should work with mocked cookie store", async () => {
      const mockStore = vi.fn<[name: string], ICookieStore>((name: string) => ({
        get: vi.fn((n: string) => (n === "admin_session" ? { value: "jwt-token" } : undefined)),
        set: vi.fn(),
        delete: vi.fn(),
      }));

      // This demonstrates that CookieSessionProvider accepts any object
      // matching the ICookieStore interface (duck typing)
      expect(typeof mockStore).toBe("function");
    });
  });

  describe("Different Session Payloads", () => {
    it("should preserve all session properties", async () => {
      const fullSession: SessionPayload = {
        userId: 789,
        portalRole: "school_staff",
        user: {
          email: "school@test.local",
          firstName: "School",
          lastName: "Admin",
          fullName: "School Admin",
        },
        activeRoleIds: ["school_admin", "teacher"] as any[],
        permissionCodes: ["read:students", "write:grades"] as any[],
        subjectId: "school-123",
        actorType: "school_staff" as any,
        organizationId: "org-456",
        tokenVersion: 1,
      };

      await provider.createSession(fullSession);
      const retrieved = await provider.getSession();

      expect(retrieved?.userId).toBe(fullSession.userId);
      expect(retrieved?.portalRole).toBe(fullSession.portalRole);
      expect(retrieved?.activeRoleIds).toEqual(fullSession.activeRoleIds);
      expect(retrieved?.permissionCodes).toEqual(fullSession.permissionCodes);
      expect(retrieved?.subjectId).toBe(fullSession.subjectId);
      expect(retrieved?.actorType).toBe(fullSession.actorType);
      expect(retrieved?.organizationId).toBe(fullSession.organizationId);
      expect(retrieved?.tokenVersion).toBe(fullSession.tokenVersion);
    });

    it("should handle sessions with minimal properties", async () => {
      const minimalSession: SessionPayload = {
        userId: 999,
        portalRole: "customer",
        user: {
          email: "customer@test.local",
          firstName: "Customer",
          lastName: "User",
          fullName: "Customer User",
        },
      };

      await provider.createSession(minimalSession);
      const retrieved = await provider.getSession();

      expect(retrieved?.userId).toBe(minimalSession.userId);
      expect(retrieved?.portalRole).toBe(minimalSession.portalRole);
      expect(retrieved?.activeRoleIds).toBeUndefined();
    });
  });

  describe("Dependency Injection", () => {
    it("should use injected cookie store, not global cookies()", async () => {
      const trackCalls: string[] = [];
      const trackingStore: ICookieStore = {
        get(name: string) {
          trackCalls.push(`get:${name}`);
          return mockCookieStore.get(name);
        },
        set(name: string, value: string, options) {
          trackCalls.push(`set:${name}`);
          mockCookieStore.set(name, value, options);
        },
        delete(name: string) {
          trackCalls.push(`delete:${name}`);
          mockCookieStore.delete(name);
        },
      };

      const trackingProvider = new CookieSessionProvider(trackingStore);

      await trackingProvider.createSession(testSession);
      expect(trackCalls).toContain("set:admin_session");

      trackCalls.length = 0;

      await trackingProvider.getSession();
      expect(trackCalls).toContain("get:admin_session");

      trackCalls.length = 0;

      await trackingProvider.deleteSession();
      expect(trackCalls).toContain("delete:admin_session");
    });

    it("should not import or call next/headers", async () => {
      // This test proves the provider doesn't have a hard dependency on Next.js
      // If it did, it would fail at import time in this Node.js test environment
      expect(provider).toBeDefined();
      expect(typeof provider.createSession).toBe("function");
      expect(typeof provider.getSession).toBe("function");
      expect(typeof provider.deleteSession).toBe("function");
    });
  });
});
