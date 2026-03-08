import { container } from "./src/features/core/infrastructure/di/ServiceContainer";
import { resolveLocale } from "./src/features/core/domain/value-objects";

/**
 *
 */
async function run() {
  console.log("STARTING TEST");
  try {
    console.log("Fetching categories...");
    const data = await container.categoryRepository.getAll(resolveLocale("en"));
    console.log("Success:", data?.length);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
