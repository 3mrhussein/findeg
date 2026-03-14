import { getServices } from "@/server/getServices";
import { getOptionalSession } from "@/lib/auth-guard";
import { SchoolAuthWall } from "@/app/[locale]/(storefront)/school/_components/SchoolAuthWall";
import { SchoolProfileClient } from "./SchoolProfileClient";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { School, MapPin, GraduationCap, Calendar, Clock, Info, ShieldCheck } from "lucide-react";

interface PageProps {
  params: { locale: string; slug: string };
}

/**
 * /schools/[slug]
 *
 * School Profile Page.
 * Displays all grade lists for a specific school.
 */
export default async function SchoolProfilePage({ params }: PageProps) {
  const session = await getOptionalSession();

  if (!session) {
    return <SchoolAuthWall schoolName={params.slug.replace(/-/g, " ")} />;
  }

  const { schoolDirectory, schoolAccess } = getServices();
  const school = await schoolDirectory.getBySlug(params.slug);

  if (!school) {
    return notFound();
  }

  // Hydrate lists with access states for the current user
  const listsWithAccess = await Promise.all(
    school.lists.map(async (list: any) => {
      const accessState = await schoolAccess.getAccessState(list.id, session.userId);
      return {
        ...list,
        accessState,
      };
    }),
  );

  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      {/* Hero / Header Section */}
      <div className="relative overflow-hidden rounded-3xl border shadow-xl bg-card">
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-r from-primary/20 via-primary/5 to-transparent border-b" />

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-background rounded-2xl border-2 border-primary/10 flex items-center justify-center shadow-lg shrink-0">
            <School className="w-12 h-12 md:w-16 md:h-16 text-primary" />
          </div>

          <div className="grow space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-primary font-bold">
                  {school.schoolType}
                </Badge>
                <Badge variant="secondary" className="font-semibold">
                  {school.academicSystem}
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 flex gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified School
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
                {school.name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground text-lg">
                <MapPin className="w-5 h-5" />
                <span>
                  {school.area}, {school.governorate}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <GraduationCap className="w-5 h-5 text-primary/60" />
                {school.lists.length} grade levels listed
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-5 h-5 text-primary/60" />
                Updated for 2024/2025
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content: Grade Lists */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-3xl font-black flex items-center gap-3">
              Grade Supply Lists
              <Badge variant="secondary" className="rounded-full">
                {school.lists.filter((l: any) => l.isActive).length} Active
              </Badge>
            </h2>
          </div>

          <SchoolProfileClient schoolName={school.name} initialLists={listsWithAccess} />
        </div>

        {/* Sidebar: Info / Help */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-2 border-primary/5 bg-primary/5 sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Info className="w-5 h-5 text-primary" />
                Access Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="text-emerald-700 font-bold">1</span>
                </div>
                <div className="space-y-1">
                  <p className="font-bold">Select Grade</p>
                  <p className="text-muted-foreground">
                    Find the grade level your child is starting this year from the list on the left.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-blue-700 font-bold">2</span>
                </div>
                <div className="space-y-1">
                  <p className="font-bold">Enter Code / Request</p>
                  <p className="text-muted-foreground">
                    If a list is restricted, enter the code provided by the school or request access
                    from the principal.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-indigo-700 font-bold">3</span>
                </div>
                <div className="space-y-1">
                  <p className="font-bold">Shop Essentials</p>
                  <p className="text-muted-foreground">
                    Once access is granted, you&apos;ll see the exact items required. Add them to
                    your cart in one click!
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t font-medium flex items-center gap-3 text-muted-foreground">
                <Clock className="w-4 h-4" />
                Average approval: 2-4 hours
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
