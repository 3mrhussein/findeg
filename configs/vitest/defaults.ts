// Compatibility baseline. Coverage and test-placement enforcement belong to #437.
export const nodeTest = { environment: 'node' as const };
export const browserTest = { environment: 'jsdom' as const, globals: true };
