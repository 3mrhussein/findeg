"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { persistSessionToken } from "@/features/identity/presentation/utils/session-cookie";

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface RegisterResponseBody {
  success?: boolean;
  data?: {
    token?: string;
  };
  error?: {
    message?: string;
  };
}

/**
 * Splits a full name into first + last name parts.
 */
function splitName(name: string): { firstName?: string; lastName?: string } {
  const trimmed = name.trim();
  if (!trimmed) return {};

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0] };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

/**
 *
 */
export function RegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const t = useTranslations();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  /**
   *
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setServerError(null);

      const { firstName, lastName } = splitName(values.name);
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
          firstName,
          lastName,
        }),
      });

      const json = (await response.json().catch(() => null)) as RegisterResponseBody | null;
      if (!response.ok || !json?.success) {
        const message = json?.error?.message || t("Common.ErrorOccurred");
        setServerError(message);
        return;
      }

      if (json?.data?.token) {
        persistSessionToken(json.data.token);
      }
      router.push("/my-account");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" data-testid="registration-name-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="m@example.com" data-testid="registration-email-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" data-testid="registration-password-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" data-testid="registration-confirm-password-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {serverError ? (
          <p data-testid="registration-server-error" className="text-sm text-destructive" role="alert">
            {serverError}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <span data-testid="registration-submit-label">{t("Pages.Auth.ButtonRegister")}</span>
        </Button>
      </form>
    </Form>
  );
}
