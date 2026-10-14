'use client';

import type { Locale } from '@findeg/domain';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CollectionInputSchema, type CollectionInput } from '@findeg/catalog';
import type { Collection, Tag } from '@findeg/catalog';
import { useRouter } from '@i18n/navigation';
import { useToast } from '@hooks/use-toast';
import { useDebounce } from '@hooks/use-debounce';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Button } from '@findeg/ui';
import { Switch } from '@findeg/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@findeg/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@findeg/ui';
import { Badge } from '@findeg/ui';
import { ChevronLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { Checkbox } from '@findeg/ui';
import Image from 'next/image';
import {
  createCollectionAction,
  updateCollectionAction,
  checkCollectionSlugAvailableAction,
} from '@data/collections/actions';

interface CollectionFormProps {
  collection?: (Collection & { tags?: Tag[] }) | null;
  availableTags: Tag[];
}

export function CollectionForm({ collection, availableTags }: CollectionFormProps) {
  const t = useTranslations('Pages.Dashboard.Collections');
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const form = useForm<CollectionInput>({
    resolver: zodResolver(CollectionInputSchema) as Resolver<CollectionInput>,
    defaultValues: {
      slug: collection?.slug || '',
      localizedTitle:
        collection?.localizedTitle ||
        ({ en: '', ar: '' } satisfies Record<Locale, string | undefined>),
      localizedSubtitle: collection?.localizedSubtitle ?? undefined,
      heroImageUrl: collection?.heroImageUrl || '',
      sortOrder: collection?.sortOrder || 0,
      isActive: collection?.isActive !== undefined ? collection.isActive : true,
      tagIds: collection?.tags?.map((t) => t.id as number) || [],
    },
  });

  const slugEditedManually = useRef(false);
  const watchTitle = form.watch('localizedTitle.en');
  const slug = form.watch('slug');
  const debouncedSlug = useDebounce(slug, 500);

  // Auto-slugify when creating
  useEffect(() => {
    if (watchTitle && !collection && !slugEditedManually.current) {
      const generatedSlug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [watchTitle, form, collection]);

  // Check slug availability
  useEffect(() => {
    async function checkSlug() {
      if (!debouncedSlug || debouncedSlug.length < 2) {
        setIsSlugAvailable(null);
        return;
      }

      if (collection && debouncedSlug === collection.slug) {
        setIsSlugAvailable(true);
        return;
      }

      setIsSlugChecking(true);
      try {
        const res = await checkCollectionSlugAvailableAction(
          debouncedSlug,
          collection?.id ? Number(collection.id) : undefined,
        );
        setIsSlugAvailable(res.available);
      } catch (error) {
        console.error('Collection slug check failed', error);
      } finally {
        setIsSlugChecking(false);
      }
    }
    checkSlug();
  }, [debouncedSlug, collection]);

  const onSubmit = async (data: CollectionInput) => {
    if (isSlugAvailable === false) {
      toast({
        title: t('SlugTaken'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = collection
        ? await updateCollectionAction(collection.id as number, data)
        : await createCollectionAction(data);

      if (result.success) {
        toast({ title: collection ? t('ToastUpdated') : t('ToastCreated') });
        router.push('/catalog/collections');
        router.refresh();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong' });
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
              {collection ? t('EditCollection') : t('NewCollection')}
            </h2>
          </div>
          <Button type="submit" disabled={isSubmitting || isSlugAvailable === false}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {collection ? t('Save') : t('Create')}
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">{t('GeneralInfo')}</TabsTrigger>
            <TabsTrigger value="tags">{t('TagsSelection')}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('BasicInfo')}</CardTitle>
                <CardDescription>{t('BasicInfoDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="localizedTitle.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Form.TitleEn')}</FormLabel>
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
                        <FormLabel>{t('Form.TitleAr')}</FormLabel>
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
                      <FormLabel>{t('Form.Slug')}</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              slugEditedManually.current = true;
                              field.onChange(e);
                            }}
                            placeholder="back-to-school"
                            className="pr-24 font-mono text-sm"
                          />
                        </FormControl>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          {isSlugChecking ? (
                            <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
                          ) : isSlugAvailable === true ? (
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 font-normal px-1.5 h-5 text-[10px]">
                              {t('SlugAvailable')}
                            </Badge>
                          ) : isSlugAvailable === false ? (
                            <Badge className="bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 font-normal px-1.5 h-5 text-[10px]">
                              {t('SlugTaken')}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      <FormDescription>{t('SlugDescription')}</FormDescription>
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
                        <FormLabel>{t('Form.SubtitleEn')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
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
                        <FormLabel>{t('Form.SubtitleAr')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} dir="rtl" />
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
                      <FormLabel>{t('Form.HeroImageUrl')}</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input {...field} value={field.value || ''} placeholder="https://..." />
                          <div className="relative h-10 w-10 shrink-0 border rounded overflow-hidden bg-muted flex items-center justify-center">
                            {field.value ? (
                              <Image
                                src={field.value}
                                alt={form.getValues('localizedTitle.en') || 'Collection image'}
                                className="object-cover"
                                fill
                              />
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
                        <FormLabel>{t('SortOrder')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                          <FormLabel>{t('Form.IsActive')}</FormLabel>
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
                <CardTitle>{t('DefineTags')}</CardTitle>
                <CardDescription>{t('DefineTagsDesc')}</CardDescription>
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
                        data-testid={`tag-checkbox-${tag.id}`}
                        checked={(form.watch('tagIds') || []).includes(tag.id as number)}
                        onCheckedChange={(checked) => {
                          const current = form.getValues('tagIds') || [];
                          if (checked) {
                            form.setValue('tagIds', [...current, tag.id as number], {
                              shouldDirty: true,
                            });
                          } else {
                            form.setValue(
                              'tagIds',
                              current.filter((id: number) => id !== tag.id),
                              { shouldDirty: true },
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`tag-${tag.id}`}
                        className="flex flex-1 items-center gap-2 cursor-pointer"
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color || '#ccc' }}
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
                  <p className="text-center py-8 text-muted-foreground">{t('NoTags')}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
