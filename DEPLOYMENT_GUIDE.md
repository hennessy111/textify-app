# 🚀 ПОЛНАЯ ИНСТРУКЦИЯ ПО ЗАПУСКУ SEO-ГЕНЕРАТОРА

## 📋 Что нужно сделать:

1. ✅ Задеплоить фронтенд на Vercel (5 минут)
2. ✅ Задеплоить сервер на Railway (10 минут)
3. ✅ Настроить ЮKassa (5 минут)
4. ✅ Протестировать оплату (5 минут)

---

## 🎨 ШАГ 1: Деплой фронтенда на Vercel

### 1.1. Загрузите проект на GitHub

```bash
# В корне проекта (где package.json)
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/seo-generator.git
git push -u origin main
```

### 1.2. Деплой на Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите **"Add New Project"**
4. Выберите ваш репозиторий `seo-generator`
5. Vercel автоматически определит Vite
6. Нажмите **"Deploy"**
7. Подождите 1-2 минуты
8. Получите URL: `https://seo-generator-xxxx.vercel.app`

**✅ Фронтенд готов!**

---

## 🔧 ШАГ 2: Деплой сервера на Railway

### 2.1. Создайте отдельный репозиторий для сервера

```bash
# Создайте папку server (уже есть в проекте)
cd server

# Инициализируйте git
git init
git add .
git commit -m "Server initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/seo-generator-server.git
git push -u origin main
```

### 2.2. Деплой на Railway

1. Зайдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите **"New Project"** → **"Deploy from GitHub repo"**
4. Выберите репозиторий `seo-generator-server`
5. Railway автоматически определит Node.js
6. Подождите 1-2 минуты
7. Скопируйте URL сервера: `https://seo-generator-server.up.railway.app`

### 2.3. Настройте переменные окружения в Railway

1. В Railway откройте ваш проект
2. Перейдите в раздел **"Variables"**
3. Добавьте переменные:

```
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=ваш_secret_key
PUBLIC_URL=https://seo-generator-xxxx.vercel.app
PORT=4000
```

**✅ Сервер готов!**

---

## 💳 ШАГ 3: Настройка ЮKassa

### 3.1. Получите credentials

1. Зайдите в личный кабинет [yookassa.ru](https://yookassa.ru)
2. Перейдите в **"Настройки"** → **"Ключи API"**
3. Скопируйте:
   - **Shop ID** (например: `123456`)
   - **Secret Key** (например: `test_AbCdEfGhIjKlMnOpQrStUvWxYz`)

### 3.2. Настройте webhook

1. В личном кабинете ЮKassa: **"Настройки"** → **"HTTP-уведомления"**
2. Добавьте URL:
   ```
   https://seo-generator-server.up.railway.app/api/yookassa-webhook
   ```
3. Выберите события:
   - ✅ `payment.succeeded`
   - ✅ `payment.canceled`
4. Сохраните

### 3.3. Обновите фронтенд

В файле `src/lib/paymentConfig.ts` измените:

```typescript
export const PAYMENT_CONFIG: PaymentConfig = {
  provider: 'yookassa', // было 'demo'
  
  // URL вашего сервера
  apiUrl: 'https://seo-generator-server.up.railway.app',
};
```

Обновите `src/lib/paymentService.ts`:

```typescript
// Замените '/api/create-payment' на полный URL
const response = await axios.post('https://seo-generator-server.up.railway.app/api/create-payment', {
  amount: data.amount,
  description: data.description,
  email: data.email,
  paymentType: data.paymentType,
  paymentMethod: data.paymentMethod,
});
```

Запушьте изменения:

```bash
git add .
git commit -m "Connect to YooKassa"
git push
```

Vercel автоматически пересоберёт сайт.

**✅ ЮKassa подключена!**

---

## 🧪 ШАГ 4: Тестирование

### 4.1. Проверьте сервер

Откройте в браузере:
```
https://seo-generator-server.up.railway.app/health
```

Должно вернуться:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "yookassa_configured": true
}
```

### 4.2. Тестовая оплата

1. Откройте ваш сайт: `https://seo-generator-xxxx.vercel.app`
2. Зарегистрируйтесь
3. Перейдите в "Тарифы"
4. Выберите "Пакет 3 генерации" (100 ₽)
5. Введите email
6. Нажмите "Оплатить"
7. Вас перенаправит на страницу ЮKassa
8. Используйте тестовую карту:
   - **Номер:** `5555 5555 5555 4444`
   - **Срок:** любой будущий (например `12/25`)
   - **CVV:** любые 3 цифры (например `123`)
9. Нажмите "Оплатить"
10. Вас вернёт на страницу `/payment/success`

### 4.3. Проверьте логи

В Railway откройте **"Deployments"** → **"Logs"**:

Должны увидеть:
```
📝 Создание платежа:
   Сумма: 100 ₽
   Email: test@example.com
   Тип: pack_3
   
✅ Платёж создан успешно
   Payment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

🔔 Получен webhook: payment.succeeded

✅ Платёж успешен:
   Payment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Сумма: 100.00 RUB
   Email: test@example.com
   Тип: pack_3
```

**✅ Всё работает!**

---

## 🎯 ШАГ 5: Финальная проверка

### Чек-лист перед запуском:

- [ ] Фронтенд задеплоен на Vercel
- [ ] Сервер задеплоен на Railway
- [ ] Переменные окружения настроены в Railway
- [ ] Webhook настроен в ЮKassa
- [ ] Тестовая оплата прошла успешно
- [ ] Логи показывают успешные платежи
- [ ] Страница `/payment/success` отображается
- [ ] HTTPS работает на обоих доменах

---

## 💰 Что дальше?

### Обновление профилей пользователей

Сейчас после оплаты webhook приходит на сервер, но профили не обновляются автоматически (потому что данные хранятся в localStorage).

**Для продакшена нужно:**

1. **Подключить базу данных** (Supabase/PostgreSQL):
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Создать таблицу profiles:**
   ```sql
   create table profiles (
     id uuid references auth.users(id) primary key,
     email text unique not null,
     is_premium boolean default false,
     balance integer default 0,
     created_at timestamptz default now()
   );
   ```

3. **Обновить webhook обработчик** в `server/index.js`:
   ```javascript
   const { createClient } = require('@supabase/supabase-js');
   
   const supabase = createClient(
     process.env.SUPABASE_URL,
     process.env.SUPABASE_SERVICE_KEY
   );
   
   // В webhook обработчике:
   if (event === 'payment.succeeded') {
     const { metadata } = object;
     
     if (metadata.payment_type.startsWith('premium')) {
       await supabase
         .from('profiles')
         .update({ is_premium: true })
         .eq('email', metadata.email);
     } else if (metadata.payment_type.startsWith('pack')) {
       const packSize = getPackSize(metadata.payment_type);
       await supabase
         .from('profiles')
         .update({ balance: supabase.rpc('increment_balance', { 
           user_email: metadata.email, 
           amount: packSize 
         })})
         .eq('email', metadata.email);
     }
   }
   ```

4. **Обновить фронтенд** для работы с Supabase вместо localStorage

---

## 🆘 Решение проблем

### Проблема 1: "CORS error"

**Решение:** Добавьте ваш домен фронтенда в CORS настройки сервера:

```javascript
// server/index.js
app.use(cors({
  origin: [
    'https://seo-generator-xxxx.vercel.app',
    'http://localhost:3000'
  ]
}));
```

### Проблема 2: Webhook не приходит

**Проверьте:**
- URL webhook в ЮKassa правильный?
- Сервер доступен из интернета? (проверьте `/health`)
- Логи сервера показывают запросы?

### Проблема 3: "Shop not found"

**Решение:**
- Проверьте `YOOKASSA_SHOP_ID` в переменных окружения
- Убедитесь, что магазин активирован в ЮKassa
- Проверьте, что используете правильные ключи (тестовые/продакшн)

### Проблема 4: Платёж создан, но профиль не обновился

**Решение:**
- Проверьте логи webhook в Railway
- Убедитесь, что `metadata` содержит `email` и `payment_type`
- Проверьте подключение к базе данных

---

## 📞 Поддержка

- **ЮKassa:** [yookassa.ru/developers](https://yookassa.ru/developers/) | [@yookassa_bot](https://t.me/yookassa_bot)
- **Vercel:** [vercel.com/support](https://vercel.com/support)
- **Railway:** [docs.railway.app](https://docs.railway.app)

---

## ✅ Готово!

Теперь ваш сайт готов принимать реальные платежи! 🎉

**Важно:** Не забудьте обновить фронтенд для работы с базой данных (Supabase), чтобы профили пользователей сохранялись между устройствами.
