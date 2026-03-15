"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Tag, FolderTree, PackagePlus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function QuickActionsWidget() {
  const t = useTranslations("Administration.Dashboard.Widgets.QuickActions");

  const actions = [
    {
      title: t("AddProduct"),
      description: t("AddProductDesc"),
      icon: PackagePlus,
      href: "/admin/products/new",
      color: "text-blue-600",
      bgColor: "bg-blue-50 group-hover:bg-blue-100",
      borderColor: "border-blue-100",
    },
    {
      title: t("AddCategory"),
      description: t("AddCategoryDesc"),
      icon: FolderTree,
      href: "/admin/categories?action=new",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 group-hover:bg-emerald-100",
      borderColor: "border-emerald-100",
    },
    {
      title: t("ManageBrands"),
      description: t("ManageBrandsDesc"),
      icon: Tag,
      href: "/admin/brands",
      color: "text-purple-600",
      bgColor: "bg-purple-50 group-hover:bg-purple-100",
      borderColor: "border-purple-100",
    },
    {
      title: t("ManageTags"),
      description: t("ManageTagsDesc"),
      icon: Plus,
      href: "/admin/tags",
      color: "text-amber-600",
      bgColor: "bg-amber-50 group-hover:bg-amber-100",
      borderColor: "border-amber-100",
    },
  ];

  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">{t("Title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 mt-1">
          {actions.map((action, i) => (
            <Link key={i} href={action.href} className="group block">
              <div
                className={`flex items-center p-3 rounded-xl border ${action.borderColor} hover:border-slate-300 hover:shadow-sm transition-all bg-white`}
              >
                <div
                  className={`flex items-center justify-center h-10 w-10 shrink-0 rounded-lg ${action.bgColor} ${action.color} mr-4 transition-colors`}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
