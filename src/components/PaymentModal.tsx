// Компонент модалки оплаты

import React, { useState } from 'react';
import { CreditCard, Crown, Shield, Zap } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useAuth } from '../lib/auth';
import * as api from '../lib/mockApi';
import type { PaymentType } from '../lib/mockApi';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentType: PaymentType;
}

export function PaymentModal({ isOpen, onClose, paymentType }: PaymentModalProps) {
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { refresh } = useAuth();

  const paymentInfo = api.PAYMENT_OPTIONS[paymentType];

  const handlePayment = async () => {
    if (!email) {
      toast.error('Введите email');
      return;
    }

    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Введите номер карты');
      return;
    }

    if (!expiry || expiry.length < 5) {
      toast.error('Введите срок действия карты');
      return;
    }

    if (!cvv || cvv.length < 3) {
      toast.error('Введите CVV код');
      return;
    }

    setIsProcessing(true);
    try {
      await api.processPayment(email, paymentType);
      await refresh();
      
      if (paymentType.startsWith('premium')) {
        toast.success('Премиум активирован! 🎉');
      } else {
        const gens = paymentType === 'pack_3' ? 3 : paymentType === 'pack_5' ? 5 : 10;
        toast.success(`Добавлено ${gens} генераций! 🎉`);
      }
      
      onClose();
      // Очищаем форму
      setCardNumber('');
      setExpiry('');
      setCvv('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка оплаты');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Оплата">
      <div className="space-y-6">
        {/* Информация о покупке */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
          <div className="flex items-center gap-3 mb-2">
            {paymentType.startsWith('premium') ? (
              <Crown className="w-6 h-6 text-indigo-600" />
            ) : (
              <Zap className="w-6 h-6 text-indigo-600" />
            )}
            <h3 className="font-bold text-gray-900">{paymentInfo.label}</h3>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">{paymentInfo.amount} ₽</span>
          </div>
        </div>

        {/* Форма оплаты */}
        <div className="space-y-4">
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
            />
          </div>

          <div>
            <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
              Номер карты
            </label>
            <input
              id="card-number"
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="card-expiry" className="block text-sm font-medium text-gray-700 mb-1">
                Срок действия
              </label>
              <input
                id="card-expiry"
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="ММ/ГГ"
                maxLength={5}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label htmlFor="card-cvv" className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                id="card-cvv"
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                placeholder="123"
                maxLength={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Кнопка оплаты */}
        <Button
          size="lg"
          onClick={handlePayment}
          isLoading={isProcessing}
          className="w-full"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          {isProcessing ? 'Обработка...' : `Оплатить ${paymentInfo.amount} ₽`}
        </Button>

        {/* Безопасность */}
        <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
          <Shield className="w-3.5 h-3.5" />
          <span>Безопасная оплата. Данные карты не сохраняются.</span>
        </div>

        {/* Тестовые данные */}
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Демо-режим:</strong> Используйте любые данные карты для тестирования оплаты.
          </p>
        </div>
      </div>
    </Modal>
  );
}
