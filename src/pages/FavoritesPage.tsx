// Страница избранного

import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { FavoriteCard } from '../components/FavoriteCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useAuth } from '../lib/auth';
import * as api from '../lib/mockApi';
import type { Favorite, Generation } from '../types';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<(Favorite & { generation?: Generation })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await api.getFavorites();
      setFavorites(result);
    } catch {
      // Ошибка
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Избранное</h1>
        <p className="text-gray-500 mb-6">Войдите, чтобы сохранять описания в избранное</p>
        <Link to="/login">
          <Button>Войти</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500" />
          Избранное
        </h1>
        <span className="text-sm text-gray-500">Сохранений: {favorites.length}</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Пока нет сохранённых описаний</p>
          <p className="text-sm text-gray-400 mt-1">Нажмите «В избранное» на любом описании</p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => (
            <FavoriteCard key={fav.id} favorite={fav} onRemove={loadFavorites} />
          ))}
        </div>
      )}
    </div>
  );
}
