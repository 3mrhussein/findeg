// Vitest stand-in for the `server-only` marker. Next.js resolves that import itself at build
// time and fails a Client Component build that reaches it; tests run outside that pipeline.
export {};
