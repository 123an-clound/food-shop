'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { z } from 'zod';

import { categorySchema, type CategoryFormValues } from '@/lib/validation/category';
import { createCategory, updateCategory } from '@/app/actions/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import type { Category } from '@/lib/types';

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.input<typeof categorySchema>, unknown, CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name_vi: category?.name_vi ?? '',
      name_en: category?.name_en ?? '',
      description_vi: category?.description_vi ?? '',
      description_en: category?.description_en ?? '',
    },
  });

  async function onSubmit(values: CategoryFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.set('name_vi', values.name_vi);
    formData.set('name_en', values.name_en);
    formData.set('description_vi', values.description_vi);
    formData.set('description_en', values.description_en);

    const result = category
      ? await updateCategory(category.id, formData)
      : await createCategory(formData);

    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(category ? 'Đã cập nhật danh mục.' : 'Đã thêm danh mục.');
    router.push('/admin/categories');
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-4">
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu…' : 'Lưu'}
        </Button>
      </form>
    </Form>
  );
}
