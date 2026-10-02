import { PartnerSuspense } from '../_components/PartnerShell';
import { getCachedPartnerContext } from '@data/partner/queries';

/**
 * Partner Workspace shell. This layout is NOT an access check: Next.js layouts
 * do not re-render on client navigation, and the router renders route segments
 * regardless of what a layout returns. Every page below it must itself call
 * `requireWorkspaceAccess(code, roles, action)` (see `_components/PartnerShell`),
 * which resolves the context for the request and applies `memberships.requireRole`.
 * The layout only adds a read-only banner for suspended Business Partners.
 */
export default function PartnerWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; code: string }>;
}) {
  return (
    <>
      <PartnerSuspense>
        <PartnerBanner params={params} />
      </PartnerSuspense>
      {children}
    </>
  );
}

async function PartnerBanner({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const context = await getCachedPartnerContext(code);
  if (!context.success || context.data.partner.status !== 'suspended') return null;
  return (
    <p role="status" className="bg-muted px-6 py-3 text-center text-sm">
      This Business Partner is suspended. Its workspace is read-only.
    </p>
  );
}
