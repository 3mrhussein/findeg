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

export type UserVO = z.infer<typeof UserVOSchema>;

/**
 * Factory function to create a UserVO from constituent parts.
 * Automatically computes the fullName.
 */
export function createUserVO(data: {
  email: string;
  firstName?: string;
  lastName?: string;
}): UserVO {
  const fName = data.firstName?.trim() || "Admin";
  const lName = data.lastName?.trim() || "";

  return {
    email: data.email,
    firstName: fName,
    lastName: lName,
    fullName: [fName, lName].filter(Boolean).join(" "),
  };
}
