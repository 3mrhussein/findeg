import { Link, redirect } from '@i18n/navigation';
import { getCachedActivePartnerMemberships } from '@data/partner/queries';
import { partnerIndexDestination } from '@data/partner/access';
import { requireAuth } from '@lib/auth-guard';
import { PartnerNotice, PartnerSuspense } from './_components/PartnerShell';

export default async function PartnerIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <PartnerSuspense label="Loading workspaces…">
      <PartnerIndex params={params} />
    </PartnerSuspense>
  );
}

async function PartnerIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAuth(locale);
  const destination = partnerIndexDestination(await getCachedActivePartnerMemberships());

  if ('redirectTo' in destination) {
    return redirect({ href: destination.redirectTo, locale });
  }
  const memberships = destination.list;

  return (
    <PartnerNotice
      title="Your Partner Workspaces"
      description="Choose the Business Partner you want to work in."
    >
      {memberships.length === 0 ? (
        <p>You are not an active member of any Business Partner.</p>
      ) : (
        <ul className="divide-y">
          {memberships.map(({ partner }) => (
            <li key={partner.code}>
              <Link
                href={`/partner/${partner.code}`}
                className="flex flex-col py-3 hover:text-primary"
              >
                <span className="font-medium text-foreground">{partner.nameEn}</span>
                <span className="text-sm">{partner.nameAr}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PartnerNotice>
  );
}
