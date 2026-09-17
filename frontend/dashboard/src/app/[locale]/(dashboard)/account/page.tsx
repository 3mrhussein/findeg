import { getTranslations } from 'next-intl/server';
import { getSession } from '@lib/session';
import { getMyAccountDataQuery } from '@queries/dashboard-queries';
import { updateMyProfileAction } from '@actions/profile-actions';
import { domainError, getErrorMessage } from '@lib/errors';
import { Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';
import { ProfileForm } from './_components/ProfileForm';

interface MyAccountPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MyAccountPage({ params }: MyAccountPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Pages.Dashboard' });

  // Call app-layer query to get user data
  let userData = null;
  let error = null;

  try {
    const session = await getSession();
    if (!session?.userId) {
      error = 'Not authenticated';
    } else {
      userData = await getMyAccountDataQuery(session.userId);
    }
  } catch (err) {
    if (domainError(err)) {
      error = getErrorMessage(err);
    } else {
      error = t('FailedToLoadAccount');
      console.error('[dashboard] My account page error:', err);
    }
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">{t('Profile')}</h1>
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
          <CardContent className="pt-6">
            <p className="text-red-700 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">{t('Profile')}</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">{t('Profile')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('ProfileInfo') || 'Profile Information'}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            userData={{
              userId: userData.id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
            }}
            action={updateMyProfileAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}

