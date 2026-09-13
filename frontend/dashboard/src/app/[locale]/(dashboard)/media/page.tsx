import { Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';
import { MediaUploadForm } from './_components/media-upload-form';
import { MediaLibrary } from './_components/media-library';

/**
 *
 */
export default async function MediaPage() {
  // TODO: Replace with data layer query from @data/media/queries
  const assets: any[] = []; // Stubbed - empty media library

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-3xl font-bold tracking-tight">Media Management</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upload New Media</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaUploadForm />
          </CardContent>
        </Card>

        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Media Library</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Select media and copy URLs for product or brand form fields.
            </p>
            <MediaLibrary initialAssets={assets} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
