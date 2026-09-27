const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Конфигурация ЮKassa
const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3000';

// Проверка конфигурации
if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
  console.error('❌ Ошибка: YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY должны быть установлены в .env');
  process.exit(1);
}

console.log('✅ Конфигурация ЮKassa загружена');
console.log(`📍 Shop ID: ${YOOKASSA_SHOP_ID.substring(0, 8)}...`);
console.log(`🌐 Public URL: ${PUBLIC_URL}`);

// ============================================
// СОЗДАНИЕ ПЛАТЕЖА
// ============================================
app.post('/api/create-payment', async (req, res) => {
  const { amount, description, email, paymentType, paymentMethod } = req.body;

  console.log('\n📝 Создание платежа:');
  console.log(`   Сумма: ${amount} ₽`);
  console.log(`   Email: ${email}`);
  console.log(`   Тип: ${paymentType}`);
  console.log(`   Метод: ${paymentMethod || 'card'}`);

  try {
    // Базовые данные платежа
    const paymentData = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
      capture: true, // Автоматическое списание
      confirmation: {
        type: 'redirect',
        return_url: `${PUBLIC_URL}/#/payment/success?payment_type=${paymentType}`,
      },
      description: description,
      meta {
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

    console.log('✅ Платёж создан успешно');
    console.log(`   Payment ID: ${response.data.id}`);

    res.json({
      success: true,
      confirmation_url: response.data.confirmation.confirmation_url,
      payment_id: response.data.id,
    });
  } catch (error) {
    console.error('❌ Ошибка создания платежа:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.description || 'Ошибка создания платежа',
    });
  }
});

// ============================================
// WEBHOOK ОТ ЮKASSA
// ============================================
app.post('/api/yookassa-webhook', async (req, res) => {
  const { event, object } = req.body;
  
  console.log('\n🔔 Получен webhook:', event);

  // Проверяем подпись webhook'а (для безопасности)
  const signature = req.headers['x-yookassa-signature'];
  if (signature) {
    const hash = crypto
      .createHmac('sha256', YOOKASSA_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (hash !== signature) {
      console.error('❌ Неверная подпись webhook');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  try {
    if (event === 'payment.succeeded') {
      const { id, amount, metadata, payment_method } = object;
      
      console.log('\n✅ Платёж успешен:');
      console.log(`   Payment ID: ${id}`);
      console.log(`   Сумма: ${amount.value} ${amount.currency}`);
      console.log(`   Email: ${metadata?.email}`);
      console.log(`   Тип: ${metadata?.payment_type}`);
      console.log(`   Метод оплаты: ${payment_method?.type}`);

      // TODO: Здесь обновите профиль пользователя в базе данных
      // Пример с Supabase:
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .update({ 
      //     is_premium: metadata.payment_type.startsWith('premium') ? true : undefined,
      //     balance: metadata.payment_type.startsWith('pack') 
      //       ? { increment: getPackSize(metadata.payment_type) }
      //       : undefined
      //   })
      //   .eq('email', metadata.email);

      // TODO: Отправьте email с подтверждением
      // await sendEmail(metadata.email, 'Оплата прошла успешно', ...);

      res.json({ status: 'ok' });

    } else if (event === 'payment.canceled') {
      const { id, metadata } = object;
      console.log(`\n❌ Платёж отменён: ${id}`);
      console.log(`   Email: ${metadata?.email}`);
      
      res.json({ status: 'ok' });

    } else if (event === 'payment.waiting_for_capture') {
      console.log(`\n⏳ Платёж ожидает подтверждения: ${object.id}`);
      res.json({ status: 'ok' });

    } else {
      console.log(`\nℹ️  Неизвестное событие: ${event}`);
      res.json({ status: 'ok' });
    }
  } catch (error) {
    console.error('❌ Ошибка обработки webhook:', error);
    res.status(500).json({ error: 'Ошибка обработки webhook' });
  }
});

// ============================================
// ПРОВЕРКА СТАТУСА ПЛАТЕЖА
// ============================================
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
      currency: response.data.amount.currency,
    });
  } catch (error) {
    console.error('❌ Ошибка проверки статуса:', error.response?.data || error.message);
    res.status(500).json({ error: 'Ошибка проверки статуса' });
  }
});

// ============================================
// ВОЗВРАТ ПЛАТЕЖА
// ============================================
app.post('/api/refund', async (req, res) => {
  const { paymentId, amount } = req.body;

  console.log('\n💸 Возврат платежа:');
  console.log(`   Payment ID: ${paymentId}`);
  console.log(`   Сумма: ${amount} ₽`);

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

    console.log('✅ Возврат создан:', response.data.id);

    res.json({
      success: true,
      refund_id: response.data.id,
      status: response.data.status,
    });
  } catch (error) {
    console.error('❌ Ошибка возврата:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.description || 'Ошибка возврата',
    });
  }
});

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

// Получить размер пакета по типу
function getPackSize(paymentType) {
  switch (paymentType) {
    case 'pack_3': return 3;
    case 'pack_5': return 5;
    case 'pack_10': return 10;
    default: return 0;
  }
}

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    yookassa_configured: !!(YOOKASSA_SHOP_ID && YOOKASSA_SECRET_KEY),
  });
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log('\n🚀 Сервер запущен!');
  console.log(`📍 Порт: ${PORT}`);
  console.log(`🌐 URL: ${PUBLIC_URL}`);
  console.log(`\n📡 Эндпоинты:`);
  console.log(`   POST /api/create-payment - Создание платежа`);
  console.log(`   POST /api/yookassa-webhook - Webhook от ЮKassa`);
  console.log(`   GET  /api/payment-status/:id - Статус платежа`);
  console.log(`   POST /api/refund - Возврат платежа`);
  console.log(`   GET  /health - Проверка здоровья\n`);
});
