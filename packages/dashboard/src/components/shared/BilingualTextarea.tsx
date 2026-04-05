"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Textarea } from "@findeg/ui";
import { Label } from "@findeg/ui";
import { cn } from "@/lib/utils";

interface BilingualTextareaProps {
  nameEn: string;
  nameAr: string;
  labelEn?: string;
  labelAr?: string;
  placeholderEn?: string;
  placeholderAr?: string;
  rows?: number;
  required?: boolean;
  className?: string;
}

/**
 *
 */
export function BilingualTextarea({
  nameEn,
  nameAr,
  labelEn = "English",
  labelAr = "Arabic",
  placeholderEn,
  placeholderAr,
  rows = 3,
  required,
  className,
}: BilingualTextareaProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorEn = nameEn
    .split(".")
    .reduce(
      (o: Record<string, unknown>, k) => (o?.[k] as Record<string, unknown>) ?? {},
      errors as Record<string, unknown>,
    );
  const errorAr = nameAr
    .split(".")
    .reduce(
      (o: Record<string, unknown>, k) => (o?.[k] as Record<string, unknown>) ?? {},
      errors as Record<string, unknown>,
    );

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <div className="space-y-1">
        <Label htmlFor={nameEn} className="text-xs font-medium text-muted-foreground">
          {labelEn}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        <Textarea
          id={nameEn}
          {...register(nameEn)}
          dir="ltr"
          placeholder={placeholderEn}
          rows={rows}
          className={cn(
            "text-sm resize-none",
            !!(errorEn as { message?: string })?.message && "border-destructive",
          )}
        />
        {!!(errorEn as { message?: string })?.message && (
          <p className="text-xs text-destructive">{(errorEn as { message?: string }).message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor={nameAr} className="text-xs font-medium text-muted-foreground">
          {labelAr}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        <Textarea
          id={nameAr}
          {...register(nameAr)}
          dir="rtl"
          placeholder={placeholderAr}
          rows={rows}
          className={cn(
            "text-sm font-arabic resize-none",
            !!(errorAr as { message?: string })?.message && "border-destructive",
          )}
        />
        {!!(errorAr as { message?: string })?.message && (
          <p className="text-xs text-destructive">{(errorAr as { message?: string }).message}</p>
        )}
      </div>
    </div>
  );
}
