"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CollectionInput,
  CollectionInputSchema,
} from "@backend/features/administration/domain/types";
import { Collection } from "@backend/features/catalog";
import { Tag } from "@backend/features/catalog";
import { useTranslations } from "next-intl";
import { useRouter } from "@i18n/navigation";
import { useToast } from "@hooks/use-toast";
import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui";
import { Input } from "@ui";
import { Button } from "@ui";
import { Switch } from "@ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui";
import { Badge } from "@ui";
import { ChevronLeft, Save, Loader2, Image as ImageIcon, Tag as TagIcon } from "lucide-react";
import {
  createCollectionAction as adminCreateCollectionAction,
  updateCollectionAction as adminUpdateCollectionAction,
} from "@actions/admin-actions";

import { Checkbox } from "@ui";
import Image from "next/image";

interface CollectionFormProps {
  collection?: Collection;
  availableTags: Tag[];
}

/**
 *
 */
export function CollectionForm({ collection, availableTags }: CollectionFormProps) {
  const t = useTranslations("Pages.Dashboard.Collections.Form");
  const commonT = useTranslations("Common");
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CollectionInput>({
    resolver: zodResolver(CollectionInputSchema) as Resolver<CollectionInput>,
    defaultValues: {
      slug: collection?.slug || "",
      localizedTitle: collection?.localizedTitle || { en: "", ar: "" },
      localizedSubtitle: collection?.localizedSubtitle ?? undefined,
      heroImageUrl: collection?.heroImageUrl || "",
      sortOrder: collection?.sortOrder || 0,
      isActive: collection?.isActive !== undefined ? collection.isActive : true,
      tagIds: collection?.tags?.map((t) => t.id as number) || [],
    },
  });

  // Auto-slugify
  const watchTitle = form.watch("localizedTitle.en");
  useEffect(() => {
    if (watchTitle && !collection) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("slug", slug);
    }
  }, [watchTitle, form, collection]);

  /**
   *
   */
  const onSubmit = async (data: CollectionInput) => {
    setIsSubmitting(true);
    try {
      const result = collection
        ? await adminUpdateCollectionAction(collection.id as number, data)
        : await adminCreateCollectionAction(data);

      if (result.success) {
        toast({ title: collection ? "Collection updated" : "Collection created" });
        router.push("/catalog/collections");
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.back()} type="button">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">
              {collection ? "Edit Collection" : "New Collection"}
            </h2>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {collection ? "Save Changes" : "Create Collection"}
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">General Info</TabsTrigger>
            <TabsTrigger value="tags">Tags Selection</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Configure titles, slug and display properties.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="localizedTitle.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title (English)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Back to School" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="localizedTitle.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title (Arabic)</FormLabel>
                        <FormControl>
                          <Input {...field} dir="rtl" placeholder="مثلاً: العودة للمدارس" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="back-to-school" />
                      </FormControl>
                      <FormDescription>Unique URL identifier.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="localizedSubtitle.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle (English)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="localizedSubtitle.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle (Arabic)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} dir="rtl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="heroImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero Image URL</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input {...field} value={field.value || ""} placeholder="https://..." />
                          <div className="h-10 w-10 shrink-0 border rounded overflow-hidden bg-muted flex items-center justify-center">
                            {field.value ? (
                              <Image src={field.value} className="object-cover h-full w-full" />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort Order</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
                        <div className="space-y-0.5">
                          <FormLabel>Active Status</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Define Tags</CardTitle>
                <CardDescription>
                  Products with ANY of these tags will be included in this collection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {availableTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center space-x-2 border rounded-md p-2 hover:bg-accent transition-colors"
                    >
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={form.watch("tagIds").includes(tag.id as number)}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("tagIds");
                          if (checked) {
                            form.setValue("tagIds", [...current, tag.id as number]);
                          } else {
                            form.setValue(
                              "tagIds",
                              current.filter((id: number) => id !== tag.id),
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`tag-${tag.id}`}
                        className="flex flex-1 items-center gap-2 cursor-pointer"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color || "#ccc" }}
                        />
                        <span className="text-sm font-medium">{tag.key}</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {tag.group}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
                {availableTags.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">
                    No tags available. Create tags first.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
