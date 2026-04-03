"use client";

import * as React from "react";
import { useFormContext, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BilingualInputProps {
  nameEn: string;
  nameAr: string;
  labelEn?: string;
  labelAr?: string;
  placeholderEn?: string;
  placeholderAr?: string;
  required?: boolean;
  className?: string;
}

/**
 * BilingualInput
 *
 * Renders two side-by-side inputs: one for English (LTR) and one for Arabic (RTL).
 * Reads/writes form state via react-hook-form's useFormContext.
 *
 * Designed for use inside ProductForm or any react-hook-form FormProvider context.
 */
export function BilingualInput({
  nameEn,
  nameAr,
  labelEn = "English",
  labelAr = "Arabic",
  placeholderEn,
  placeholderAr,
  required,
  className,
}: BilingualInputProps) {
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
      {/* English */}
      <div className="space-y-1">
        <Label htmlFor={nameEn} className="text-xs font-medium text-muted-foreground">
          {labelEn}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        <Input
          id={nameEn}
          {...register(nameEn)}
          dir="ltr"
          placeholder={placeholderEn}
          className={cn(
            "h-8 text-sm",
            !!(errorEn as { message?: string })?.message && "border-destructive",
          )}
        />
        {!!(errorEn as { message?: string })?.message && (
          <p className="text-xs text-destructive">{(errorEn as { message?: string }).message}</p>
        )}
      </div>

      {/* Arabic */}
      <div className="space-y-1">
        <Label htmlFor={nameAr} className="text-xs font-medium text-muted-foreground">
          {labelAr}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        <Input
          id={nameAr}
          {...register(nameAr)}
          dir="rtl"
          placeholder={placeholderAr}
          className={cn(
            "h-8 text-sm font-arabic",
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
