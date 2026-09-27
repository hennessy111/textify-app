// Сервис для работы с платёжным API

import axios from 'axios';
import { PAYMENT_CONFIG, PRICING } from './paymentConfig';
import type { PaymentType } from './paymentConfig';

interface CreatePaymentResponse {
  success: boolean;
  confirmation_url?: string;
  payment_id?: string;
  error?: string;
}

/**
 * Создание платежа через ЮKassa API
 * Требует серверную часть (см. server/index.js)
 */
export async function createPayment(
  amount: number,
  description: string,
  email: string,
  paymentType: PaymentType,
  paymentMethod?: 'card' | 'yoomoney' | 'sbp'
): Promise<CreatePaymentResponse> {
  // В демо-режиме не делаем реальный запрос
  if (PAYMENT_CONFIG.provider === 'demo') {
    return { success: true, payment_id: 'demo-' + Date.now() };
  }

  // Проверка конфигурации
  if (!PAYMENT_CONFIG.apiUrl) {
    return {
      success: false,
      error: 'URL сервера не настроен. Обновите paymentConfig.ts',
    };
  }

  try {
    // Запрос к серверному API
    const response = await axios.post(`${PAYMENT_CONFIG.apiUrl}/api/create-payment`, {
      amount,
      description,
      email,
      paymentType,
      paymentMethod,
    });

    return {
      success: true,
      confirmation_url: response.data.confirmation_url,
      payment_id: response.data.payment_id,
    };
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка создания платежа',
    };
  }
}

/**
 * Проверка статуса платежа
 */
export async function checkPaymentStatus(paymentId: string): Promise<{ status: string; amount: string } | null> {
  if (PAYMENT_CONFIG.provider === 'demo') {
    return { status: 'succeeded', amount: '0.00' };
  }

  if (!PAYMENT_CONFIG.apiUrl) {
    return null;
  }

  try {
    const response = await axios.get(`${PAYMENT_CONFIG.apiUrl}/api/payment-status/${paymentId}`);
    return {
      status: response.data.status,
      amount: response.data.amount,
    };
  } catch (error) {
    console.error('Ошибка проверки статуса:', error);
    return null;
  }
}

/**
 * Получить информацию о тарифе
 */
export function getPricingInfo(paymentType: PaymentType) {
  return PRICING[paymentType];
}
