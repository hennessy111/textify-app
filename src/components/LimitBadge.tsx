// Компонент бейджа лимита

import { Crown, Zap, AlertCircle, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface LimitBadgeProps {
  remaining: number;
  isPremium: boolean;
}

export function LimitBadge({ remaining, isPremium }: LimitBadgeProps) {
  const { user, profile } = useAuth();

  if (isPremium) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
        <Crown className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-700">Безлимитные генерации</span>
      </div>
    );
  }

  if (remaining === 0) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium text-red-700">Лимит исчерпан!</span>
        </div>
        <Link
          to="/pricing"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          <Zap className="w-3.5 h-3.5" />
          Купить генерации
        </Link>
      </div>
    );
  }

  // Разные сообщения для гостей и авторизованных
  if (!user) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl">
        <Zap className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-700">
          Осталось <span className="font-bold">{remaining}</span> из 3 генераций
        </span>
      </div>
    );
  }

  // Для авторизованных показываем баланс отдельно
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
        <Zap className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-medium text-indigo-700">
          Осталось <span className="font-bold">{remaining}</span> генераций
        </span>
      </div>
      {profile.balance > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-xl">
          <Coins className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">
            Баланс: <span className="font-bold">{profile.balance}</span> генераций
          </span>
        </div>
      )}
    </div>
  );
}
