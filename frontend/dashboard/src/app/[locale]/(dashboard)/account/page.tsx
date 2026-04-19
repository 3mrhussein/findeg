import { getTranslations } from "next-intl/server";
import { getSession } from "@lib/session";
import { getMyAccountDataQuery } from "@queries/dashboard-queries";
import { updateMyProfileAction } from "@actions/profile-actions";
import { isDomainError, getErrorMessage } from "@lib/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@ui";
import { ProfileForm } from "./_components/ProfileForm";

interface MyAccountPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MyAccountPage({ params }: MyAccountPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages.Dashboard" });

  // Call app-layer query to get user data
  let userData = null;
  let error = null;

  try {
    const session = await getSession();
    if (!session?.userId) {
      error = "Not authenticated";
    } else {
      userData = await getMyAccountDataQuery(session.userId);
    }
  } catch (err) {
    if (isDomainError(err)) {
      error = getErrorMessage(err);
    } else {
      error = t("FailedToLoadAccount");
      console.error("[dashboard] My account page error:", err);
    }
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">{t("Profile")}</h1>
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
        <h1 className="text-2xl font-bold">{t("Profile")}</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">{t("Profile")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("ProfileInfo") || "Profile Information"}</CardTitle>
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

function OrdersList({ orders }: { orders: any[] }) {
  if (!orders || orders.length === 0) {
    return <p className="text-gray-500">No orders yet</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order: any) => (
        <div key={order.id} className="flex justify-between border-b pb-4">
          <div>
            <p className="font-medium">Order #{order.id}</p>
            <p className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">${Number(order.total || 0).toFixed(2)}</p>
            <p className="text-sm text-gray-500">{order.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
