"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminProductInput } from "@/domain/types/admin";
import { createProductAction, updateProductAction } from "@/application/actions/admin/products";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema validation
const formSchema = z.object({
  name_en: z.string().min(2, "Name (EN) must be at least 2 characters"),
  description_en: z.string().min(10, "Description (EN) must be at least 10 characters"),
  name_ar: z.string().min(2, "Name (AR) must be at least 2 characters"),
  description_ar: z.string().min(10, "Description (AR) must be at least 10 characters"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "Please select a category"),
  images: z.string().optional(), // Comma separated URLs for simplicity in MVP
});

interface ProductToEdit extends AdminProductInput {
  id: number;
}

interface ProductFormProps {
  initialData?: ProductToEdit;
  categories: { id: number; slug: string; name: string }[];
}

/**
 *
 */
export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Map initial data to form values if editing
  const defaultValues = initialData
    ? {
        name_en: initialData.translations.find((t) => t.language === "en")?.name || "",
        description_en:
          initialData.translations.find((t) => t.language === "en")?.description || "",
        name_ar: initialData.translations.find((t) => t.language === "ar")?.name || "",
        description_ar:
          initialData.translations.find((t) => t.language === "ar")?.description || "",
        price: initialData.price,
        category: initialData.category,
        images: initialData.images?.join(", ") || "",
      }
    : {
        name_en: "",
        description_en: "",
        name_ar: "",
        description_ar: "",
        price: 0,
        category: "",
        images: "",
      };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  });

  /**
   *
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    // Transform form values to AdminProductInput
    const input: AdminProductInput = {
      price: values.price,
      category: values.category,
      images: values.images
        ? values.images
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      translations: [
        {
          language: "en",
          name: values.name_en,
          description: values.description_en,
          longDescription: values.description_en,
        },
        {
          language: "ar",
          name: values.name_ar,
          description: values.description_ar,
          longDescription: values.description_ar,
        },
      ],
      isNew: true, // Default for new products
    };

    try {
      let result;
      if (initialData) {
        result = await updateProductAction(initialData.id, input);
      } else {
        result = await createProductAction(input);
      }

      if (result.success) {
        toast({
          title: initialData ? "Product updated" : "Product created",
          description: "The product has been successfully saved.",
        });
        router.push("/admin/products");
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
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* English Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="Product Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (Arabic)</FormLabel>
                <FormControl>
                  <Input placeholder="اسم المنتج" {...field} className="text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="description_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (English)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Product description..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Arabic)</FormLabel>
                <FormControl>
                  <Textarea placeholder="وصف المنتج..." {...field} className="text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images (Comma separated URLs)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                For MVP/Demo purposes, enter image URLs separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
