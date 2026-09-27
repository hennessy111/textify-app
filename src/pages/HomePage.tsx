// Главная страница — форма генерации + результаты

import React, { useState } from 'react';
import { Sparkles, TrendingUp, Zap, Shield } from 'lucide-react';
import { GenerationForm } from '../components/GenerationForm';
import { DescriptionCard } from '../components/DescriptionCard';
import { Card } from '../components/ui/Card';
import { useAuth } from '../lib/auth';
import * as api from '../lib/mockApi';
import type { Platform, Description } from '../types';
import toast from 'react-hot-toast';

interface GenerationResult {
  id: string;
  descriptions: Description[];
}

export function HomePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const { refresh } = useAuth();

  const handleGenerate = async (data: { productName: string; keywords: string[]; platform: Platform }) => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await api.generate(data.productName, data.keywords, data.platform);
      
      if (response.success && response.data) {
        setResult(response.data);
        toast.success('Описания сгенерированы!');
      } else {
        toast.error(response.error || 'Ошибка генерации');
      }
      
      await refresh();
    } catch {
      toast.error('Произошла ошибка');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero секция */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          SEO-Генератор для{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            маркетплейсов
          </span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Создавайте продающие описания товаров для Wildberries, Ozon и Etsy за секунды.
          С помощью ИИ — с ключевыми словами, эмодзи и хештегами.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Форма */}
        <div>
          <Card className="p-6">
            <GenerationForm onGenerate={handleGenerate} isGenerating={isGenerating} />
          </Card>
        </div>

        {/* Результаты */}
        <div>
          {isGenerating ? (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Результаты генерации
              </h2>
              {result.descriptions.map((desc, idx) => (
                <DescriptionCard
                  key={idx}
                  text={desc.text}
                  index={idx}
                  generationId={result.id}
                  onFavoriteChange={refresh}
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Заполните форму и нажмите «Сгенерировать»</p>
                <p className="text-sm mt-1">Результаты появятся здесь</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Преимущества */}
      <div className="mt-16 grid sm:grid-cols-3 gap-6">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Быстро</h3>
          <p className="text-sm text-gray-500">3 варианта описания за 5 секунд</p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">SEO-оптимизировано</h3>
          <p className="text-sm text-gray-500">Ключевые слова, хештеги, эмодзи</p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Для всех площадок</h3>
          <p className="text-sm text-gray-500">Wildberries, Ozon, Etsy</p>
        </div>
      </div>
    </div>
  );
}
