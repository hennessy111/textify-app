// Компонент списка истории

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatDate, getPlatformLabel, getPlatformColor } from '../lib/utils';
import { copyToClipboard } from '../lib/utils';
import type { Generation } from '../types';
import * as api from '../lib/supabaseApi';
import toast from 'react-hot-toast';

interface HistoryListProps {
  generations: Generation[];
  onDelete: () => void;
}

export function HistoryList({ generations, onDelete }: HistoryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteGeneration(id);
      toast.success('Удалено');
      onDelete();
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast.success('Скопировано!');
  };

  if (generations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">История пуста</p>
        <p className="text-sm text-gray-400 mt-1">Сгенерируйте первое описание</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {generations.map((gen) => (
        <Card key={gen.id} hover>
          <div className="p-4">
            {/* Заголовок карточки */}
            <button
              onClick={() => setExpandedId(expandedId === gen.id ? null : gen.id)}
              className="w-full flex items-center justify-between text-left"
              aria-expanded={expandedId === gen.id}
              aria-label={`Открыть ${gen.product_name}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 truncate">{gen.product_name}</h3>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(gen.platform)}`}>
                    {getPlatformLabel(gen.platform)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {formatDate(gen.created_at)} • {gen.keywords.join(', ')}
                </p>
              </div>
              {expandedId === gen.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </button>

            {/* Раскрывающийся контент */}
            {expandedId === gen.id && (
              <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
                {gen.descriptions.map((desc, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                      {desc.text}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleCopy(desc.text)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Копировать
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(gen.id)}
                    aria-label="Удалить генерацию"
                  >
                    <Trash2 className="w-4 h-4 mr-1 text-red-500" />
                    <span className="text-red-500">Удалить</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
