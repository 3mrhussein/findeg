import { Badge, Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';
import { Link } from '@/i18n/navigation';
import type { SchoolProfileList } from '@findeg/backend/features/school';

interface SchoolProfileListsProps {
  lists: SchoolProfileList[];
  locale: string;
}

/**
 * SchoolProfileLists
 *
 * A Partner School's published School Supply Lists. Each is opened by its public
 * code only; a school with none shows an empty state.
 */
export function SchoolProfileLists({ lists, locale }: SchoolProfileListsProps) {
  if (lists.length === 0) {
    return <p className="text-muted-foreground">No list published yet</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {lists.map((list) => (
        <Link key={list.publicCode} href={`/lists/${list.publicCode}`} className="block">
          <Card className="h-full transition-colors hover:border-primary/40">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">{list.grade}</CardTitle>
              <Badge variant="outline">{list.academicYear}</Badge>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {(locale === 'ar' ? list.localizedTitle.ar : list.localizedTitle.en) ||
                list.localizedTitle.en ||
                list.localizedTitle.ar}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
