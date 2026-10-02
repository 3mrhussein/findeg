import { Badge, Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';

interface SchoolProfileClientProps {
  lists: import('@findeg/backend/features/catalog').SchoolListResult[];
}

/**
 * SchoolProfileClient
 *
 * Displays a school's grade lists. Opening a list is by its public code only.
 */
export function SchoolProfileClient({ lists }: SchoolProfileClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {lists.map((list) => (
        <Card key={list.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">{list.grade}</CardTitle>
            <Badge variant={list.isActive ? 'default' : 'outline'}>{list.academicYear}</Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{list.schoolName}</CardContent>
        </Card>
      ))}
    </div>
  );
}
