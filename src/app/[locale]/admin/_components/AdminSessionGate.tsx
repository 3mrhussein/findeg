import { requireAdmin } from "@/lib/auth-guard";
import { PermissionsProvider } from "@/providers/PermissionsProvider";
import type { Locale } from "next-intl";

interface AdminSessionGateProps {
  children: React.ReactNode;
  locale: string;
}

/**
 * AdminSessionGate - Handles admin authentication and provides permissions context.
 * This component is designed to be wrapped in a <Suspense> boundary in the layout
 * to prevent dynamic data access from blocking the initial render of the static shell.
 */
export async function AdminSessionGate({ children, locale }: AdminSessionGateProps) {
  const session = await requireAdmin(locale as any);

  return <PermissionsProvider session={session}>{children}</PermissionsProvider>;
}
