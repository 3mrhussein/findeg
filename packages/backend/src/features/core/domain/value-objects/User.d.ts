import { z } from "zod";
/**
 * User Value Object Schema
 *
 * Represents the essential, immutable identity of a user.
 * Used in sessions, profiles, and lightweight displays.
 */
export declare const UserVOSchema: z.ZodObject<{
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    fullName: z.ZodString;
}, z.core.$strip>;
export type UserVO = z.infer<typeof UserVOSchema>;
/**
 * Factory function to create a UserVO from constituent parts.
 * Automatically computes the fullName.
 */
export declare function createUserVO(data: {
    email: string;
    firstName?: string;
    lastName?: string;
}): UserVO;
