// Компонент модалки оплаты

import React, { useState } from 'react';
import { CreditCard, Crown, Shield } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useAuth } from '../lib/auth';
import * as api from '../lib/mockApi';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { refresh } = useAuth();

  const handlePayment = async () => {
    if (!email) {
      toast.error('Введите email');
      return;
    }

    setIsProcessing(true);
    try {
      await api.processPayment(email);
      await refresh();
      toast.success('Оплата прошла успешно! Безлимит активирован 🎉');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка оплаты');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Оформление подписки">
      <div className="space-y-6">
        {/* Информация о тарифе */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
          <div className="flex items-center gap-3 mb-3">
            <Crown className="w-6 h-6 text-indigo-600" />
            <h3 className="font-bold text-gray-900">Безлимит навсегда</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>✅ Неограниченные генерации</p>
            <p>✅ Все маркетплейсы</p>
            <p>✅ История и избранное</p>
            <p>✅ Приоритетная поддержка</p>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">990 ₽</span>
            <span className="text-gray-500">/ единоразово</span>
          </div>
        </div>

        {/* Email для привязки */}
        <div>
          <label htmlFor="payment-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email аккаунта
          </label>
          <input
            id="payment-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            aria-label="Email для оплаты"
          />
          <p className="mt-1 text-xs text-gray-500">
            Укажите email, на который зарегистрирован аккаунт
          </p>
        </div>

        {/* Кнопка оплаты */}
        <Button
          size="lg"
          onClick={handlePayment}
          isLoading={isProcessing}
          className="w-full"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          {isProcessing ? 'Обработка...' : 'Оплатить картой'}
        </Button>

        {/* Безопасность */}
        <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
          <Shield className="w-3.5 h-3.5" />
          <span>Безопасная оплата. Гарантия возврата 14 дней.</span>
        </div>
      </div>
    </Modal>
  );
}
