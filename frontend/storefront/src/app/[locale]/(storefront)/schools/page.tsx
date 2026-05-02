import { SchoolCard } from "@app/[locale]/(storefront)/school/_components/SchoolCard";
import { searchSchools, getSchoolFilterOptions } from "@/data/school/queries";
import type { SchoolSearchParams } from "@findeg/backend/features/school";
import { Badge } from "@findeg/ui";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@findeg/ui";
import { Input } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { Search, SlidersHorizontal, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";

interface PageProps {
  params: { locale: string };
  searchParams: {
    q?: string;
    gov?: string;
    type?: string;
    sys?: string;
    active?: string;
    page?: string;
  };
}

/**
 * /schools
 *
 * The main school directory page.
 * Features search, filters, and a grid of schools.
 */
export default async function SchoolsPage({ params, searchParams }: PageProps) {
  const searchParams_Parsed: SchoolSearchParams = {
    query: searchParams.q,
    governorate: searchParams.gov,
    schoolType: searchParams.type,
    academicSystem: searchParams.sys,
    activeOnly: searchParams.active === "true",
    page: parseInt(searchParams.page || "1"),
    pageSize: 12,
  };

  const { items, totalCount } = await searchSchools(searchParams_Parsed);
  const filterOptions = await getSchoolFilterOptions();

  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary">
            🏫 Find Your School
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Browse through hundreds of schools and find the exact supply list your child needs for
            the academic year.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5"
        >
          <Link href="/schools/suggest">
            <PlusCircle className="w-4 h-4" />
            Can&apos;t find your school?
          </Link>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-2 shadow-md">
        <CardContent className="p-6">
          <form className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-12 lg:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={searchParams.q}
                placeholder="Search by school name..."
                className="pl-10 h-12 text-lg shadow-sm"
              />
            </div>

            <div className="md:col-span-4 lg:col-span-2">
              <select
                name="gov"
                defaultValue={searchParams.gov}
                className="w-full h-12 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">All Governorates</option>
                {filterOptions.governorates.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 lg:col-span-2">
              <select
                name="type"
                defaultValue={searchParams.type}
                className="w-full h-12 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">All Types</option>
                {filterOptions.schoolTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 lg:col-span-3">
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-lg font-bold gap-2 shadow-sm"
              >
                Search Now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            Search Results
            <Badge variant="secondary" className="text-sm rounded-full px-3">
              {totalCount} schools found
            </Badge>
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="w-4 h-4" />
            Sort by: <span className="font-semibold text-foreground">A-Z</span>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-700 slide-in-from-bottom-2">
            {items.map((school) => (
              <SchoolCard key={school.schoolName} school={school} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-muted/5 rounded-3xl border-2 border-dashed">
            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">No schools found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We couldn&apos;t find any schools matching your search criteria. Try adjusting your
                filters or search for another name.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/schools">Clear all filters</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
