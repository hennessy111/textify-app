// Страница успешной оплаты

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Sparkles, Crown, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/auth';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const { refresh, profile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(true);

  const paymentType = searchParams.get('payment_type');

  useEffect(() => {
    // Обновляем данные пользователя после оплаты
    const updateProfile = async () => {
      try {
        await refresh();
      } catch (error) {
        console.error('Ошибка обновления профиля:', error);
      } finally {
        setIsUpdating(false);
      }
    };

    updateProfile();
  }, [refresh]);

  const getPaymentInfo = () => {
    switch (paymentType) {
      case 'premium_monthly':
        return {
          icon: <Crown className="w-16 h-16 text-indigo-600" />,
          title: 'Премиум активирован!',
          description: 'Ваша подписка на 1 месяц успешно активирована. Наслаждайтесь безлимитными генерациями!',
        };
      case 'premium_yearly':
        return {
          icon: <Crown className="w-16 h-16 text-indigo-600" />,
          title: 'Премиум активирован!',
          description: 'Ваша подписка на 1 год успешно активирована. Наслаждайтесь безлимитными генерациями!',
        };
      case 'pack_3':
        return {
          icon: <Zap className="w-16 h-16 text-purple-600" />,
          title: 'Пакет активирован!',
          description: '3 генерации добавлены на ваш баланс. Используйте их в любое время!',
        };
      case 'pack_5':
        return {
          icon: <Zap className="w-16 h-16 text-purple-600" />,
          title: 'Пакет активирован!',
          description: '5 генераций добавлены на ваш баланс. Используйте их в любое время!',
        };
      case 'pack_10':
        return {
          icon: <Zap className="w-16 h-16 text-purple-600" />,
          title: 'Пакет активирован!',
          description: '10 генераций добавлены на ваш баланс. Используйте их в любое время!',
        };
      default:
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-600" />,
          title: 'Оплата прошла успешно!',
          description: 'Спасибо за вашу покупку!',
        };
    }
  };

  const info = getPaymentInfo();

  if (isUpdating) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-6"></div>
        <p className="text-gray-600">Обновляем ваш профиль...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          {info.icon}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {info.title}
        </h1>

        <p className="text-gray-600 mb-8">
          {info.description}
        </p>

        {profile.is_premium && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-indigo-900">Премиум статус</span>
            </div>
            <p className="text-sm text-indigo-700">
              Безлимитные генерации активны
            </p>
          </div>
        )}

        {profile.balance > 0 && (
          <div className="bg-purple-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-900">Ваш баланс</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {profile.balance} {profile.balance === 1 ? 'генерация' : 'генераций'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link to="/">
            <Button size="lg" className="w-full">
              <Sparkles className="w-5 h-5 mr-2" />
              Начать генерировать
            </Button>
          </Link>

          <Link to="/history">
            <Button variant="secondary" size="lg" className="w-full">
              Посмотреть историю
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Квитанция об оплате отправлена на ваш email
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Если у вас возникли вопросы, обратитесь в{' '}
            <Link to="/support" className="text-indigo-600 hover:underline">
              поддержку
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
