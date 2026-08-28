import createMiddleware from 'next-intl/middleware';
import type { NextRequest, NextResponse } from 'next/server';
import type { ICookieStore } from '@findeg/backend/features/core';
import { createDashboardCurrentSession } from '@lib/current-session';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

function currentSessionCookieStore(request: NextRequest) {
  const mutations: Array<
    | { kind: 'delete'; name: string }
    | { kind: 'set'; name: string; value: string; options?: Parameters<ICookieStore['set']>[2] }
  > = [];

  const cookieStore: ICookieStore = {
    get(name) {
      const cookie = request.cookies.get(name);
      return cookie ? { value: cookie.value } : undefined;
    },
    set(name, value, options) {
      request.cookies.set(name, value);
      mutations.push({ kind: 'set', name, value, options });
    },
    delete(name) {
      request.cookies.delete(name);
      mutations.push({ kind: 'delete', name });
    },
  };

  return {
    cookieStore,
    applyMutations(response: NextResponse) {
      for (const mutation of mutations) {
        if (mutation.kind === 'delete') {
          response.cookies.delete(mutation.name);
        } else {
          response.cookies.set(mutation.name, mutation.value, mutation.options);
        }
      }
    },
  };
}

/**
 * Reconciles the browser Current Session before Server Component rendering.
 *
 * Next.js permits cookie mutation here, unlike a Server Component. Pages and
 * Server Actions still perform their own authorization checks.
 */
export async function proxy(request: NextRequest) {
  const { cookieStore, applyMutations } = currentSessionCookieStore(request);
  const currentSession = createDashboardCurrentSession(cookieStore);

  await currentSession.getSession();
  const response = handleI18nRouting(request);
  applyMutations(response);

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
