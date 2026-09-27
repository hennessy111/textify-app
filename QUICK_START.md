# 🚀 БЫСТРЫЙ СТАРТ — Подключение ЮKassa

## ✅ Что уже готово:

- ✅ Фронтенд (этот проект)
- ✅ Сервер для ЮKassa (папка `server/`)
- ✅ Инструкции по деплою

---

## 📋 Пошаговый план:

### ШАГ 1: Задеплойте фронтенд на Vercel (5 минут)

```bash
# 1. Загрузите проект на GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ВАШ_ЛОГИН/seo-generator.git
git push -u origin main

# 2. Зайдите на vercel.com
# 3. Нажмите "New Project" → выберите репозиторий
# 4. Нажмите "Deploy"
# 5. Скопируйте URL: https://seo-generator-xxxx.vercel.app
```

---

### ШАГ 2: Задеплойте сервер на Railway (10 минут)

```bash
# 1. Перейдите в папку server
cd server

# 2. Загрузите на GitHub (отдельный репозиторий!)
git init
git add .
git commit -m "Server initial commit"
git remote add origin https://github.com/ВАШ_ЛОГИН/seo-generator-server.git
git push -u origin main

# 3. Зайдите на railway.app
# 4. "New Project" → "Deploy from GitHub repo"
# 5. Выберите репозиторий seo-generator-server
# 6. Добавьте переменные окружения (Variables):
```

**Переменные окружения в Railway:**

```env
YOOKASSA_SHOP_ID=ваш_shop_id_из_юkassa
YOOKASSA_SECRET_KEY=ваш_secret_key_из_юkassa
PUBLIC_URL=https://seo-generator-xxxx.vercel.app
PORT=4000
```

**Скопируйте URL сервера:** `https://seo-generator-server.up.railway.app`

---

### ШАГ 3: Настройте webhook в ЮKassa (2 минуты)

1. Зайдите в личный кабинет [yookassa.ru](https://yookassa.ru)
2. **Настройки** → **HTTP-уведомления**
3. Добавьте URL:
   ```
   https://seo-generator-server.up.railway.app/api/yookassa-webhook
   ```
4. Выберите события:
   - ✅ `payment.succeeded`
   - ✅ `payment.canceled`
5. Сохраните

---

### ШАГ 4: Обновите фронтенд (1 минута)

Откройте файл `src/lib/paymentConfig.ts` и измените:

```typescript
export const PAYMENT_CONFIG: PaymentConfig = {
  provider: 'yookassa', // ← было 'demo'
  
  // URL вашего сервера из Railway
  apiUrl: 'https://seo-generator-server.up.railway.app',
};
```

Запушьте изменения:

```bash
git add .
git commit -m "Connect to YooKassa"
git push
```

Vercel автоматически пересоберёт сайт.

---

### ШАГ 5: Протестируйте оплату (5 минут)

1. Откройте ваш сайт: `https://seo-generator-xxxx.vercel.app`
2. Зарегистрируйтесь
3. Перейдите в **Тарифы**
4. Выберите **Пакет 3 генерации** (100 ₽)
5. Введите email
6. Нажмите **Оплатить**
7. Вас перенаправит на страницу ЮKassa
8. Используйте тестовую карту:
   - **Номер:** `5555 5555 5555 4444`
   - **Срок:** `12/25`
   - **CVV:** `123`
9. Нажмите **Оплатить**
10. Проверьте логи в Railway — должно быть:

```
📝 Создание платежа:
   Сумма: 100 ₽
   Email: test@example.com
   Тип: pack_3

✅ Платёж создан успешно

🔔 Получен webhook: payment.succeeded

✅ Платёж успешен:
   Сумма: 100.00 RUB
   Email: test@example.com
```

---

## 🎯 Готово!

Теперь ваш сайт принимает реальные платежи! 💰

---

## 📚 Подробные инструкции:

- **DEPLOYMENT_GUIDE.md** — полная инструкция по деплою
- **YOOKASSA_SETUP_GUIDE.md** — настройка ЮKassa
- **YOOKASSA_INTEGRATION.md** — техническая документация

---

## 🆘 Если что-то не работает:

### Проблема: "CORS error"

**Решение:** Добавьте ваш домен в `server/index.js`:

```javascript
app.use(cors({
  origin: [
    'https://seo-generator-xxxx.vercel.app',
    'http://localhost:3000'
  ]
}));
```

### Проблема: Webhook не приходит

**Проверьте:**
- URL webhook в ЮKassa правильный?
- Сервер доступен? Откройте `https://your-server.up.railway.app/health`
- Логи сервера показывают запросы?

### Проблема: "Shop not found"

**Решение:**
- Проверьте `YOOKASSA_SHOP_ID` в переменных окружения Railway
- Убедитесь, что магазин активирован в ЮKassa

---

## 💡 Следующие шаги:

### Обновление профилей пользователей

Сейчас после оплаты профили не обновляются автоматически (данные в localStorage).

**Для продакшена нужно:**

1. Подключить базу данных (Supabase)
2. Обновить webhook обработчик для записи в БД
3. Обновить фронтенд для работы с Supabase

Подробности в `DEPLOYMENT_GUIDE.md` → раздел "Что дальше?"

---

## 📞 Поддержка:

- **ЮKassa:** [yookassa.ru/developers](https://yookassa.ru/developers/) | [@yookassa_bot](https://t.me/yookassa_bot)
- **Vercel:** [vercel.com/support](https://vercel.com/support)
- **Railway:** [docs.railway.app](https://docs.railway.app)

---

**Удачи с проектом!** 🚀
