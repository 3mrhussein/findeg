"use client";

import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Check,
  Loader2,
  Globe,
  Tag as TagIcon,
  AlertCircle,
  Palette,
  Hash,
  Zap,
  LucideIcon,
} from "lucide-react";
import { Button } from "@ui";
import { Input } from "@ui";
import { Label } from "@ui";
import { RadioGroup, RadioGroupItem } from "@ui";
import { Badge } from "@ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui";
import { TagInput, TagInputSchema } from "@backend/features/administration/domain/types";
import { slugify } from "@lib/slugify";
import { Tag } from "@backend/features/catalog";
import { cn } from "@lib/utils";
import { useDebounce } from "@hooks/use-debounce";
import { useToast } from "@hooks/use-toast";
import { getTagDisplayName } from "@features/catalog/presentation/config/tag-display";
import * as Icons from "lucide-react";

interface TagFormPanelProps {
  tag: Tag | null;
  productCount?: number;
  onSubmit: (data: TagInput) => Promise<any>;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#64748B",
];

const PRESET_ICONS = [
  "Star",
  "Zap",
  "Heart",
  "Clock",
  "Shield",
  "Crown",
  "Flame",
  "Award",
  "BadgeCheck",
  "Package",
  "Gift",
  "Tag",
];

export function TagFormPanel({ tag, productCount = 0, onSubmit, onClose }: TagFormPanelProps) {
  const t = useTranslations("Administration.Catalog.Tags");
  const locale = useLocale() as "en" | "ar";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<TagInput>({
    resolver: zodResolver(TagInputSchema) as Resolver<TagInput>,
    defaultValues: tag
      ? {
          group: tag.group,
          key: tag.key,
          slug: tag.slug,
          icon: tag.icon || "Tag",
          color: tag.color || "#6366F1",
          isActive: tag.isActive,
          scope: tag.scope,
        }
      : {
          group: "campaign",
          key: "",
          slug: "",
          icon: "Tag",
          color: "#6366F1",
          isActive: true,
          scope: "catalog",
        },
  });

  useEffect(() => {
    if (tag) {
      reset({
        group: tag.group,
        key: tag.key,
        slug: tag.slug,
        icon: tag.icon || "Tag",
        color: tag.color || "#6366F1",
        isActive: tag.isActive,
        scope: tag.scope,
      });
    } else {
      reset({
        group: "campaign",
        key: "",
        slug: "",
        icon: "Tag",
        color: "#6366F1",
        isActive: true,
        scope: "catalog",
      });
    }
  }, [tag, reset]);

  const key = watch("key");
  const slug = watch("slug");
  const color = watch("color");
  const icon = watch("icon") as string;
  const debouncedValue = useDebounce(slug, 500);

  // Auto-generate slug from key
  useEffect(() => {
    if (!tag && key && !slug) {
      const generated = slugify(key);
      setValue("slug", generated, { shouldValidate: true });
    }
  }, [key, tag, setValue, slug]);

  // Check slug availability
  useEffect(() => {
    async function checkSlug() {
      if (!debouncedValue || debouncedValue.length < 2) {
        setIsSlugAvailable(null);
        return;
      }

      if (tag && debouncedValue === tag.slug) {
        setIsSlugAvailable(true);
        return;
      }

      setIsSlugChecking(true);
      try {
        const res = await fetch(
          `/api/v1/admin/tags/check-slug?slug=${debouncedValue}${tag ? `&excludeId=${tag.id}` : ""}`,
        );
        const data = await res.json();
        setIsSlugAvailable(data.available);
      } catch (error) {
        console.error("Slug check failed", error);
      } finally {
        setIsSlugChecking(false);
      }
    }
    checkSlug();
  }, [debouncedValue, tag]);

  const onFormSubmit = async (data: TagInput) => {
    if (isSlugAvailable === false) {
      toast({
        title: t("SlugTaken"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit(data);
      if (result.success) {
        toast({
          title: tag ? t("ToastUpdated") : t("ToastCreated"),
        });
      } else {
        toast({
          title: result.error || "Error",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[icon] || Icons.Tag;

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="flex flex-col h-full bg-white dark:bg-slate-900"
    >
      {/* Sticky Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {tag ? t("PanelEditTitle") : t("PanelCreateTitle")}
          </h2>
          {tag && (
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-[10px] bg-indigo-50 text-indigo-600 border-none dark:bg-indigo-500/10 dark:text-indigo-400"
              >
                <TagIcon className="h-3 w-3 me-1" />
                {productCount} {t("ProductsCount", { count: productCount })}
              </Badge>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-thin">
        {/* Basic Info Map Preview */}
        {!tag && key && (
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${color}20`, color }}
              >
                <IconComponent className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                  {t("Preview")}
                </p>
                <p className="text-sm font-bold">{getTagDisplayName(key, locale)}</p>
              </div>
            </div>
            <p className="text-[10px] text-indigo-400 italic leading-none">
              {t("GroupKeyPreview")}: {watch("group")}:{key}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Group Dropdown */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {t("FieldGroup")}
            </Label>
            <Select
              onValueChange={(val) => setValue("group", val, { shouldDirty: true })}
              defaultValue={watch("group")}
            >
              <SelectTrigger className="rounded-xl h-11 border-gray-200 dark:border-slate-800">
                <SelectValue placeholder={t("FieldGroup")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="campaign">{t("GroupCampaign")}</SelectItem>
                <SelectItem value="audience">{t("GroupAudience")}</SelectItem>
                <SelectItem value="quality">{t("GroupQuality")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.group && (
              <p className="text-[10px] text-rose-500 font-medium">{errors.group.message}</p>
            )}
          </div>

          {/* Key Input */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {t("FieldKey")}
            </Label>
            <Input
              {...register("key")}
              placeholder="e.g. best-seller"
              className="rounded-xl border-gray-200 dark:border-slate-800 h-11 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-muted-foreground italic">{t("FieldKeyHint")}</p>
            {errors.key && (
              <p className="text-[10px] text-rose-500 font-medium">{errors.key.message}</p>
            )}
          </div>
        </div>

        {/* Slug Section */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Globe className="h-3 w-3" />
            {t("FieldSlug")}
          </Label>
          <div className="relative">
            <Input
              {...register("slug")}
              placeholder="tag-slug"
              className="rounded-xl border-gray-200 dark:border-slate-800 h-10 pr-24 font-mono text-sm tracking-tight"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {isSlugChecking ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
              ) : isSlugAvailable === true ? (
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 font-normal px-1.5 h-5 text-[10px]">
                  {t("SlugAvailable")}
                </Badge>
              ) : isSlugAvailable === false ? (
                <Badge className="bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 font-normal px-1.5 h-5 text-[10px]">
                  {t("SlugTaken")}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        {/* Visuals: Icon & Color */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <TagIcon className="h-3 w-3" />
              {t("FieldIcon")}
            </Label>
            <Select
              onValueChange={(val) => setValue("icon", val, { shouldDirty: true })}
              defaultValue={watch("icon")}
            >
              <SelectTrigger className="rounded-xl h-11 border-gray-200 dark:border-slate-800">
                <SelectValue placeholder={t("FieldIcon")} />
              </SelectTrigger>
              <SelectContent>
                {PRESET_ICONS.map((i) => {
                  const Comp = (Icons as unknown as Record<string, LucideIcon>)[i] || TagIcon;
                  return (
                    <SelectItem key={i} value={i}>
                      <div className="flex items-center gap-2">
                        <Comp className="w-4 h-4" />
                        <span>{i}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Palette className="h-3 w-3" />
              {t("FieldColor")}
            </Label>
            <div className="flex gap-2 items-center">
              <div
                className="w-10 h-10 rounded-xl border border-gray-200 dark:border-slate-800 shrink-0"
                style={{ backgroundColor: color }}
              />
              <Input
                {...register("color")}
                placeholder="#000000"
                className="rounded-xl border-gray-200 dark:border-slate-800 h-10 font-mono text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue("color", c, { shouldDirty: true })}
                  className={cn(
                    "w-6 h-6 rounded-lg transition-transform active:scale-90",
                    color === c && "ring-2 ring-indigo-500 ring-offset-2",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Scope Section */}
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {t("FieldScope")}
          </Label>
          <RadioGroup
            defaultValue={watch("scope")}
            onValueChange={(val) => setValue("scope", val as any, { shouldDirty: true })}
            className="grid grid-cols-2 gap-3"
          >
            <Label
              htmlFor="scope-catalog"
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer h-24 text-center",
                watch("scope") === "catalog"
                  ? "bg-indigo-50/50 border-indigo-500 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "bg-white border-gray-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800",
              )}
            >
              <RadioGroupItem value="catalog" id="scope-catalog" className="sr-only" />
              <Hash className="h-4 w-4 mb-2" />
              <span className="text-sm font-semibold">{t("ScopeCatalog")}</span>
              <span className="text-[10px] mt-1 opacity-70 leading-tight">
                {t("ScopeCatalogDesc")}
              </span>
            </Label>
            <Label
              htmlFor="scope-campaign"
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer h-24 text-center",
                watch("scope") === "campaign"
                  ? "bg-amber-50/50 border-amber-500 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  : "bg-white border-gray-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800",
              )}
            >
              <RadioGroupItem value="campaign" id="scope-campaign" className="sr-only" />
              <Zap className="h-4 w-4 mb-2" />
              <span className="text-sm font-semibold">{t("ScopeCampaign")}</span>
              <span className="text-[10px] mt-1 opacity-70 leading-tight">
                {t("ScopeCampaignDesc")}
              </span>
            </Label>
          </RadioGroup>
        </div>

        {/* Status Section */}
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {t("FieldStatus")}
          </Label>
          <RadioGroup
            defaultValue={watch("isActive") ? "active" : "inactive"}
            onValueChange={(val) => setValue("isActive", val === "active", { shouldDirty: true })}
            className="grid grid-cols-2 gap-3"
          >
            <Label
              htmlFor="status-active"
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer",
                watch("isActive")
                  ? "bg-emerald-50/50 border-emerald-500 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-white border-gray-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800",
              )}
            >
              <RadioGroupItem value="active" id="status-active" className="sr-only" />
              <Check
                className={cn("h-4 w-4 mb-2", watch("isActive") ? "opacity-100" : "opacity-0")}
              />
              <span className="text-sm font-semibold">
                {t("FieldStatus")} ({t("Active")})
              </span>
            </Label>
            <Label
              htmlFor="status-inactive"
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer",
                !watch("isActive")
                  ? "bg-slate-50 border-slate-400 text-slate-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
                  : "bg-white border-gray-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800",
              )}
            >
              <RadioGroupItem value="inactive" id="status-inactive" className="sr-only" />
              <X className={cn("h-4 w-4 mb-2", !watch("isActive") ? "opacity-100" : "opacity-0")} />
              <span className="text-sm font-semibold">
                {t("FieldStatus")} ({t("Inactive")})
              </span>
            </Label>
          </RadioGroup>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 sticky bottom-0 z-10">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 h-12 rounded-xl border-gray-200 dark:border-slate-800"
        >
          {t("Cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isSlugChecking || !isDirty}
          className="flex-2 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t("Save")}
        </Button>
      </div>
    </form>
  );
}
