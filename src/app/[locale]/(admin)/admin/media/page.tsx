import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { getServices } from "@/server/getServices";
import Image from "next/image";

/**
 *
 */
export default async function MediaPage() {
  const { media } = getServices(); // Assuming mediaService is exposed via getServices or we access container directly
  // getServices currently exposes 'mediaService' ? No, check getServices.ts
  // It exposes 'media: container.mediaService' ? No, I need to check getServices.ts again.
  // Wait, I saw getServices.ts in step 544. It did NOT expose mediaService explicitly in the returned object key 'media'.
  // It returned 'repositories' and 'adminProduct', etc.
  // I need to add 'media: container.mediaService' to getServices.ts if I want to use it here.
  // Or use container directly. Container is available on server.

  // Actually, let's use container directly for now in Server Component effectively.
  // But getServices is preferred. I'll update getServices.ts in next step or use container.

  // For now, assume I update getServices.ts.

  // But wait, I can just use container directly here since it's a Server Component.
  // import { container } from "@/infrastructure/di/ServiceContainer";
  // const files = await container.mediaService.getFiles();

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
            <form
              action="/api/v1/media/upload"
              method="POST"
              encType="multipart/form-data"
              className="space-y-4"
            >
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture">Picture</Label>
                <Input id="picture" type="file" name="file" accept="image/*" />
              </div>
              <Button type="submit">
                <Upload className="mr-2 h-4 w-4" /> Upload
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Media Library</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Files in public/uploads.</p>
            {/* We will fetch files here */}
            <MediaGallery />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Separate component for gallery to be async and handle fetching
import { container } from "@/infrastructure/di/ServiceContainer";

/**
 *
 */
async function MediaGallery() {
  // Fetch files from root uploads AND subfolders if needed.
  // LocalStorageProvider defaults to flat or we can list specific folders.
  // Let's list root and 'products' and 'brands' for now, or just root.
  // MediaService.getFiles defaults to "".

  // We might need to flatten if we have subfolders.
  const rootFiles = await container.mediaService.getFiles("");
  const productFiles = await container.mediaService.getFiles("products");
  const brandFiles = await container.mediaService.getFiles("brands");

  const allFiles = [...rootFiles, ...productFiles, ...brandFiles];

  if (allFiles.length === 0) {
    return <div className="text-sm text-gray-500">No media files found.</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {allFiles.map((file, i) => (
        <div
          key={i}
          className="relative group border rounded-lg overflow-hidden aspect-square hover:shadow-md transition-all"
        >
          <Image src={file.url} alt={file.name} fill className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
            {file.name}
          </div>
        </div>
      ))}
    </div>
  );
}
