/**
 * Pure TypeScript Profile Update Action
 *
 * Contains business logic only - no framework-specific calls.
 * App-layer (dashboard) handles revalidatePath() and redirect() after update.
 */

import { container } from "@features/core/infrastructure/di/ServiceContainer";
import { NotAuthenticatedError, ValidationError } from "@features/core/domain/errors";
import type { ServiceResult } from "@features/core/application/types";

/**
 * Pure profile update service - no framework calls.
 *
 * Updates user profile and returns cache paths to revalidate.
 * Throws validation or authentication errors.
 * App-layer handles revalidatePath() and redirect().
 */
export async function updateMyProfile(
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

  await container.userRepository.update(userId, { firstName, lastName });

  return {
    success: true,
    data: {
      firstName,
      lastName,
    },
    cachePaths: ["/my-account"],
  };
}
