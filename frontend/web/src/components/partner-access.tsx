'use client';
import { useEffect, useState, type FormEvent } from 'react';

const roles = [
  'partner-administrator',
  'list-manager',
  'collection-staff',
  'report-viewer',
] as const;
const labels = {
  en: ['Partner Administrator', 'List Manager', 'Collection Staff', 'Report Viewer'],
  ar: ['مسؤول الشريك', 'مدير القوائم', 'موظف الاستلام', 'عارض التقارير'],
};
function RoleFields({
  ar,
  selected = ['report-viewer'],
}: {
  ar: boolean;
  selected?: readonly string[];
}) {
  return (
    <fieldset>
      <legend>{ar ? 'الأدوار' : 'Roles'}</legend>
      {roles.map((role, index) => (
        <label key={role}>
          <input
            type="checkbox"
            name="roles"
            value={role}
            defaultChecked={selected.includes(role)}
          />
          {labels[ar ? 'ar' : 'en'][index]}{' '}
        </label>
      ))}
    </fieldset>
  );
}
function outcome(status: string, ar: boolean) {
  const messages: Record<string, [string, string]> = {
    'last-administrator': [
      'Keep at least one active Partner Administrator.',
      'يجب الإبقاء على مسؤول شريك نشط واحد على الأقل.',
    ],
    'authorization-denied': [
      'You do not have permission for this action.',
      'ليس لديك صلاحية لتنفيذ هذا الإجراء.',
    ],
    'invitation-unavailable': [
      'This invitation is unavailable. Check its expiry and your verified email.',
      'الدعوة غير متاحة. تحقق من صلاحيتها ومن تأكيد بريدك الإلكتروني.',
    ],
    'membership-exists': [
      'An active or suspended membership already exists.',
      'توجد عضوية نشطة أو معلقة بالفعل.',
    ],
    'invalid-transition': [
      'This lifecycle change is not allowed.',
      'هذا التغيير في الحالة غير مسموح.',
    ],
    'invalid-input': [
      'Check the entered values and select at least one role.',
      'تحقق من القيم واختر دوراً واحداً على الأقل.',
    ],
  };
  return (
    messages[status]?.[ar ? 1 : 0] ??
    (ar ? 'تعذر إتمام الطلب. حاول مرة أخرى.' : 'Unable to complete the request. Please try again.')
  );
}
interface AccessData {
  memberships: { id: number; userId: number; status: string; roles: string[] }[];
  invitations: { id: number; email: string; status: string }[];
  history: { actorId: number; action: string; createdAt: string }[];
}
export function PartnerAccess({
  locale,
  businessPartnerId,
  portal,
}: {
  locale: string;
  businessPartnerId: number;
  portal: 'partner' | 'back-office';
}) {
  const ar = locale === 'ar';
  const root = portal === 'partner' ? '/api/v1/partner' : '/api/v1/back-office/partners';
  const endpoint = `${root}/${businessPartnerId}/access`;
  const [data, setData] = useState<AccessData>();
  const [message, setMessage] = useState('');
  const [invitation, setInvitation] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let current = true;
    fetch(endpoint)
      .then(async (response) => {
        const result = await response.json();
        if (current) response.ok ? setData(result) : setMessage(outcome(result.errorCode, ar));
      })
      .catch(() => {
        if (current) setMessage(outcome('', ar));
      });
    return () => {
      current = false;
    };
  }, [endpoint, ar]);
  async function send(input: object, suffix = 'access') {
    setBusy(true);
    setMessage('');
    setInvitation('');
    try {
      const response = await fetch(`${root}/${businessPartnerId}/${suffix}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(outcome(result.errorCode, ar));
        return;
      }
      setMessage(ar ? 'تم حفظ التغيير.' : 'Change saved.');
      if (result.token)
        setInvitation(`${location.origin}/${locale}/partner/invitations/accept#${result.token}`);
      const refreshed = await fetch(endpoint);
      if (refreshed.ok) setData(await refreshed.json());
      else setData(undefined);
    } catch {
      setMessage(outcome('', ar));
    } finally {
      setBusy(false);
    }
  }
  function submitInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void send({ action: 'invite', email: form.get('email'), roles: form.getAll('roles') });
  }
  return (
    <section className="partner-access">
      <h2>{ar ? 'إدارة الوصول' : 'Manage access'}</h2>
      <p role="status">{message}</p>
      {invitation && (
        <p>
          {ar
            ? 'شارك رابط الدعوة مع صاحب البريد الإلكتروني المحدد:'
            : 'Share this invitation link with the specified email recipient:'}{' '}
          <a href={invitation}>{invitation}</a>
        </p>
      )}
      {data && (
        <>
          <form onSubmit={submitInvitation}>
            <label>
              {ar ? 'البريد الإلكتروني' : 'Email'}{' '}
              <input name="email" type="email" required maxLength={255} />
            </label>
            <RoleFields ar={ar} />
            <button disabled={busy}>
              {ar ? 'إصدار أو إعادة إرسال دعوة' : 'Issue or resend invitation'}
            </button>
          </form>
          <h3>{ar ? 'العضويات' : 'Memberships'}</h3>
          {data.memberships.map((member) => (
            <form
              key={`${member.id}:${member.status}:${member.roles.join(',')}`}
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void send({
                  action: 'membership',
                  membershipId: member.id,
                  roles: form.getAll('roles'),
                  status: form.get('status'),
                });
              }}
            >
              <p>
                {ar ? 'المستخدم' : 'User'} #{member.userId}
              </p>
              <RoleFields ar={ar} selected={member.roles} />
              <label>
                {ar ? 'الحالة' : 'Status'}{' '}
                <select
                  name="status"
                  defaultValue={member.status}
                  disabled={member.status === 'ended'}
                >
                  <option value="active">{ar ? 'نشطة' : 'Active'}</option>
                  <option value="suspended">{ar ? 'معلقة' : 'Suspended'}</option>
                  <option value="ended">{ar ? 'منتهية' : 'Ended'}</option>
                </select>
              </label>
              <button disabled={busy || member.status === 'ended'}>
                {ar ? 'حفظ العضوية' : 'Save membership'}
              </button>
            </form>
          ))}
          <h3>{ar ? 'الدعوات' : 'Invitations'}</h3>
          <ul>
            {data.invitations.map((item) => (
              <li key={item.id}>
                {item.email} —{' '}
                {item.status === 'pending'
                  ? ar
                    ? 'قيد الانتظار'
                    : 'Pending'
                  : item.status === 'accepted'
                    ? ar
                      ? 'مقبولة'
                      : 'Accepted'
                    : ar
                      ? 'ملغاة'
                      : 'Revoked'}{' '}
                {item.status === 'pending' && (
                  <button
                    disabled={busy}
                    onClick={() => void send({ action: 'revoke', invitationId: item.id })}
                  >
                    {ar ? 'إلغاء الدعوة' : 'Revoke'}
                  </button>
                )}
              </li>
            ))}
          </ul>
          <details>
            <summary>{ar ? 'سجل الوصول' : 'Access history'}</summary>
            <ul>
              {data.history.map((item, index) => (
                <li key={index}>
                  {new Date(item.createdAt).toLocaleString(ar ? 'ar-EG' : 'en-GB')} —{' '}
                  {
                    (
                      {
                        'partner-created': ar ? 'إنشاء الشريك' : 'Partner created',
                        'partner-status-changed': ar
                          ? 'تغيير حالة الشريك'
                          : 'Partner status changed',
                        'invitation-issued': ar ? 'إصدار دعوة' : 'Invitation issued',
                        'invitation-revoked': ar ? 'إلغاء دعوة' : 'Invitation revoked',
                        'invitation-accepted': ar ? 'قبول دعوة' : 'Invitation accepted',
                        'membership-updated': ar ? 'تحديث العضوية' : 'Membership updated',
                      } as Record<string, string>
                    )[item.action]
                  }{' '}
                  — {ar ? 'المستخدم' : 'User'} #{item.actorId}
                </li>
              ))}
            </ul>
          </details>
          {portal === 'back-office' && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void send({ status: new FormData(event.currentTarget).get('status') }, 'status');
              }}
            >
              <h3>{ar ? 'حالة الشريك' : 'Partner lifecycle'}</h3>
              <label>
                {ar ? 'الحالة' : 'Status'}{' '}
                <select name="status">
                  <option value="active">{ar ? 'نشط' : 'Active'}</option>
                  <option value="suspended">{ar ? 'معلق' : 'Suspended'}</option>
                  <option value="closed">{ar ? 'مغلق نهائياً' : 'Closed permanently'}</option>
                </select>
              </label>
              <button disabled={busy}>{ar ? 'تغيير حالة الشريك' : 'Change partner status'}</button>
            </form>
          )}
        </>
      )}
    </section>
  );
}
export function AcceptInvitation({
  locale,
  authenticated,
}: {
  locale: string;
  authenticated: boolean;
}) {
  const ar = locale === 'ar';
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [signedIn, setSignedIn] = useState(authenticated);
  useEffect(() => {
    const fragment = location.hash.slice(1);
    setToken((current) => current || fragment);
    history.replaceState(null, '', location.pathname);
  }, []);
  return (
    <section className="partner-access">
      {!signedIn && (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            try {
              const response = await fetch('/api/v1/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
              });
              setSignedIn(response.ok);
              setMessage(
                response.ok
                  ? ''
                  : ar
                    ? 'تعذر تسجيل الدخول. تحقق من بياناتك.'
                    : 'Unable to sign in. Check your credentials.',
              );
            } catch {
              setMessage(outcome('', ar));
            }
          }}
        >
          <label>
            {ar ? 'البريد الإلكتروني' : 'Email'}
            <input name="email" type="email" required autoComplete="username" />
          </label>
          <label>
            {ar ? 'كلمة المرور' : 'Password'}
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button>{ar ? 'تسجيل الدخول لقبول الدعوة' : 'Sign in to accept invitation'}</button>
        </form>
      )}
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            const response = await fetch('/api/v1/partner/invitations/accept', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            });
            const result = await response.json();
            setAccepted(response.ok);
            setMessage(
              response.ok
                ? ar
                  ? 'تم قبول الدعوة. يمكنك دخول الشريك بعد تفعيله.'
                  : 'Invitation accepted. Workspace access begins when the partner is active.'
                : outcome(result.errorCode, ar),
            );
          } catch {
            setMessage(outcome('', ar));
          }
        }}
      >
        <p>
          {ar
            ? 'سجل الدخول بحساب ذي بريد إلكتروني مؤكد يطابق الدعوة.'
            : 'Sign in with the verified email account named in the invitation.'}
        </p>
        <label>
          {ar ? 'رمز الدعوة' : 'Invitation token'}{' '}
          <input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            required
            autoComplete="off"
          />
        </label>
        <button disabled={accepted || !signedIn}>{ar ? 'قبول الدعوة' : 'Accept invitation'}</button>
        <p role="status">{message}</p>
        {accepted && (
          <a href={`/${locale}/partner`}>{ar ? 'فتح مساحة الشركاء' : 'Open Partner Workspace'}</a>
        )}
      </form>
    </section>
  );
}
export function CreatePartner({ locale }: { locale: string }) {
  const ar = locale === 'ar';
  const [message, setMessage] = useState('');
  return (
    <form
      className="partner-access partner-create"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        try {
          const response = await fetch('/api/v1/back-office/partners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: form.get('code'),
              nameEn: form.get('nameEn'),
              nameAr: form.get('nameAr'),
            }),
          });
          const result = await response.json();
          if (response.ok) location.assign(`/${locale}/back-office/partners/${result.partner.id}`);
          else setMessage(outcome(result.errorCode, ar));
        } catch {
          setMessage(outcome('', ar));
        }
      }}
    >
      <h2>{ar ? 'إضافة مدرسة شريكة' : 'Onboard a Partner School'}</h2>
      <label>
        {ar ? 'الرمز' : 'Code'} <input name="code" required pattern="[a-z0-9-]+" maxLength={120} />
      </label>
      <label>
        {ar ? 'الاسم الرسمي بالإنجليزية' : 'Official English name'}{' '}
        <input name="nameEn" required maxLength={200} />
      </label>
      <label>
        {ar ? 'الاسم الرسمي بالعربية' : 'Official Arabic name'}{' '}
        <input name="nameAr" required maxLength={200} />
      </label>
      <button>{ar ? 'إنشاء الشريك' : 'Create partner'}</button>
      <p role="status">{message}</p>
    </form>
  );
}
