// Next.js 16 proxy.ts
// This replaces middleware.ts for clearer network boundary semantics.

export default async function proxy(request: Request) {
  const url = new URL(request.url);
  
  // Example: Handle locale detection or redirects
  // For now, we just pass through
  
  return;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
