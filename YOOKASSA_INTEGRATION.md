# Интеграция с ЮKassa

## 📦 Установка зависимостей

```bash
npm install axios crypto
```

## 🔑 Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# ЮKassa credentials (получите в личном кабинете)
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=ваш_secret_key

# URL вашего сайта (для webhook'ов)
PUBLIC_URL=https://your-domain.com
```

## 🚀 Использование

### 1. Платёжный виджет (простой способ)

Виджет ЮKassa — это готовая платёжная форма, которую можно встроить на сайт.
Не требует серверной части для создания платежа.

```javascript
// В компоненте PaymentModal.tsx
const yookassaWidget = new window.YooMoneyCheckoutWidget({
  confirmation_token: 'токен_платежа', // получаете с бэкенда
  return_url: 'https://your-site.com/payment/success',
  customizations: {
    colors: {
      control_primary: '#4f46e5', // indigo-600
    },
  },
});

yookassaWidget.render('payment-form');
```

### 2. Создание платежа (серверная часть)

Для создания платежа нужен бэкенд (нельзя хранить secretKey на фронтенде).

Пример API endpoint (Node.js/Express):

```javascript
// server/api/create-payment.js
const axios = require('axios');

app.post('/api/create-payment', async (req, res) => {
  const { amount, description, email, paymentType } = req.body;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.yookassa.ru/v3/payments',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': crypto.randomUUID(),
      },
      auth: {
        username: process.env.YOOKASSA_SHOP_ID,
        password: process.env.YOOKASSA_SECRET_KEY,
      },
       {
          amount: {
            value: amount.toFixed(2),
            currency: 'RUB',
          },
          confirmation: {
            type: 'redirect',
            return_url: `${process.env.PUBLIC_URL}/payment/success?payment_type=${paymentType}`,
          },
          capture: true,
          description: description,
          metadata: {
            email: email,
            payment_type: paymentType,
          },
        },
    });

    res.json({
      confirmation_url: response.data.confirmation.confirmation_url,
      payment_id: response.data.id,
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания платежа' });
  }
});
```

### 3. Обработка webhook'ов

ЮKassa отправляет уведомления о статусе платежа на ваш webhook URL.

```javascript
// server/api/yookassa-webhook.js
app.post('/api/yookassa-webhook', async (req, res) => {
  const { event, object } = req.body;

  if (event === 'payment.succeeded') {
    const { metadata, amount } = object;
    const email = metadata.email;
    const paymentType = metadata.payment_type;

    // Обновляем профиль пользователя
    // (здесь нужна функция для работы с БД)
    await updateUserPayment(email, paymentType, amount.value);

    // Отправляем email пользователю
    await sendConfirmationEmail(email, paymentType);
  }

  res.json({ status: 'ok' });
});
```

### 4. Настройка webhook в ЮKassa

1. Зайдите в личный кабинет ЮKassa
2. Раздел «Настройки» → «HTTP-уведомления»
3. Добавьте URL: `https://your-domain.com/api/yookassa-webhook`
4. Выберите события: `payment.succeeded`, `payment.canceled`

## 💰 Тарифы ЮKassa

- **Комиссия:** 3.5% (карты РФ)
- **Минимальный платёж:** 1 ₽
- **Вывод средств:** на расчётный счёт (1-3 дня)
- **Без абонентской платы**

## 🧹 Тестовый режим

ЮKassa предоставляет тестовый режим:
- Используйте тестовые карты из документации
- Деньги не списываются
- Можно проверить весь флоу

Тестовые карты:
- Успешная оплата: `5555 5555 5555 4444`
- Отклонённая: `5555 5555 5555 4477`

## 📚 Документация

- [Официальная документация ЮKassa](https://yookassa.ru/developers/)
- [API Reference](https://yookassa.ru/developers/api)
- [Виджет оплаты](https://yookassa.ru/developers/payment-forms/widget)

## 🚀 Альтернативы для быстрого старта

Если нужна интеграция без бэкенда:

### YooMoney (бывшие Яндекс.Деньги)
- Подходит для самозанятых
- Можно принимать платежи на кошелёк
- Простая интеграция через формы

### Tinkoff Checkout
- Готовый виджет
- Не нужен бэкенд для базовой интеграции
- Комиссия 2.9%

## ⚠️ Важно

1. **Безопасность:** Никогда не храните secretKey на фронтенде
2. **HTTPS:** Сайт должен работать по HTTPS
3. **PCI DSS:** При использовании виджета ЮKassa берёт на себя соответствие стандартам
4. **Налоги:** Не забывайте декларировать доходы (для самозанятых — через «Мой налог»)
