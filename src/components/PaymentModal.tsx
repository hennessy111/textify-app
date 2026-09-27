// Компонент модалки оплаты с поддержкой ЮKassa

import React, { useState } from 'react';
import { CreditCard, Crown, Shield, Zap, Wallet } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useAuth } from '../lib/auth';
import { PAYMENT_CONFIG, PRICING } from '../lib/paymentConfig';
import type { PaymentType } from '../lib/paymentConfig';
import * as api from '../lib/supabaseApi';
import { createPayment } from '../lib/paymentService';
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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'yoomoney' | 'sbp'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const { refresh } = useAuth();

  const pricing = PRICING[paymentType];

  const handlePayment = async () => {
    if (!email) {
      toast.error('Введите email');
      return;
    }

    // Валидация для демо-режима
    if (PAYMENT_CONFIG.provider === 'demo') {
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
    }

    setIsProcessing(true);

    try {
      // Реальная интеграция с ЮKassa
      if (PAYMENT_CONFIG.provider === 'yookassa') {
        const result = await createPayment(
          pricing.amount,
          pricing.label,
          email,
          paymentType,
          paymentMethod
        );

        if (result.success && result.confirmation_url) {
          // Перенаправляем пользователя на страницу оплаты ЮKassa
          window.location.href = result.confirmation_url;
          return;
        } else {
          toast.error(result.error || 'Ошибка создания платежа');
          setIsProcessing(false);
          return;
        }
      }

      // Демо-режим (имитация оплаты)
      await api.processPayment(email, paymentType);
      await refresh();
      
      if (paymentType.startsWith('premium')) {
        toast.success('Премиум активирован! 🎉');
      } else {
        const gens = paymentType === 'pack_3' ? 3 : paymentType === 'pack_5' ? 5 : 10;
        toast.success(`Добавлено ${gens} генераций! 🎉`);
      }
      
      onClose();
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
            <h3 className="font-bold text-gray-900">{pricing.label}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">{pricing.description}</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">{pricing.amount} ₽</span>
          </div>
        </div>

        {/* Выбор способа оплаты */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Способ оплаты
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-3 border rounded-lg text-center transition-all ${
                paymentMethod === 'card'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <CreditCard className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Карта</span>
            </button>
            <button
              onClick={() => setPaymentMethod('yoomoney')}
              className={`p-3 border rounded-lg text-center transition-all ${
                paymentMethod === 'yoomoney'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Wallet className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">ЮMoney</span>
            </button>
            <button
              onClick={() => setPaymentMethod('sbp')}
              className={`p-3 border rounded-lg text-center transition-all ${
                paymentMethod === 'sbp'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Zap className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">СБП</span>
            </button>
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

          {paymentMethod === 'card' && PAYMENT_CONFIG.provider === 'demo' && (
            <>
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
            </>
          )}

          {(paymentMethod === 'yoomoney' || paymentMethod === 'sbp') && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm text-blue-700">
                {paymentMethod === 'yoomoney' 
                  ? '💳 После нажатия "Оплатить" вы будете перенаправлены на страницу ЮMoney для завершения оплаты.'
                  : '📱 После нажатия "Оплатить" вы получите QR-код для оплаты через приложение банка.'}
              </p>
            </div>
          )}
        </div>

        {/* Кнопка оплаты */}
        <Button
          size="lg"
          onClick={handlePayment}
          isLoading={isProcessing}
          className="w-full"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          {isProcessing ? 'Обработка...' : `Оплатить ${pricing.amount} ₽`}
        </Button>

        {/* Безопасность */}
        <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
          <Shield className="w-3.5 h-3.5" />
          <span>Безопасная оплата через ЮKassa</span>
        </div>

        {/* Демо-режим */}
        {PAYMENT_CONFIG.provider === 'demo' && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs text-amber-700">
              <strong>Демо-режим:</strong> Используйте любые данные карты для тестирования.
              Тестовая карта: 5555 5555 5555 4444
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
