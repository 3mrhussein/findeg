"use client";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TagInput, TagInputSchema } from "@/features/administration/domain/types/TagInput";
import { Tag } from "@/features/catalog/domain/entities/Tag";
import { useTranslations } from "next-intl";
import {
  adminCreateTagAction,
  adminUpdateTagAction,
} from "@/features/administration/application/actions/admin-tag-actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { IconPicker } from "./IconPicker";
import { TagBadge } from "@/components/shared/TagBadge";

interface TagDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: Tag;
  groups: string[];
}

/**
 *
 */
export function TagDrawer({ open, onOpenChange, tag, groups }: TagDrawerProps) {
  const t = useTranslations("Pages.Dashboard.Tags.Form");
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TagInput>({
    resolver: zodResolver(TagInputSchema) as any,
    defaultValues: {
      group: "",
      key: "",
      slug: "",
      icon: "",
      color: "#3b82f6",
      isActive: true,
      scope: "catalog",
    },
  });

  useEffect(() => {
    if (tag) {
      form.reset({
        group: tag.group,
        key: tag.key,
        slug: tag.slug,
        icon: tag.icon || "",
        color: tag.color || "#3b82f6",
        isActive: tag.isActive,
        scope: tag.scope,
      });
    } else {
      form.reset({
        group: "",
        key: "",
        slug: "",
        icon: "",
        color: "#3b82f6",
        isActive: true,
        scope: "catalog",
      });
    }
  }, [tag, form, open]);

  const watchKey = form.watch("key");
  useEffect(() => {
    if (watchKey) {
      const slug = watchKey
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("slug", slug);
    }
  }, [watchKey, form]);

  /**
   *
   */
  const onSubmit: SubmitHandler<TagInput> = async (data) => {
    setIsSubmitting(true);
    try {
      const result = tag
        ? await adminUpdateTagAction(tag.id as number, data)
        : await adminCreateTagAction(data);

      if (result.success) {
        toast({ title: tag ? "Tag updated" : "Tag created" });
        onOpenChange(false);
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

  const groupValue = form.watch("group");
  const keyValue = form.watch("key");
  const iconValue = form.watch("icon");
  const colorValue = form.watch("color");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden sm:max-w-md md:max-w-lg p-0 flex flex-col h-full bg-background border-l shadow-2xl">
        <SheetHeader className="px-6 py-5 border-b bg-card/50">
          <SheetTitle className="text-lg font-bold">{tag ? "Edit Tag" : "New Tag"}</SheetTitle>
          <SheetDescription className="text-xs">
            Configure tag properties and localization.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="tag-form"
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-5 custom-scrollbar"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">{t("Group")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder={t("GroupPlaceholder")}
                          list="tag-groups"
                          className="h-9 text-xs"
                        />
                        <datalist id="tag-groups">
                          {groups.map((g) => (
                            <option key={g} value={g} />
                          ))}
                        </datalist>
                      </div>
                    </FormControl>
                    <FormDescription className="text-[10px] leading-tight mt-1">
                      {t("GroupHint")}
                    </FormDescription>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">{t("Key")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("KeyPlaceholder")} className="h-9 text-xs" />
                    </FormControl>
                    <FormDescription className="text-[10px] leading-tight mt-1">
                      {t("KeyHint")}
                    </FormDescription>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="p-3 bg-muted/30 rounded-lg border border-dashed text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground uppercase text-[9px] tracking-wider">
                  {t("Preview")}
                </span>
                <div className="font-mono text-[9px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border opacity-60">
                  {groupValue || "group"}:{keyValue || "key"}
                </div>
              </div>

              <div className="flex items-center justify-center py-4 bg-background/50 rounded-md border border-dashed shadow-inner">
                <TagBadge
                  tag={{
                    id: 0,
                    group: groupValue || "group",
                    key: keyValue || "preview",
                    slug: "preview",
                    icon: iconValue,
                    color: colorValue,
                    isActive: true,
                    scope: "catalog",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  }}
                  showGroup={false}
                  className="scale-110 transition-all duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-5">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">{t("Icon")}</FormLabel>
                    <FormControl>
                      <IconPicker
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder={t("IconHint")}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">{t("Color")}</FormLabel>
                    <div className="flex gap-1.5">
                      <FormControl className="flex-1">
                        <Input
                          {...field}
                          value={field.value || ""}
                          type="text"
                          placeholder="#000000"
                          className="h-9 text-[11px] font-mono"
                        />
                      </FormControl>
                      <Input
                        type="color"
                        value={field.value || "#000000"}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-10 p-1 h-9 cursor-pointer rounded-md border border-input bg-card shadow-sm"
                      />
                    </div>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-5 items-center pb-6">
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">{t("Scope")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs bg-card">
                          <SelectValue placeholder="Select scope" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="catalog" className="text-xs">
                          Catalog
                        </SelectItem>
                        <SelectItem value="school" className="text-xs">
                          School
                        </SelectItem>
                        <SelectItem value="campaign" className="text-xs">
                          Campaign
                        </SelectItem>
                        <SelectItem value="system" className="text-xs">
                          System
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 shadow-sm h-[44px] bg-card">
                    <FormLabel className="text-xs font-semibold cursor-pointer">
                      {t("IsActive")}
                    </FormLabel>
                    <FormControl>
                      <Switch
                        className="scale-75"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <SheetFooter className="px-6 py-4 border-t bg-card/80 backdrop-blur-md sticky bottom-0 z-50 mt-auto flex flex-row items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-9 px-4 hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            form="tag-form"
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="text-xs h-9 px-6 font-semibold shadow-md active:scale-95 transition-transform"
          >
            {isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {tag ? "Save Changes" : "Create Tag"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
