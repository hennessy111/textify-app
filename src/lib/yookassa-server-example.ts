/**
 * Пример серверного API для интеграции с ЮKassa
 * 
 * Этот файл показывает, как должен выглядеть бэкенд для обработки платежей.
 * Для продакшена создайте отдельный сервер (Node.js/Express или Next.js API routes).
 * 
 * Установка зависимостей:
 * npm install express axios cors dotenv
 */

// === СЕРВЕРНАЯ ЧАСТЬ (Node.js + Express) ===

/*
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ЮKassa credentials из .env
const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3000';

// === Создание платежа ===
app.post('/api/create-payment', async (req, res) => {
  const { amount, description, email, paymentType, paymentMethod } = req.body;

  try {
    // Формируем запрос к ЮKassa
    const paymentData = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
      capture: true, // Автоматическое подтверждение платежа
      confirmation: {
        type: 'redirect',
        return_url: `${PUBLIC_URL}/payment/success?payment_type=${paymentType}`,
      },
      description: description,
      metadata: {
        email: email,
        payment_type: paymentType,
      },
    };

    // Добавляем способ оплаты если указан
    if (paymentMethod === 'yoomoney') {
      paymentData.payment_method_data = {
        type: 'yoo_money',
      };
    } else if (paymentMethod === 'sbp') {
      paymentData.confirmation = {
        type: 'qr',
        locale: 'ru_RU',
      };
      paymentData.payment_method_data = {
        type: 'sbp',
      };
    }

    // Отправляем запрос в ЮKassa
    const response = await axios({
      method: 'post',
      url: 'https://api.yookassa.ru/v3/payments',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': crypto.randomUUID(),
      },
      auth: {
        username: YOOKASSA_SHOP_ID,
        password: YOOKASSA_SECRET_KEY,
      },
       paymentData,
    });

    // Возвращаем URL для редиректа пользователя
    res.json({
      success: true,
      confirmation_url: response.data.confirmation.confirmation_url,
      payment_id: response.data.id,
    });
  } catch (error) {
    console.error('Ошибка создания платежа:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания платежа',
    });
  }
});

// === Обработка webhook'ов от ЮKassa ===
app.post('/api/yookassa-webhook', async (req, res) => {
  const { event, object } = req.body;

  // Проверяем подпись (для безопасности)
  // В продакшене обязательно проверяйте подпись webhook'а

  console.log('Webhook получен:', event);

  if (event === 'payment.succeeded') {
    const { metadata, amount, id } = object;
    const email = metadata.email;
    const paymentType = metadata.payment_type;

    console.log(`Платёж ${id} успешен: ${email}, ${paymentType}, ${amount.value}₽`);

    try {
      // Здесь обновляем профиль пользователя в базе данных
      // await db.profiles.update({
      //   where: { email },
      //    paymentType === 'premium_monthly' || paymentType === 'premium_yearly'
      //     ? { is_premium: true }
      //     : { balance: { increment: getPackSize(paymentType) } }
      // });

      // Отправляем email с подтверждением
      // await sendConfirmationEmail(email, paymentType);

      res.json({ status: 'ok' });
    } catch (error) {
      console.error('Ошибка обработки webhook:', error);
      res.status(500).json({ error: 'Ошибка обработки' });
    }
  } else if (event === 'payment.canceled') {
    const { id, metadata } = object;
    console.log(`Платёж ${id} отменён: ${metadata.email}`);
    res.json({ status: 'ok' });
  } else {
    res.json({ status: 'ok' });
  }
});

// === Проверка статуса платежа ===
app.get('/api/payment-status/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  try {
    const response = await axios({
      method: 'get',
      url: `https://api.yookassa.ru/v3/payments/${paymentId}`,
      auth: {
        username: YOOKASSA_SHOP_ID,
        password: YOOKASSA_SECRET_KEY,
      },
    });

    res.json({
      status: response.data.status,
      amount: response.data.amount.value,
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка проверки статуса' });
  }
});

// === Возврат платежа ===
app.post('/api/refund', async (req, res) => {
  const { paymentId, amount } = req.body;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.yookassa.ru/v3/refunds',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': crypto.randomUUID(),
      },
      auth: {
        username: YOOKASSA_SHOP_ID,
        password: YOOKASSA_SECRET_KEY,
      },
       {
          payment_id: paymentId,
          amount: {
            value: amount.toFixed(2),
            currency: 'RUB',
          },
        },
    });

    res.json({ success: true, refund_id: response.data.id });
  } catch (error) {
    console.error('Ошибка возврата:', error.response?.data || error.message);
    res.status(500).json({ error: 'Ошибка возврата' });
  }
});

// Вспомогательная функция
function getPackSize(paymentType) {
  switch (paymentType) {
    case 'pack_3': return 3;
    case 'pack_5': return 5;
    case 'pack_10': return 10;
    default: return 0;
  }
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
*/

// === ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ (.env) ===
/*
YOOKASSA_SHOP_ID=ваш_shop_id_из_личного_кабинета
YOOKASSA_SECRET_KEY=ваш_secret_key_из_личного_кабинета
PUBLIC_URL=https://your-domain.com
PORT=4000
*/

// === ИНСТРУКЦИЯ ПО РАЗВЁРТЫВАНИЮ ===
/*
1. Создайте сервер (Express/Next.js API routes)
2. Установите зависимости: npm install express axios cors dotenv
3. Настройте .env файл с credentials из ЮKassa
4. Разверните сервер (Vercel/Railway/Render/VPS)
5. Настройте webhook URL в личном кабинете ЮKassa
6. Обновите фронтенд для работы с реальным API

=== АЛЬТЕРНАТИВА: NEXT.JS API ROUTES ===

Если используете Next.js, создайте файлы:
- app/api/create-payment/route.ts
- app/api/yookassa-webhook/route.ts
- app/api/payment-status/[id]/route.ts

Пример для Next.js:

// app/api/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const response = await axios({
    method: 'post',
    url: 'https://api.yookassa.ru/v3/payments',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': crypto.randomUUID(),
    },
    auth: {
      username: process.env.YOOKASSA_SHOP_ID!,
      password: process.env.YOOKASSA_SECRET_KEY!,
    },
     {
        amount: { value: body.amount.toFixed(2), currency: 'RUB' },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.PUBLIC_URL}/payment/success?payment_type=${body.paymentType}`,
        },
        description: body.description,
        metadata: { email: body.email, payment_type: body.paymentType },
      },
  });

  return NextResponse.json({
    confirmation_url: response.data.confirmation.confirmation_url,
    payment_id: response.data.id,
  });
}
*/

export {};
