'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';
import { Plus, Tag, FolderTree, PackagePlus } from 'lucide-react';
import { Link } from '@i18n/navigation';
import { useTranslations } from 'next-intl';

export function QuickActionsWidget() {
  const t = useTranslations('Administration.Dashboard.Widgets.QuickActions');

  const actions = [
    {
      title: t('AddProduct'),
      description: t('AddProductDesc'),
      icon: PackagePlus,
      href: '/products/new',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor:
        'bg-blue-50 dark:bg-blue-900/40 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60',
      borderColor: 'border-blue-100 dark:border-blue-900/30',
    },
    {
      title: t('AddCategory'),
      description: t('AddCategoryDesc'),
      icon: FolderTree,
      href: '/categories?action=new',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor:
        'bg-emerald-50 dark:bg-emerald-900/40 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60',
      borderColor: 'border-emerald-100 dark:border-emerald-900/30',
    },
    {
      title: t('ManageBrands'),
      description: t('ManageBrandsDesc'),
      icon: Tag,
      href: '/brands',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor:
        'bg-purple-50 dark:bg-purple-900/40 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/60',
      borderColor: 'border-purple-100 dark:border-purple-900/30',
    },
    {
      title: t('ManageTags'),
      description: t('ManageTagsDesc'),
      icon: Plus,
      href: '/tags',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor:
        'bg-amber-50 dark:bg-amber-900/40 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/60',
      borderColor: 'border-amber-100 dark:border-amber-900/30',
    },
  ];

  return (
    <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">{t('Title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 mt-1">
          {actions.map((action, i) => (
            <Link key={i} href={action.href} className="group block">
              <div className="flex flex-col sm:flex-row sm:items-center p-3 rounded-xl border border-gray-100 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all bg-white dark:bg-slate-950/50">
                <div
                  className={`flex items-center justify-center h-10 w-10 shrink-0 rounded-lg ${action.bgColor} ${action.color} mr-4 transition-colors`}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
