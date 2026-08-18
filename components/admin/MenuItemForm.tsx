'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { z } from 'zod';

import { menuItemSchema, type MenuItemFormValues } from '@/lib/validation/menu-item';
import { createMenuItem, updateMenuItem } from '@/app/actions/menu-items';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ImageUploader, extractStoragePath } from '@/components/admin/ImageUploader';
import type { Category, MenuItem } from '@/lib/types';

export function MenuItemForm({ item, categories }: { item?: MenuItem; categories: Category[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const originalImageUrl = item?.image_url ?? '';

  const form = useForm<z.input<typeof menuItemSchema>, unknown, MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      category_id: item?.category_id ?? '',
      name_vi: item?.name_vi ?? '',
      name_en: item?.name_en ?? '',
      description_vi: item?.description_vi ?? '',
      description_en: item?.description_en ?? '',
      price: item?.price ?? 0,
      image_url: item?.image_url ?? '',
      is_available: item?.is_available ?? true,
      is_featured: item?.is_featured ?? false,
    },
  });

  async function onSubmit(values: MenuItemFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.set('category_id', values.category_id);
    formData.set('name_vi', values.name_vi);
    formData.set('name_en', values.name_en);
    formData.set('description_vi', values.description_vi);
    formData.set('description_en', values.description_en);
    formData.set('price', String(values.price));
    formData.set('image_url', values.image_url);
    formData.set('is_available', String(values.is_available));
    formData.set('is_featured', String(values.is_featured));

    const result = item ? await updateMenuItem(item.id, formData) : await createMenuItem(formData);

    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    // Only after the Server Action has successfully persisted the new
    // image_url do we delete the old file from Storage — deleting it earlier
    // (e.g. at upload time) would permanently lose it if the save above had
    // failed or the form was abandoned before submit.
    if (originalImageUrl && originalImageUrl !== values.image_url) {
      const oldPath = extractStoragePath(originalImageUrl, 'dish-images');
      if (oldPath) {
        const supabase = createBrowserSupabaseClient();
        await supabase.storage.from('dish-images').remove([oldPath]);
      }
    }

    toast.success(item ? 'Đã cập nhật món ăn.' : 'Đã thêm món ăn.');
    router.push('/admin/menu-items');
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-4">
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Danh mục</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name_vi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name_vi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên (Tiếng Việt)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên (Tiếng Anh)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description_vi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả (Tiếng Việt)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả (Tiếng Anh)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giá (VNĐ)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUploader
                  bucket="dish-images"
                  label="Ảnh món ăn"
                  existingUrl={field.value || undefined}
                  onUploaded={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_available"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border p-3">
              <FormLabel>Còn hàng</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_featured"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border p-3">
              <FormLabel>Món nổi bật</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu…' : 'Lưu'}
        </Button>
      </form>
    </Form>
  );
}
