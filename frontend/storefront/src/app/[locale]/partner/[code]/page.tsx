import { Button } from '@findeg/ui';
import { PARTNER_ADMINISTRATOR } from '@findeg/backend/features/partner-membership';
import { Link } from '@i18n/navigation';
import {
  PartnerNotice,
  PartnerSuspense,
  requireWorkspaceAccess,
} from '../_components/PartnerShell';
import { LeaveButton } from './LeaveButton';

export default async function PartnerWorkspacePage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { code } = await params;
  return (
    <PartnerSuspense label="Loading workspace…">
      <PartnerWorkspace code={code} />
    </PartnerSuspense>
  );
}

async function PartnerWorkspace({ code }: { code: string }) {
  // A closed Business Partner only exposes Reports; the workspace home is not one of them.
  const access = await requireWorkspaceAccess(code, 'any', 'read');
  if (!access.allowed) return access.notice;

  const { partner, membership } = access.context;
  return (
    <PartnerNotice title={partner.nameEn} description={partner.nameAr}>
      <h2 className="font-semibold text-foreground">Your Partner Roles</h2>
      <ul className="mt-3 list-inside list-disc">
        {membership.roles.map((role) => (
          <li key={role}>{role}</li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-start gap-3">
        {membership.roles.includes(PARTNER_ADMINISTRATOR) && (
          <>
            <Button asChild variant="outline">
              <Link href={`/partner/${code}/members`}>Members</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/partner/${code}/invitations`}>Invitations</Link>
            </Button>
          </>
        )}
        <LeaveButton code={code} />
      </div>
    </PartnerNotice>
  );
}
