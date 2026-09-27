// Страница тарифов

import React, { useState } from 'react';
import { Crown, Check, Zap, Users, Sparkles, Calendar, Package } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PaymentModal } from '../components/PaymentModal';
import { useAuth } from '../lib/auth';
import { Link } from 'react-router-dom';
import { PRICING } from '../lib/paymentConfig';
import type { PaymentType } from '../lib/paymentConfig';

export function PricingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentType>('premium_monthly');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { profile, user } = useAuth();

  const handleOpenPayment = (type: PaymentType) => {
    setSelectedPayment(type);
    setIsModalOpen(true);
  };

  const plans = [
    {
      name: 'Гость',
      price: '0 ₽',
      period: '',
      description: 'Попробуйте бесплатно',
      features: [
        '3 генерации всего',
        'Все маркетплейсы',
        'Без истории',
        'Без избранного',
      ],
      highlighted: false,
      cta: 'Начать бесплатно',
      disabled: true,
      icon: Users,
    },
    {
      name: 'Пользователь',
      price: '0 ₽',
      period: '',
      description: 'Для зарегистрированных',
      features: [
        '3 генерации в день',
        'Все маркетплейсы',
        'История генераций',
        'Избранное',
        'Базовая поддержка',
      ],
      highlighted: false,
      cta: user ? 'Текущий тариф' : 'Зарегистрироваться',
      disabled: !!user,
      icon: Sparkles,
    },
    {
      name: 'Премиум',
      price: billingPeriod === 'monthly' ? '200 ₽' : '1 500 ₽',
      period: billingPeriod === 'monthly' ? '/ месяц' : '/ год',
      description: 'Максимум возможностей',
      features: [
        '♾️ Безлимитные генерации',
        'Все маркетплейсы',
        'История и избранное',
        'Приоритетная поддержка',
        'Все будущие функции',
        billingPeriod === 'yearly' ? '💰 Экономия 900 ₽/год' : '',
      ].filter(Boolean),
      highlighted: true,
      cta: profile.is_premium ? '✓ Активен' : 'Подключить',
      disabled: profile.is_premium,
      icon: Crown,
    },
  ];

  const packs = [
    { count: 3, price: PRICING.pack_3.amount, type: 'pack_3' as PaymentType, popular: false },
    { count: 5, price: PRICING.pack_5.amount, type: 'pack_5' as PaymentType, popular: true },
    { count: 10, price: PRICING.pack_10.amount, type: 'pack_10' as PaymentType, popular: false },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Заголовок */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Тарифы
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto mb-8">
          Выберите подходящий план и начните создавать продающие описания прямо сейчас
        </p>

        {/* Переключатель периода оплаты */}
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ежемесячно
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
              billingPeriod === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Ежегодно
            <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">
              -38%
            </span>
          </button>
        </div>
      </div>

      {/* Карточки тарифов */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`p-6 relative ${
              plan.highlighted
                ? 'ring-2 ring-indigo-600 shadow-lg'
                : ''
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium rounded-full">
                  <Zap className="w-3 h-3" />
                  Популярный
                </span>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <plan.icon className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              </div>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              {plan.period && (
                <span className="text-gray-500 ml-1">{plan.period}</span>
              )}
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {plan.highlighted && !plan.disabled ? (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => handleOpenPayment(billingPeriod === 'monthly' ? 'premium_monthly' : 'premium_yearly')}
              >
                {plan.cta}
              </Button>
            ) : plan.name === 'Пользователь' && !user ? (
              <Link to="/register">
                <Button variant="primary" className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            ) : (
              <Button
                variant={plan.highlighted ? 'primary' : 'secondary'}
                className="w-full"
                disabled={plan.disabled}
              >
                {plan.cta}
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* Разовые пакеты */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-full mb-4">
            <Package className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Разовые пакеты</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Купите генерации поштучно
          </h2>
          <p className="text-gray-600">
            Идеально для разовых задач. Без подписки, без обязательств.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <Card
              key={pack.count}
              className={`p-6 relative ${
                pack.popular ? 'ring-2 ring-purple-600 shadow-lg' : ''
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium rounded-full">
                    <Zap className="w-3 h-3" />
                    Выгодно
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-gray-900 mb-1">{pack.count}</div>
                <div className="text-sm text-gray-500">генераций</div>
              </div>

              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-gray-900">{pack.price} ₽</span>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(pack.price / pack.count)} ₽ за генерацию
                </div>
              </div>

              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Без срока действия
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Все маркетплейсы
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Мгновенная активация
                </li>
              </ul>

              <Button
                variant={pack.popular ? 'primary' : 'secondary'}
                className="w-full"
                disabled={!user}
                onClick={() => handleOpenPayment(pack.type)}
              >
                {user ? 'Купить' : 'Сначала войдите'}
              </Button>
            </Card>
          ))}
        </div>

        {!user && (
          <div className="text-center mt-6">
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              Зарегистрируйтесь для покупки пакетов →
            </Link>
          </div>
        )}
      </div>

      {/* Сравнение тарифов */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-12">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
          Сравнение тарифов
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 pr-4 font-medium text-gray-600">Функция</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Гость</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Пользователь</th>
                <th className="text-center py-3 px-4 font-medium text-purple-600">Пакеты</th>
                <th className="text-center py-3 pl-4 font-medium text-indigo-600">Премиум</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 text-gray-700">Генерации</td>
                <td className="py-3 px-4 text-center text-gray-600">3 всего</td>
                <td className="py-3 px-4 text-center text-gray-600">3/день</td>
                <td className="py-3 px-4 text-center text-purple-600">3/5/10</td>
                <td className="py-3 pl-4 text-center font-medium text-indigo-600">∞</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 text-gray-700">Маркетплейсы</td>
                <td className="py-3 px-4 text-center">✓</td>
                <td className="py-3 px-4 text-center">✓</td>
                <td className="py-3 px-4 text-center">✓</td>
                <td className="py-3 pl-4 text-center">✓</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 text-gray-700">История</td>
                <td className="py-3 px-4 text-center text-gray-400">—</td>
                <td className="py-3 px-4 text-center">✓</td>
                <td className="py-3 px-4 text-center">✓</td>
                <td className="py-3 pl-4 text-center">✓</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 text-gray-700">Избранное</td>
                <td className="py-3 px-4 text-center text-gray-400">—</td>
                <td className="py-3 px-4 text-center">✓</td>
                <td className="py-3 px-4 text-center">✓</td>
                <td className="py-3 pl-4 text-center">✓</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-gray-700">Поддержка</td>
                <td className="py-3 px-4 text-center text-gray-400">—</td>
                <td className="py-3 px-4 text-center text-gray-600">Базовая</td>
                <td className="py-3 px-4 text-center text-gray-600">Базовая</td>
                <td className="py-3 pl-4 text-center font-medium text-indigo-600">Приоритетная</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
          Частые вопросы
        </h2>
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Как работает гостевой режим?
            </h3>
            <p className="text-sm text-gray-600">
              Без регистрации вы можете сгенерировать 3 описания всего. После этого необходимо зарегистрироваться для продолжения работы.
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              Как работают разовые пакеты?
            </h3>
            <p className="text-sm text-gray-600">
              Купленные генерации добавляются к вашему балансу и не имеют срока действия. Они используются после исчерпания ежедневного лимита (3 генерации/день).
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
              <Crown className="w-4 h-4 text-indigo-600" />
              Что даёт Премиум?
            </h3>
            <p className="text-sm text-gray-600">
              Безлимитные генерации навсегда. Одна оплата — и никаких ограничений. Плюс приоритетная поддержка и ранний доступ к новым функциям.
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Как работает годовая подписка?
            </h3>
            <p className="text-sm text-gray-600">
              При оплате за год вы экономите 900 ₽ (38%). Это 1 500 ₽ вместо 2 400 ₽ при ежемесячной оплате.
            </p>
          </div>
        </div>
      </div>

      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        paymentType={selectedPayment}
      />
    </div>
  );
}
