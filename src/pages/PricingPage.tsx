// Страница тарифов

import React, { useState } from 'react';
import { Crown, Check, Zap, Users, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PaymentModal } from '../components/PaymentModal';
import { useAuth } from '../lib/auth';

export function PricingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { profile } = useAuth();

  const plans = [
    {
      name: 'Гость',
      price: '0 ₽',
      period: '',
      description: 'Попробуйте бесплатно',
      features: ['3 генерации в день', 'Все маркетплейсы', 'Без истории'],
      highlighted: false,
      cta: 'Текущий тариф',
      disabled: true,
    },
    {
      name: 'Пользователь',
      price: '0 ₽',
      period: '',
      description: 'Для зарегистрированных',
      features: ['10 генераций в день', 'Все маркетплейсы', 'История генераций', 'Избранное'],
      highlighted: false,
      cta: 'Зарегистрироваться',
      disabled: false,
    },
    {
      name: 'Безлимит',
      price: '990 ₽',
      period: 'навсегда',
      description: 'Максимум возможностей',
      features: [
        '♾️ Безлимитные генерации',
        'Все маркетплейсы',
        'История и избранное',
        'Приоритетная поддержка',
        'Все будущие функции',
      ],
      highlighted: true,
      cta: profile.is_premium ? '✓ Активен' : 'Купить',
      disabled: profile.is_premium,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Заголовок */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Тарифы
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Выберите подходящий план и начните создавать продающие описания прямо сейчас
        </p>
      </div>

      {/* Карточки тарифов */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
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
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              {plan.period && (
                <span className="text-gray-500 ml-1">/ {plan.period}</span>
              )}
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              variant={plan.highlighted ? 'primary' : 'secondary'}
              className="w-full"
              disabled={plan.disabled}
              onClick={() => plan.highlighted && !plan.disabled && setIsModalOpen(true)}
            >
              {plan.cta}
            </Button>
          </Card>
        ))}
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
              Без регистрации вы можете генерировать до 3 описаний в день. Лимит привязан к вашему IP-адресу.
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Что даёт Premium?
            </h3>
            <p className="text-sm text-gray-600">
              Безлимитные генерации навсегда. Одна оплата — и никаких ограничений. Плюс приоритетная поддержка и ранний доступ к новым функциям.
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
              <Crown className="w-4 h-4 text-indigo-600" />
              Есть ли гарантия возврата?
            </h3>
            <p className="text-sm text-gray-600">
              Да, мы предоставляем 14-дневную гарантию возврата средств, если сервис вам не подойдёт.
            </p>
          </div>
        </div>
      </div>

      <PaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
