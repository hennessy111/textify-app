// Страница истории генераций

import React, { useState, useEffect, useCallback } from 'react';
import { History as HistoryIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { HistoryList } from '../components/HistoryList';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import * as api from '../lib/mockApi';
import type { Generation, Platform } from '../types';

export function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState<Platform | ''>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.getHistory(page, platform || undefined);
      setGenerations(result.data);
      setTotal(result.total);
    } catch {
      // Ошибка загрузки
    } finally {
      setIsLoading(false);
    }
  }, [page, platform]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HistoryIcon className="w-6 h-6 text-indigo-600" />
          История генераций
        </h1>
        <span className="text-sm text-gray-500">Всего: {total}</span>
      </div>

      {/* Фильтр по платформе */}
      <div className="mb-6">
        <select
          value={platform}
          onChange={(e) => { setPlatform(e.target.value as Platform | ''); setPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Фильтр по платформе"
        >
          <option value="">Все площадки</option>
          <option value="wildberries">Wildberries</option>
          <option value="ozon">Ozon</option>
          <option value="etsy">Etsy</option>
        </select>
      </div>

      {/* Список */}
      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <HistoryList generations={generations} onDelete={loadHistory} />
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Предыдущая страница"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600 px-3">
            {page} из {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Следующая страница"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
