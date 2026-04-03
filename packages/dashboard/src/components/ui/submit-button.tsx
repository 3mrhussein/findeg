"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  loadingText?: string;
  defaultText?: string;
}

/**
 *
 */
export function SubmitButton({
  loadingText,
  defaultText = "Save",
  children,
  className,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const t = useTranslations("Pages.Dashboard");

  return (
    <Button type="submit" disabled={pending || props.disabled} className={className} {...props}>
      {" "}
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? loadingText || t("Save") || "Saving..." : children || defaultText}
    </Button>
  );
}
