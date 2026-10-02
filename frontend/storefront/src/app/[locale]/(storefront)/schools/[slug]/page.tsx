import { getSchoolProfile } from '@/data/school/queries';
import { SchoolProfileClient } from './SchoolProfileClient';
import { notFound } from 'next/navigation';
import { Badge } from '@findeg/ui';
import { School, MapPin, GraduationCap, Calendar, ShieldCheck } from 'lucide-react';

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
  const school = await getSchoolProfile(params.slug);

  if (!school) {
    notFound();
  }

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

      <div className="space-y-12">
        {/* Main Content: Grade Lists */}
        <div className="space-y-8">
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-3xl font-black flex items-center gap-3">
              Grade Supply Lists
              <Badge variant="secondary" className="rounded-full">
                {school.lists.filter((l) => l.isActive).length} Active
              </Badge>
            </h2>
          </div>

          <SchoolProfileClient lists={school.lists} />
        </div>
      </div>
    </div>
  );
}
