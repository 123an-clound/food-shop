'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { z } from 'zod';

import { restaurantInfoSchema, type RestaurantInfoFormValues } from '@/lib/validation/restaurant-info';
import { updateRestaurantInfo } from '@/app/actions/restaurant-info';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ImageUploader, extractStoragePath } from '@/components/admin/ImageUploader';
import type { RestaurantInfo } from '@/lib/types';

const TEXT_FIELDS: Array<{ name: keyof RestaurantInfoFormValues; label: string; multiline?: boolean }> = [
  { name: 'name_vi', label: 'Tên (Tiếng Việt)' },
  { name: 'name_en', label: 'Tên (Tiếng Anh)' },
  { name: 'tagline_vi', label: 'Khẩu hiệu (Tiếng Việt)' },
  { name: 'tagline_en', label: 'Khẩu hiệu (Tiếng Anh)' },
  { name: 'description_vi', label: 'Mô tả (Tiếng Việt)', multiline: true },
  { name: 'description_en', label: 'Mô tả (Tiếng Anh)', multiline: true },
  { name: 'address', label: 'Địa chỉ' },
  { name: 'phone', label: 'Điện thoại' },
  { name: 'email', label: 'Email' },
  { name: 'opening_hours', label: 'Giờ mở cửa' },
  { name: 'map_embed_url', label: 'URL nhúng Google Maps' },
  { name: 'facebook_url', label: 'Facebook' },
  { name: 'instagram_url', label: 'Instagram' },
];

export function RestaurantInfoForm({ info }: { info: RestaurantInfo }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const originalLogoUrl = info.logo_url;
  const originalHeroImageUrl = info.hero_image_url;

  const form = useForm<z.input<typeof restaurantInfoSchema>, unknown, RestaurantInfoFormValues>({
    resolver: zodResolver(restaurantInfoSchema),
    defaultValues: {
      name_vi: info.name_vi,
      name_en: info.name_en,
      tagline_vi: info.tagline_vi,
      tagline_en: info.tagline_en,
      description_vi: info.description_vi,
      description_en: info.description_en,
      address: info.address,
      phone: info.phone,
      email: info.email,
      opening_hours: info.opening_hours,
      map_embed_url: info.map_embed_url,
      facebook_url: info.facebook_url,
      instagram_url: info.instagram_url,
      logo_url: info.logo_url,
      hero_image_url: info.hero_image_url,
    },
  });

  async function onSubmit(values: RestaurantInfoFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value));

    const result = await updateRestaurantInfo(formData);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    // Only after the Server Action has successfully persisted the new URLs
    // do we delete the old files from Storage — deleting them earlier (e.g.
    // at upload time) would permanently lose them if the save above had
    // failed or the form was abandoned before submit.
    const supabase = createBrowserSupabaseClient();
    const replacedImages: Array<[string, string, string]> = [
      [originalLogoUrl, values.logo_url, 'site-media'],
      [originalHeroImageUrl, values.hero_image_url, 'site-media'],
    ];
    for (const [oldUrl, newUrl, bucket] of replacedImages) {
      if (oldUrl && oldUrl !== newUrl) {
        const oldPath = extractStoragePath(oldUrl, bucket);
        if (oldPath) {
          await supabase.storage.from(bucket).remove([oldPath]);
        }
      }
    }

    toast.success('Đã cập nhật thông tin nhà hàng.');
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-4">
        {TEXT_FIELDS.map(({ name, label, multiline }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>{multiline ? <Textarea {...field} /> : <Input {...field} />}</FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUploader
                  bucket="site-media"
                  label="Logo"
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
          name="hero_image_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUploader
                  bucket="site-media"
                  label="Ảnh hero trang chủ"
                  existingUrl={field.value || undefined}
                  onUploaded={field.onChange}
                />
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
