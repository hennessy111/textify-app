// Сервис для работы с платёжным API

import axios from 'axios';
import { PAYMENT_CONFIG, PRICING } from './paymentConfig';
import type { PaymentType } from './paymentConfig';

interface CreatePaymentRequest {
  amount: number;
  description: string;
  email: string;
  paymentType: PaymentType;
  paymentMethod?: 'card' | 'yoomoney' | 'sbp';
}

interface CreatePaymentResponse {
  success: boolean;
  confirmation_url?: string;
  payment_id?: string;
  error?: string;
}

/**
 * Создание платежа через ЮKassa API
 * Требует серверную часть (см. yookassa-server-example.ts)
 */
export async function createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
  // В демо-режиме не делаем реальный запрос
  if (PAYMENT_CONFIG.provider === 'demo') {
    return { success: true, payment_id: 'demo-' + Date.now() };
  }

  try {
    // Запрос к серверному API (который вы должны развернуть)
    const response = await axios.post('/api/create-payment', {
      amount: data.amount,
      description: data.description,
      email: data.email,
      paymentType: data.paymentType,
      paymentMethod: data.paymentMethod,
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

  try {
    const response = await axios.get(`/api/payment-status/${paymentId}`);
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
