'use client';
import { useState } from 'react';
import type { PartnerStatementReport } from '@findeg/backend/modules/partner-reports/contracts';
export function PartnerReport({ locale, partnerId }: { locale: string; partnerId: number }) {
  const text = (en: string, ar: string) => (locale === 'ar' ? ar : en);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState<PartnerStatementReport>();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  async function load() {
    setBusy(true);
    setReport(undefined);
    setMessage('');
    try {
      const response = await fetch(`/api/v1/partner/${partnerId}/reports?period=${period}`);
      const result = await response.json();
      if (response.ok) setReport(result.report);
      else
        setMessage(
          text(
            'Report unavailable. Check the month and your Workspace access.',
            'التقرير غير متاح. تحقق من الشهر وصلاحيات مساحة العمل.',
          ),
        );
    } catch {
      setMessage(text('Unable to load report. Try again.', 'تعذر عرض التقرير. حاول مجددًا.'));
    } finally {
      setBusy(false);
    }
  }
  const labels = {
    pending: text('Pending', 'قيد الانتظار'),
    earned: text('Earned', 'مكتسب'),
    reversed: text('Reversed', 'معكوس'),
    settled: text('Settled', 'مسوّى'),
    available: text('Available', 'متاح'),
  };
  return (
    <section aria-label={text('Partner Reward Statement', 'كشف مكافآت الشريك')}>
      <h2>{text('Partner Reward Statement', 'كشف مكافآت الشريك')}</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void load();
        }}
      >
        <label>
          {text('Month (UTC)', 'الشهر (UTC)')}
          <input
            type="month"
            min="2000-01"
            max="2099-12"
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value);
              setReport(undefined);
            }}
            required
          />
        </label>
        <button disabled={busy}>{text('Load statement', 'عرض الكشف')}</button>
      </form>
      <p role="status">{message}</p>
      {report && (
        <>
          <p>
            {text(
              'Cumulative balances through the end of the selected month.',
              'الأرصدة التراكمية حتى نهاية الشهر المحدد.',
            )}
          </p>
          <table>
            <thead>
              <tr>
                <th>{text('Balance', 'الرصيد')}</th>
                <th>{text('Points', 'النقاط')}</th>
                <th>EGP</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(labels) as (keyof typeof labels)[]).map((key) => (
                <tr key={key} data-balance={key}>
                  <th>{labels[key]}</th>
                  <td>{report.statement.points[key]}</td>
                  <td>
                    {report.statement.value?.[key] ??
                      text('Unknown historical value', 'قيمة تاريخية غير معروفة')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>
            {text('Paid attributed sales this month', 'المبيعات المنسوبة المدفوعة لهذا الشهر')}
          </h3>
          {report.suppressed && (
            <p>
              {text(
                'Low-count breakdowns are hidden for privacy.',
                'تم إخفاء التفاصيل قليلة العدد لحماية الخصوصية.',
              )}
            </p>
          )}
          <table>
            <thead>
              <tr>
                <th>{text('Day', 'اليوم')}</th>
                <th>{text('List / item / variant', 'القائمة / العنصر / الصنف')}</th>
                <th>{text('Orders', 'الطلبات')}</th>
                <th>EGP</th>
              </tr>
            </thead>
            <tbody>
              {report.sales.map((row) => (
                <tr key={`${row.day}:${row.listId}:${row.listItemId}:${row.variantId}`}>
                  <td>{row.day}</td>
                  <td>
                    {row.listId} / {row.listItemId} / {row.variantId}
                  </td>
                  <td>{row.count}</td>
                  <td>{row.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
