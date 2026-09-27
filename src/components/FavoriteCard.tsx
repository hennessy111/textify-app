// Компонент карточки избранного

import React from 'react';
import { Trash2, ExternalLink } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatDate, getPlatformLabel, getPlatformColor, copyToClipboard } from '../lib/utils';
import type { Favorite, Generation } from '../types';
import * as api from '../lib/supabaseApi';
import toast from 'react-hot-toast';

interface FavoriteCardProps {
  favorite: Favorite & { generation?: Generation };
  onRemove: () => void;
}

export function FavoriteCard({ favorite, onRemove }: FavoriteCardProps) {
  const gen = favorite.generation;

  const handleRemove = async () => {
    try {
      await api.removeFavorite(favorite.id);
      toast.success('Удалено из избранного');
      onRemove();
    } catch {
      toast.error('Ошибка');
    }
  };

  const handleCopy = async () => {
    if (!gen) return;
    const text = gen.descriptions[favorite.description_index]?.text;
    if (text) {
      await copyToClipboard(text);
      toast.success('Скопировано!');
    }
  };

  if (!gen) {
    return (
      <Card>
        <div className="p-4 text-gray-400 text-sm">Описание удалено</div>
      </Card>
    );
  }

  return (
    <Card hover>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900">{gen.product_name}</h3>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(gen.platform)}`}>
                {getPlatformLabel(gen.platform)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {formatDate(favorite.created_at)} • Вариант {favorite.description_index + 1}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
            {gen.descriptions[favorite.description_index]?.text}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <ExternalLink className="w-4 h-4 mr-1" />
            Копировать
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRemove}>
            <Trash2 className="w-4 h-4 mr-1 text-red-500" />
            <span className="text-red-500">Удалить</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
