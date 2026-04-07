/**
 * Loading skeleton for account page
 */

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">My Account</h1>
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}
