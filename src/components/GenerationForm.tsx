// Компонент формы генерации

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { LimitBadge } from './LimitBadge';
import { useAuth } from '../lib/auth';
import type { Platform } from '../types';

const formSchema = z.object({
  product_name: z.string().min(3, 'Минимум 3 символа'),
  keywords: z.string().refine(
    (val) => {
      const parts = val.split(',').map((s) => s.trim()).filter(Boolean);
      return parts.length === 3;
    },
    { message: 'Введите ровно 3 ключевых слова через запятую' }
  ),
  platform: z.string().refine(
    (val) => ['wildberries', 'ozon', 'etsy'].includes(val),
    { message: 'Выберите площадку' }
  ),
});

type FormData = z.infer<typeof formSchema>;

interface GenerationFormProps {
  onGenerate: (data: { productName: string; keywords: string[]; platform: Platform }) => void;
  isGenerating: boolean;
}

export function GenerationForm({ onGenerate, isGenerating }: GenerationFormProps) {
  const { remaining, profile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_name: '',
      keywords: '',
      platform: 'wildberries',
    },
  });

  const onSubmit = (data: FormData) => {
    const keywords = data.keywords.split(',').map((k) => k.trim());
    onGenerate({
      productName: data.product_name,
      keywords,
      platform: data.platform as Platform,
    });
  };

  return (
    <div className="space-y-6">
      <LimitBadge remaining={remaining} isPremium={profile.is_premium} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Название товара */}
        <div>
          <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-1">
            Название товара
          </label>
          <input
            id="product_name"
            type="text"
            placeholder="Например: Кожаный чехол для iPhone 15"
            className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
              transition-all duration-200
              ${errors.product_name ? 'border-red-300' : 'border-gray-300'}`}
            aria-invalid={errors.product_name ? 'true' : 'false'}
            {...register('product_name')}
          />
          {errors.product_name && (
            <p className="mt-1 text-sm text-red-600">{errors.product_name.message}</p>
          )}
        </div>

        {/* Ключевые слова */}
        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
            Ключевые слова (3 штуки через запятую)
          </label>
          <input
            id="keywords"
            type="text"
            placeholder="чехол для айфона, кожаный чехол, защита телефона"
            className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
              transition-all duration-200
              ${errors.keywords ? 'border-red-300' : 'border-gray-300'}`}
            aria-invalid={errors.keywords ? 'true' : 'false'}
            aria-describedby="keywords-hint"
            {...register('keywords')}
          />
          {errors.keywords ? (
            <p className="mt-1 text-sm text-red-600">{errors.keywords.message}</p>
          ) : (
            <p id="keywords-hint" className="mt-1 text-sm text-gray-500">Введите ровно 3 ключевых слова</p>
          )}
        </div>

        {/* Маркетплейс */}
        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
            Маркетплейс
          </label>
          <select
            id="platform"
            className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 bg-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
              transition-all duration-200
              ${errors.platform ? 'border-red-300' : 'border-gray-300'}`}
            aria-label="Маркетплейс"
            {...register('platform')}
          >
            <option value="wildberries">🟣 Wildberries</option>
            <option value="ozon">🔵 Ozon</option>
            <option value="etsy">🟠 Etsy</option>
          </select>
          {errors.platform && (
            <p className="mt-1 text-sm text-red-600">{errors.platform.message}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          isLoading={isGenerating}
          disabled={remaining === 0}
          className="w-full"
          aria-label="Сгенерировать описания"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Сгенерировать
        </Button>
      </form>
    </div>
  );
}
