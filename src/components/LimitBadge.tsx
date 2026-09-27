// Компонент бейджа лимита

import { Crown, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LimitBadgeProps {
  remaining: number;
  isPremium: boolean;
}

export function LimitBadge({ remaining, isPremium }: LimitBadgeProps) {
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
        <span className="text-sm font-medium text-red-700">Лимит исчерпан!</span>
        <Link
          to="/pricing"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          <Zap className="w-3.5 h-3.5" />
          Купить безлимит за 990 ₽
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
      <Zap className="w-4 h-4 text-indigo-600" />
      <span className="text-sm font-medium text-indigo-700">
        Осталось <span className="font-bold">{remaining}</span> генераций сегодня
      </span>
    </div>
  );
}
