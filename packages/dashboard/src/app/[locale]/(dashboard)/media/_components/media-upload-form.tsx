"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "@i18n/navigation";
import { Upload } from "lucide-react";
import { Button } from "@ui";
import { Input } from "@ui";
import { Label } from "@ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui";
import { useToast } from "@hooks/use-toast";

const FOLDER_OPTIONS = [
  { value: "general", label: "General" },
  { value: "products", label: "Products" },
  { value: "brands", label: "Brands" },
] as const;

/**
 *
 */
export function MediaUploadForm() {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [folder, setFolder] = useState<string>("general");
  const [uploading, setUploading] = useState(false);

  /**
   *
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (uploading) return;

    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Please choose a file first.",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/v1/media", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message || "Upload failed.");
      }

      toast({
        title: "Media uploaded",
        description: "Your file has been uploaded successfully.",
      });

      if (fileRef.current) {
        fileRef.current.value = "";
      }
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unexpected upload error.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="media-file">Image</Label>
        <Input
          id="media-file"
          type="file"
          ref={fileRef}
          name="file"
          accept="image/*"
          data-testid="admin-media-file-input"
        />
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="media-folder">Folder</Label>
        <Select value={folder} onValueChange={setFolder} disabled={uploading}>
          <SelectTrigger id="media-folder" data-testid="admin-media-folder-select">
            <SelectValue placeholder="Select folder" />
          </SelectTrigger>
          <SelectContent>
            {FOLDER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={uploading} data-testid="admin-media-upload-submit">
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </form>
  );
}
