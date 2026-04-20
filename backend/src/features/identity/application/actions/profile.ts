"use server";

/**
 * Pure TypeScript Profile Update Action
 *
 * Contains business logic only - no framework-specific calls.
 * App-layer (dashboard) handles revalidatePath() and redirect() after update.
 */

import { NotAuthenticatedError, ValidationError } from "@findeg/backend/features/core/domain/errors";
import type { ServiceResult } from "@findeg/backend/features/core/application/types";
import type { IUserRepository } from "../interfaces/IUserRepository";

/**
 * Pure profile update service - no framework calls.
 *
 * @param userRepository - Injected user repository
 * @param userId - ID of the user to update
 * @param name - New display name
 */
export async function updateMyProfile(
  userRepository: IUserRepository,
  userId: number,
  name: string,
): Promise<
  ServiceResult<{
    firstName: string;
    lastName: string | undefined;
  }>
> {
  if (!userId) {
    throw new NotAuthenticatedError("Session required to update profile");
  }

  const trimmedName = String(name || "").trim();
  if (trimmedName.length < 2) {
    throw new ValidationError("name", "Name must be at least 2 characters");
  }

  const [firstName, ...lastNameParts] = trimmedName.split(" ");
  const lastName = lastNameParts.join(" ") || undefined;

  await userRepository.update(userId, { firstName, lastName });

  return {
    success: true,
    data: {
      firstName,
      lastName,
    },
    cachePaths: ["/my-account"],
  };
}
