"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@ui";
import { Icon } from "@ui";
import type { SchoolListResult } from "@features/catalog/application/interfaces/ISchoolListRepository";

interface SchoolListsProps {
  schoolLists: SchoolListResult[];
}

/**
 * Admin School Lists Management Component
 *
 * Provides an overview of all supply lists and actions to create or edit them.
 */
export const SchoolLists: React.FC<SchoolListsProps> = ({ schoolLists }) => {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("Pages.Dashboard.SchoolLists")}</h2>
          <p className="text-muted-foreground">Manage grade-specific supply lists for schools.</p>
        </div>
        <Button>
          <Icon name="plus" className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
          Add New List
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 transition-colors">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                School Name
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Grade
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Academic Year
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Slug
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {schoolLists.length === 0 ? (
              <tr className="border-b transition-colors hover:bg-muted/50">
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No school lists found. Click &quot;Add New List&quot; to get started.
                </td>
              </tr>
            ) : (
              schoolLists.map((list) => (
                <tr key={list.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle font-medium">{list.schoolName}</td>
                  <td className="p-4 align-middle">{list.grade}</td>
                  <td className="p-4 align-middle">{list.academicYear}</td>
                  <td className="p-4 align-middle">
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">{list.slug}</code>
                  </td>
                  <td className="p-4 align-middle">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        list.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      }`}
                    >
                      {list.isActive ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-right gap-2 flex justify-end">
                    <Button variant="ghost" size="icon">
                      <Icon name="eye" className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Icon name="edit" className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
