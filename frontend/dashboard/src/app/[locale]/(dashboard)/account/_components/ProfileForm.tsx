'use client';

import { useState } from 'react';
import { Input, Button } from '@findeg/ui';

interface ProfileFormProps {
  userData: {
    userId: string | number;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };
  action: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
}

export function ProfileForm({ userData, action }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    try {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error('[dashboard] Profile update error:', err);
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="userId" value={String(userData.userId)} />

      <div className="space-y-2">
        <label className="block text-sm font-medium">First Name</label>
        <Input defaultValue={userData.firstName || ''} name="firstName" required />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Last Name</label>
        <Input defaultValue={userData.lastName || ''} name="lastName" required />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Email</label>
        <Input defaultValue={userData.email || ''} type="email" disabled />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
