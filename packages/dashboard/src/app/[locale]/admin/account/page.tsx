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

  // Call app-layer query to get user data
  let userData = null;
  let error = null;

  try {
    userData = await getMyAccountDataQuery();
  } catch (err) {
    if (isDomainError(err)) {
      error = getErrorMessage(err);
    } else {
      error = "Failed to load account data";
      console.error("[dashboard] My account page error:", err);
    }
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">My Account</h1>
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
        <h1 className="text-2xl font-bold">My Account</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">My Account</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm userData={userData} action={updateMyProfileAction} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersList orders={userData.orders || []} />
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersList({ orders }: any) {
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
            <p className="font-medium">${order.total?.toFixed(2) || "0.00"}</p>
            <p className="text-sm text-gray-500">{order.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
