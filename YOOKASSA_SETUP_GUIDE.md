# 🚀 Пошаговая инструкция подключения ЮKassa

## 📋 Что уже готово в вашем проекте:

✅ **Фронтенд:**
- Модалка оплаты с выбором способа (карта/ЮMoney/СБП)
- Валидация форм
- Страница успешной оплаты `/payment/success`
- Демо-режим для тестирования

✅ **Бэкенд (пример):**
- Пример серверного API в `src/lib/yookassa-server-example.ts`
- Сервис для работы с платежами в `src/lib/paymentService.ts`
- Конфигурация в `src/lib/paymentConfig.ts`

---

## 🔧 Шаг 1: Регистрация в ЮKassa

### 1.1. Юридическая подготовка

**Вариант А — Самозанятость (рекомендую для старта):**
1. Скачайте приложение **«Мой налог»** (iOS/Android)
2. Зарегистрируйтесь за 5 минут (нужен паспорт + ИНН)
3. Налог: 4% с физлиц, 6% с юрлиц
4. Лимит: 2.4 млн ₽/год

**Вариант Б — ИП:**
1. Регистрация на [nalog.ru](https://nalog.ru) или через банк
2. Госпошлина: 0 ₽ (электронная подача)
3. Срок: 3-5 рабочих дней
4. Больше возможностей и лимитов

### 1.2. Регистрация в ЮKassa

1. Перейдите на [yookassa.ru](https://yookassa.ru)
2. Нажмите **«Подключиться»**
3. Заполните анкету:
   - **Тип бизнеса:** Самозанятый / ИП
   - **Описание:** SEO-генератор описаний для маркетплейсов
   - **Сайт:** URL вашего сайта (должен быть доступен)
   - **Расчётный счёт:** Откройте в любом банке (Тинькофф, Сбер, Альфа)
   - **ОКВЭД:** 62.01 (Разработка компьютерного программного обеспечения)
4. Дождитесь проверки (1-3 рабочих дня)
5. Получите в личном кабинете:
   - **shopId** (идентификатор магазина)
   - **secretKey** (секретный ключ)

---

## 🛠 Шаг 2: Настройка серверной части

### 2.1. Создайте сервер (выберите один вариант)

**Вариант А — Express.js (отдельный сервер):**

```bash
# Создайте папку server
mkdir server
cd server
npm init -y
npm install express axios cors dotenv
```

Создайте файл `server/index.js`:

```javascript
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3000';

// Создание платежа
app.post('/api/create-payment', async (req, res) => {
  const { amount, description, email, paymentType, paymentMethod } = req.body;

  try {
    const paymentData = {
      amount: { value: amount.toFixed(2), currency: 'RUB' },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: `${PUBLIC_URL}/#/payment/success?payment_type=${paymentType}`,
      },
      description,
      metadata: { email, payment_type: paymentType },
    };

    if (paymentMethod === 'yoomoney') {
      paymentData.payment_method_data = { type: 'yoo_money' };
    } else if (paymentMethod === 'sbp') {
      paymentData.confirmation = { type: 'qr', locale: 'ru_RU' };
      paymentData.payment_method_data = { type: 'sbp' };
    }

    const response = await axios({
      method: 'post',
      url: 'https://api.yookassa.ru/v3/payments',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': crypto.randomUUID(),
      },
      auth: { username: YOOKASSA_SHOP_ID, password: YOOKASSA_SECRET_KEY },
       paymentData,
    });

    res.json({
      success: true,
      confirmation_url: response.data.confirmation.confirmation_url,
      payment_id: response.data.id,
    });
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Ошибка создания платежа' });
  }
});

// Webhook от ЮKassa
app.post('/api/yookassa-webhook', async (req, res) => {
  const { event, object } = req.body;

  if (event === 'payment.succeeded') {
    const { metadata, amount, id } = object;
    console.log(`✅ Платёж ${id} успешен: ${metadata.email}, ${metadata.payment_type}, ${amount.value}₽`);
    
    // TODO: Обновите профиль пользователя в базе данных
    // await db.profiles.update(...)
  }

  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Сервер на порту ${PORT}`));
```

Создайте файл `server/.env`:

```env
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=ваш_secret_key
PUBLIC_URL=https://your-domain.com
PORT=4000
```

**Вариант Б — Next.js API Routes (если используете Next.js):**

Создайте файлы:
- `app/api/create-payment/route.ts`
- `app/api/yookassa-webhook/route.ts`

(Код возьмите из `src/lib/yookassa-server-example.ts`)

### 2.2. Разверните сервер

**Бесплатные варианты:**
- **Vercel** (для Next.js) — vercel.com
- **Railway** — railway.app
- **Render** — render.com
- **Fly.io** — fly.io

**Платные (надёжнее):**
- **Timeweb** — от 200 ₽/мес
- **Beget** — от 150 ₽/мес
- **Reg.ru** — от 300 ₽/мес

---

## 🔗 Шаг 3: Настройка webhook в ЮKassa

1. Зайдите в личный кабинет ЮKassa
2. Раздел **«Настройки»** → **«HTTP-уведомления»**
3. Добавьте URL: `https://your-server.com/api/yookassa-webhook`
4. Выберите события:
   - ✅ `payment.succeeded`
   - ✅ `payment.canceled`
5. Сохраните

---

## 🎨 Шаг 4: Обновите фронтенд

В файле `src/lib/paymentConfig.ts` измените:

```typescript
export const PAYMENT_CONFIG: PaymentConfig = {
  provider: 'yookassa', // было 'demo'
  
  // Эти поля не нужны для API-интеграции,
  // но можно оставить для справки
  shopId: 'ваш_shop_id',
  webhookUrl: 'https://your-server.com/api/yookassa-webhook',
};
```

---

## 🧪 Шаг 5: Тестирование

### 5.1. Тестовый режим ЮKassa

ЮKassa предоставляет тестовые карты:

**Успешная оплата:**
- Номер: `5555 5555 5555 4444`
- Срок: любой будущий
- CVV: любые 3 цифры

**Отклонённая оплата:**
- Номер: `5555 5555 5555 4477`

### 5.2. Проверка флоу

1. Откройте сайт
2. Выберите тариф/пакет
3. Введите email
4. Выберите способ оплаты
5. Нажмите «Оплатить»
6. Проверьте редирект на страницу ЮKassa
7. Введите тестовую карту
8. Проверьте возврат на `/payment/success`
9. Убедитесь, что профиль обновился

---

## 💰 Шаг 6: Финансы и налоги

### 6.1. Комиссии

- **ЮKassa:** 3.5% с каждого платежа
- **Ваш доход:** 96.5% от суммы
- **Налог (самозанятый):** 4% с физлиц
- **Итого на руки:** ~92.5%

**Пример:**
- Клиент платит: 200 ₽
- Комиссия ЮKassa: 7 ₽
- Ваш доход: 193 ₽
- Налог 4%: 7.72 ₽
- **Чистыми: 185.28 ₽**

### 6.2. Вывод средств

- Вывод на расчётный счёт: 1-3 рабочих дня
- Минимальная сумма: 10 ₽
- Без ограничений по количеству выводов

### 6.3. Налоговая отчётность

**Для самозанятых:**
- Отчёты через приложение «Мой налог»
- Формируйте чеки автоматически (ЮKassa может отправлять webhook)
- Налог платите ежемесячно до 25 числа

---

## 🔒 Шаг 7: Безопасность

### Обязательные меры:

1. **HTTPS** — сайт должен работать по HTTPS (бесплатно через Let's Encrypt)
2. **SecretKey** — храните только на сервере, никогда не в фронтенде
3. **Webhook подпись** — проверяйте подпись уведомлений от ЮKassa
4. **CORS** — настройте разрешённые домены
5. **Rate limiting** — защитите API от спама

### Проверка webhook подписи:

```javascript
// Добавьте в server/index.js
const verifyWebhookSignature = (body, signature) => {
  const hash = crypto
    .createHmac('sha256', YOOKASSA_SECRET_KEY)
    .update(JSON.stringify(body))
    .digest('hex');
  return hash === signature;
};

app.post('/api/yookassa-webhook', (req, res) => {
  const signature = req.headers['x-yookassa-signature'];
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  // ... обработка
});
```

---

## 📞 Шаг 8: Поддержка клиентов

### Что нужно предусмотреть:

1. **Возвраты** — ЮKassa позволяет возвращать деньги через API
2. **Чеки** — отправляйте клиентам чеки (обязательно для самозанятых)
3. **FAQ** — добавьте раздел с частыми вопросами об оплате
4. **Контакты** — укажите email/Telegram для вопросов по оплате

### Код возврата платежа:

```javascript
// server/index.js
app.post('/api/refund', async (req, res) => {
  const { paymentId, amount } = req.body;

  const response = await axios({
    method: 'post',
    url: 'https://api.yookassa.ru/v3/refunds',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': crypto.randomUUID(),
    },
    auth: { username: YOOKASSA_SHOP_ID, password: YOOKASSA_SECRET_KEY },
     {
        payment_id: paymentId,
        amount: { value: amount.toFixed(2), currency: 'RUB' },
      },
  });

  res.json({ success: true, refund_id: response.data.id });
});
```

---

## 🎯 Чек-лист перед запуском

- [ ] Зарегистрирован как самозанятый/ИП
- [ ] Открыт расчётный счёт
- [ ] Подключена ЮKassa (получены shopId и secretKey)
- [ ] Развёрнут сервер с API
- [ ] Настроен webhook в ЮKassa
- [ ] Протестирована оплата в тестовом режиме
- [ ] Проверена страница `/payment/success`
- [ ] Настроена проверка webhook подписи
- [ ] Добавлены контакты поддержки
- [ ] Настроена отправка чеков
- [ ] Сайт работает по HTTPS

---

## 🆘 Если что-то пошло не так

### Частые проблемы:

**1. Ошибка "Shop not found"**
- Проверьте shopId в .env
- Убедитесь, что магазин активирован в ЮKassa

**2. Webhook не приходит**
- Проверьте URL webhook в настройках ЮKassa
- Убедитесь, что сервер доступен из интернета
- Проверьте логи сервера

**3. Платёж создан, но профиль не обновился**
- Проверьте логи webhook обработчика
- Убедитесь, что metadata содержит email и payment_type
- Проверьте подключение к базе данных

**4. Ошибка CORS**
- Добавьте ваш домен в разрешённые в настройках CORS
- Используйте `cors({ origin: 'https://your-domain.com' })`

### Поддержка ЮKassa:

- Документация: [yookassa.ru/developers](https://yookassa.ru/developers/)
- Telegram: [@yookassa_bot](https://t.me/yookassa_bot)
- Email: support@yookassa.ru

---

## 📊 Альтернативы ЮKassa

Если ЮKassa не подходит, рассмотрите:

| Сервис | Комиссия | Особенности |
|--------|----------|-------------|
| **CloudPayments** | 2.8% | Подписки, рекуррентные платежи |
| **Robokassa** | 2.7% | Простая интеграция, много способов |
| **Tinkoff Касса** | 2.9% | Быстрое подключение |
| **Prodamus** | 4% | Для инфобизнеса, не нужно ИП |
| **YooMoney** | 3.5% | Для самозанятых, проще ЮKassa |

---

## ✅ Готово!

Теперь ваш сайт готов принимать реальные платежи. Удачи с проектом! 🚀
