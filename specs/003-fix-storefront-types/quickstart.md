# Quickstart

Because this feature consists strictly of build configurations and type definition fixes, testing it requires no special setup.

## Validating the Fixes

1. Navigate to the storefront directory:
   ```bash
   cd packages/storefront
   ```
2. Run the type checker:
   ```bash
   npm run type-check
   ```
3. Alternatively, run the type checker from the root workspace:
   ```bash
   npm run type-check
   ```

**Expected Outcome**: Zero compilation or missing module/export errors.
