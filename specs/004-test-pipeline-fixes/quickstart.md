# Quickstart: New Test Pipeline

## Running All Tests

To run the full pipeline (Types → Unit → E2E) across the entire monorepo:

```bash
npm run test
```

## Running Tests for a Specific Package

Navigate to the package directory and run the same command:

```bash
cd packages/dashboard
npm run test
```

## Running Only Type Checks

```bash
npm run type-check
```

## Troubleshooting Type Errors

If the pipeline fails at the `type-check` phase, you can run the check with file watching to fix errors in real-time:

```bash
# Within a package
npm run type-check -- --watch
```
