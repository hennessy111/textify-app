// Компонент карточки описания

import React, { useState } from 'react';
import { Copy, Check, Heart, Share2, HeartOff } from 'lucide-react';
import { Button } from './ui/Button';
import { copyToClipboard } from '../lib/utils';
import toast from 'react-hot-toast';
import * as api from '../lib/mockApi';
import { useAuth } from '../lib/auth';

interface DescriptionCardProps {
  text: string;
  index: number;
  generationId: string;
  onFavoriteChange?: () => void;
}

export function DescriptionCard({ text, index, generationId, onFavoriteChange }: DescriptionCardProps) {
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      toast.success('Скопировано в буфер обмена!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast.error('Войдите, чтобы добавлять в избранное');
      return;
    }

    try {
      if (isFavorite) {
        // Найти и удалить из избранного
        const favorites = await api.getFavorites();
        const fav = favorites.find(
          (f) => f.generation_id === generationId && f.description_index === index
        );
        if (fav) {
          await api.removeFavorite(fav.id);
          setIsFavorite(false);
          toast.success('Удалено из избранного');
        }
      } else {
        await api.addFavorite(generationId, index);
        setIsFavorite(true);
        toast.success('Добавлено в избранное!');
      }
      onFavoriteChange?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/g/${generationId}`;
    await copyToClipboard(shareUrl);
    toast.success('Ссылка скопирована!');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      {/* Номер варианта */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs font-bold">
          {index + 1}
        </span>
        <span className="text-xs text-gray-400">Вариант описания</span>
      </div>

      {/* Текст описания */}
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4 max-h-64 overflow-y-auto">
        {text}
      </div>

      {/* Кнопки действий */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <Button
          variant={copied ? 'secondary' : 'ghost'}
          size="sm"
          onClick={handleCopy}
          aria-label="Копировать"
        >
          {copied ? <Check className="w-4 h-4 mr-1 text-green-600" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? 'Скопировано' : 'Копировать'}
        </Button>

        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavorite}
            aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
          >
            {isFavorite ? (
              <HeartOff className="w-4 h-4 mr-1 text-red-500" />
            ) : (
              <Heart className="w-4 h-4 mr-1" />
            )}
            {isFavorite ? 'Убрать' : 'В избранное'}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          aria-label="Поделиться"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Поделиться
        </Button>
      </div>
    </div>
  );
}
