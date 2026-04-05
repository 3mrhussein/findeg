/**
 * Authentication Helper Functions Unit Tests
 *
 * Tests auth helper functions with mocks
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { requirePermission, requireRole } from "../helpers/auth-helpers";
import { IPermissionService } from "../interfaces/IPermissionService";
import { ID } from "@/features/core/domain/types/common";
import { PermissionCode, RoleId } from "@/features/core/domain/value-objects";
import { ForbiddenError } from "@/lib/errors";

describe("Authentication Helpers", () => {
  let mockPermissionService: IPermissionService;

  beforeEach(() => {
    mockPermissionService = {
      hasPermission: vi.fn(),
      hasRole: vi.fn(),
      getUserPermissions: vi.fn(),
      getUserRoles: vi.fn(),
    };
  });

  describe("requirePermission", () => {
    it("should not throw when user has permission", async () => {
      vi.spyOn(mockPermissionService, "hasPermission").mockResolvedValue(true);

      await expect(
        requirePermission(
          "user-123" as ID,
          mockPermissionService,
          "products:delete" as PermissionCode
        )
      ).resolves.not.toThrow();

      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(
        "user-123",
        "products:delete"
      );
    });

    it("should throw ForbiddenError when user lacks permission", async () => {
      vi.spyOn(mockPermissionService, "hasPermission").mockResolvedValue(false);

      await expect(
        requirePermission(
          "user-123" as ID,
          mockPermissionService,
          "products:delete" as PermissionCode
        )
      ).rejects.toThrow(ForbiddenError);

      await expect(
        requirePermission(
          "user-123" as ID,
          mockPermissionService,
          "products:delete" as PermissionCode
        )
      ).rejects.toThrow("User does not have required permission: products:delete");
    });
  });

  describe("requireRole", () => {
    it("should not throw when user has role", async () => {
      vi.spyOn(mockPermissionService, "hasRole").mockResolvedValue(true);

      await expect(
        requireRole("user-123" as ID, mockPermissionService, "admin" as RoleId)
      ).resolves.not.toThrow();

      expect(mockPermissionService.hasRole).toHaveBeenCalledWith("user-123", "admin");
    });

    it("should throw ForbiddenError when user lacks role", async () => {
      vi.spyOn(mockPermissionService, "hasRole").mockResolvedValue(false);

      await expect(
        requireRole("user-123" as ID, mockPermissionService, "admin" as RoleId)
      ).rejects.toThrow(ForbiddenError);

      await expect(
        requireRole("user-123" as ID, mockPermissionService, "admin" as RoleId)
      ).rejects.toThrow("User does not have required role: admin");
    });
  });
});
