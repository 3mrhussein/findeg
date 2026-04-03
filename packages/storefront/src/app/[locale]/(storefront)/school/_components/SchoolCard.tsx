"use client";

import { useTranslations } from "next-intl";
import { MapPin, School, GraduationCap, ChevronRight, CheckCircle2, History } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SchoolSearchResult } from "@/features/school/application/interfaces/ISchoolDirectoryService";

interface SchoolCardProps {
  school: SchoolSearchResult;
}

/**
 * SchoolCard
 *
 * Displays school summary in the directory search results.
 */
export function SchoolCard({ school }: SchoolCardProps) {
  const t = useTranslations("School.Directory");

  const slug = school.schoolName.toLowerCase().replace(/\s+/g, "-");

  return (
    <Card className="group hover:border-primary/40 transition-all duration-300 hover:shadow-lg overflow-hidden flex flex-col h-full">
      <CardContent className="p-0 flex-grow">
        <div className="bg-primary/5 p-6 flex items-center gap-4 border-b border-primary/5 group-hover:bg-primary/10 transition-colors">
          <div className="w-14 h-14 bg-background rounded-xl border flex items-center justify-center shadow-sm shrink-0">
            <School className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors">
              {school.schoolName}
            </h3>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">
                {school.area}, {school.governorate}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {school.schoolType && (
              <Badge variant="secondary" className="font-medium">
                {school.schoolType}
              </Badge>
            )}
            {school.academicSystem && (
              <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider">
                {school.academicSystem}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase">{t("gradeCount")}</span>
              <span className="text-lg font-bold flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-primary/60" />
                {school.gradeCount}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase">{t("listStatus")}</span>
              <div className="flex items-center gap-1.5 mt-1">
                {school.hasCurrentLists ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 gap-1 pr-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t("currentYear")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground gap-1 pr-2">
                    <History className="w-3.5 h-3.5" />
                    {t("lastYear")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full gap-2 group/btn shadow-sm" size="lg">
          <Link href={`/schools/${slug}`}>
            {t("viewSchool")}
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
