"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { createBrandAction, updateBrandAction } from "@/features/catalog/application/actions/brand";
import { Loader2 } from "lucide-react";
import type { Brand } from "@/features/catalog/domain/entities/Brand";
import { BrandInputSchema, type BrandInput } from "@/features/administration/domain/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type BrandFormValues = BrandInput;

interface BrandFormProps {
  brand?: Brand;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 *
 */
export function BrandForm({ brand, open, onOpenChange }: BrandFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(BrandInputSchema) as any,
    defaultValues: {
      name: brand?.name || "",
      slug: brand?.slug || "",
      logoUrl: brand?.logoUrl || "",
      isActive: brand?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: brand?.name || "",
      slug: brand?.slug || "",
      logoUrl: brand?.logoUrl || "",
      isActive: brand?.isActive ?? true,
    });
  }, [open, brand, form]);

  /**
   *
   */
  async function onSubmit(data: BrandFormValues) {
    setLoading(true);
    try {
      let result;
      if (brand) {
        result = await updateBrandAction(brand.id, data);
      } else {
        result = await createBrandAction(data);
      }

      if (result.success) {
        toast({
          title: `Brand ${brand ? "updated" : "created"}`,
          description: `Successfully ${brand ? "updated" : "created"} brand.`,
        });
        onOpenChange(false);
        form.reset();
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Something went wrong.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{brand ? "Edit Brand" : "Create Brand"}</DialogTitle>
          <DialogDescription>
            {brand ? "Update brand details below." : "Add a new brand to your store."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brand Name"
                      {...field}
                      data-testid="admin-brand-name"
                      onChange={(e) => {
                        field.onChange(e);
                        // Auto-generate slug if creating new
                        if (!brand && !form.getValues("slug")) {
                          form.setValue(
                            "slug",
                            e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "-")
                              .replace(/[^\w\-]+/g, ""),
                          );
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                    <Input placeholder="brand-slug" {...field} data-testid="admin-brand-slug" />
                </FormControl>
                  <FormDescription>URL-friendly identifier.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                <FormLabel>Logo URL</FormLabel>
                <FormControl>
                    <Input
                      placeholder="https://..."
                      {...field}
                      data-testid="admin-brand-logo-url"
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="admin-brand-active"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>Visible in store.</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading} data-testid="admin-brand-submit">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
