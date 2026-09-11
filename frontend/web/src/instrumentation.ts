export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getWebRuntime } = await import('./server/runtime');
    getWebRuntime();
  }
}
