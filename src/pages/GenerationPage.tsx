// Публичная страница генерации (для шаринга)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { DescriptionCard } from '../components/DescriptionCard';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { getPlatformLabel, getPlatformColor, formatDate } from '../lib/utils';
import * as api from '../lib/supabaseApi';
import type { Generation } from '../types';

export function GenerationPage() {
  const { id } = useParams<{ id: string }>();
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const gen = await api.getGenerationById(id);
        if (gen) {
          setGeneration(gen);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Spinner size="lg" className="py-20" />
      </div>
    );
  }

  if (notFound || !generation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="py-20">
          <p className="text-xl text-gray-600 mb-4">Генерация не найдена</p>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Навигация */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        На главную
      </Link>

      {/* Информация о генерации */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-900">{generation.product_name}</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(generation.platform)}`}>
            {getPlatformLabel(generation.platform)}
          </span>
          <span>{formatDate(generation.created_at)}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {generation.keywords.map((kw) => (
            <span key={kw} className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
              {kw}
            </span>
          ))}
        </div>
      </Card>

      {/* Описания */}
      <div className="space-y-4">
        {generation.descriptions.map((desc, idx) => (
          <DescriptionCard
            key={idx}
            text={desc.text}
            index={idx}
            generationId={generation.id}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 mb-3">Хотите создать свои описания?</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Сгенерировать
        </Link>
      </div>
    </div>
  );
}
