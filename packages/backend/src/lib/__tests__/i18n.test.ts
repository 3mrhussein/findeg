/**
 * i18n Utilities Unit Tests
 *
 * Tests internationalization helper functions.
 */

import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
} from "../i18n";

describe("i18n utilities", () => {
  describe("formatCurrency", () => {
    it("should format currency in English locale", () => {
      const result = formatCurrency(1234.56, "en", "EGP");
      expect(result).toMatch(/1,234\.56/); // Format may vary but should include these
    });

    it("should format currency in Arabic locale", () => {
      const result = formatCurrency(1234.56, "ar", "EGP");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should handle zero amount", () => {
      const result = formatCurrency(0, "en");
      expect(result).toMatch(/0\.00/);
    });

    it("should use fallback on error", () => {
      const result = formatCurrency(100, "en", "INVALID");
      expect(result).toBeDefined();
    });
  });

  describe("formatDate", () => {
    it("should format date in English locale", () => {
      const date = new Date("2024-03-15");
      const result = formatDate(date, "en");
      expect(result).toContain("March");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });

    it("should format date in Arabic locale", () => {
      const date = new Date("2024-03-15");
      const result = formatDate(date, "ar");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should accept timestamp", () => {
      const timestamp = new Date("2024-03-15").getTime();
      const result = formatDate(timestamp, "en");
      expect(result).toContain("March");
    });

    it("should accept ISO string", () => {
      const result = formatDate("2024-03-15T10:30:00Z", "en");
      expect(result).toContain("March");
    });

    it("should handle custom options", () => {
      const date = new Date("2024-03-15");
      const result = formatDate(date, "en", {
        month: "short",
        day: "numeric",
      });
      expect(result).toContain("Mar");
    });
  });

  describe("formatDateTime", () => {
    it("should format date and time in English", () => {
      const date = new Date("2024-03-15T14:30:00");
      const result = formatDateTime(date, "en");
      expect(result).toContain("March");
      expect(result).toContain("15");
      expect(result).toContain("2024");
      // Time format may vary by system
    });

    it("should format date and time in Arabic", () => {
      const date = new Date("2024-03-15T14:30:00");
      const result = formatDateTime(date, "ar");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("formatRelativeTime", () => {
    it("should format future date", () => {
      const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
      const result = formatRelativeTime(futureDate, "en");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should format past date", () => {
      const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      const result = formatRelativeTime(pastDate, "en");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should handle recent time", () => {
      const recentDate = new Date(Date.now() - 30 * 1000); // 30 seconds ago
      const result = formatRelativeTime(recentDate, "en");
      expect(result).toBeDefined();
    });
  });

  describe("formatNumber", () => {
    it("should format number in English locale", () => {
      const result = formatNumber(1234567.89, "en");
      expect(result).toContain("1");
      expect(result).toContain("234");
      expect(result).toContain("567");
    });

    it("should format number in Arabic locale", () => {
      const result = formatNumber(1234567.89, "ar");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should handle custom options", () => {
      const result = formatNumber(0.5, "en", {
        style: "percent",
      });
      expect(result).toContain("50");
    });

    it("should format with specific fraction digits", () => {
      const result = formatNumber(3.14159, "en", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      expect(result).toBe("3.14");
    });
  });
});
