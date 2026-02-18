import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServices } from "@/server/getServices";
import { MediaUploadForm } from "@/components/admin/media/media-upload-form";
import { MediaLibrary } from "@/components/admin/media/media-library";

export default async function MediaPage() {
  const { media } = getServices();
  const assets = await media.getLibraryAssets();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
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
