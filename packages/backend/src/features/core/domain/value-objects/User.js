import { z } from "zod";
/**
 * User Value Object Schema
 *
 * Represents the essential, immutable identity of a user.
 * Used in sessions, profiles, and lightweight displays.
 */
export const UserVOSchema = z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    fullName: z.string().min(1),
});
/**
 * Factory function to create a UserVO from constituent parts.
 * Automatically computes the fullName.
 */
export function createUserVO(data) {
    var _a, _b;
    const fName = ((_a = data.firstName) === null || _a === void 0 ? void 0 : _a.trim()) || "Admin";
    const lName = ((_b = data.lastName) === null || _b === void 0 ? void 0 : _b.trim()) || "";
    return {
        email: data.email,
        firstName: fName,
        lastName: lName,
        fullName: [fName, lName].filter(Boolean).join(" "),
    };
}
