"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Home,
  ShoppingBag,
  Search,
  Info,
  ChevronDown,
  User2,
  GraduationCap,
  LayoutGrid,
  Phone,
  LogIn,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { HeaderCategoryNode } from "@/features/catalog/application/queries/header-nav";
import ToggleTheme from "@/components/shared/ToggleTheme";
import ToggleLanguage from "@/components/shared/ToggleLanguage";
import { useTranslations } from "next-intl";
import type { SessionPayload } from "@/features/core/domain/auth";

interface AppSidebarProps {
  categories: HeaderCategoryNode[];
  user: SessionPayload | null;
}

/**
 *
 */
export function AppSidebar({ categories, user }: AppSidebarProps) {
  const t = useTranslations("Nav");
  const tPages = useTranslations("Pages");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            F
          </div>
          <span className="group-data-[collapsible=icon]:hidden">FindEg</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("Main") || "Explore"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("Home")}>
                  <Link href="/">
                    <Home className="size-4" />
                    <span>{t("Home")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("Shop")}>
                  <Link href="/shop">
                    <ShoppingBag className="size-4" />
                    <span>{t("Shop")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("SchoolLists")}>
                  <Link href="/school-lists">
                    <GraduationCap className="size-4" />
                    <span>{t("SchoolLists")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Categories Section */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("Categories")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((category) => (
                <Collapsible
                  key={category.id}
                  asChild
                  defaultOpen={false}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={category.name}>
                      <Link href={`/categories/${category.slug}`}>
                        <LayoutGrid className="size-4" />
                        <span>{category.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    {category.children.length > 0 && (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180">
                            <ChevronDown />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {category.children.map((sub) => (
                              <SidebarMenuSubItem key={sub.id}>
                                <SidebarMenuSubButton asChild>
                                  <Link href={`/categories/${sub.slug}`}>
                                    <span>{sub.name}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild className="font-medium text-primary">
                                <Link href={`/categories/${category.slug}`}>
                                  <span>{t("ViewAll") || "View All"}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Support & Static Links */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>{t("Support") || "Support"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("Search")}>
                  <Link href="/search">
                    <Search className="size-4" />
                    <span>{t("Search")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("About")}>
                  <Link href="/about">
                    <Info className="size-4" />
                    <span>{t("About")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between px-2 pb-2">
            <ToggleTheme />
            <ToggleLanguage />
          </SidebarMenuItem>
          <SidebarMenuItem>
            {user ? (
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <User2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{user.user.fullName}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.user.email}</span>
                </div>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton asChild size="lg" className="w-full">
                <Link href="/login" className="flex items-center justify-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <LogIn className="h-4 w-4" />
                  </div>
                  <span className="font-semibold group-data-[collapsible=icon]:hidden">
                    {tPages("Auth.SigninLink")}
                  </span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
