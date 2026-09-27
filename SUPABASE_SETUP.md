# 🗄️ Настройка Supabase для хранения данных

## 🔴 Проблема текущего решения

Сейчас все данные хранятся в **localStorage браузера пользователя**:
- ❌ Данные теряются при очистке кэша
- ❌ Нет синхронизации между устройствами
- ❌ Премиум-статус можно подделать
- ❌ История и избранное не сохраняются
- ❌ При переустановке браузера всё пропадает

## ✅ Решение: Supabase (бесплатная база данных)

**Supabase** — это PostgreSQL + аутентификация + real-time в одном флаконе.

### Преимущества:
- ✅ Бесплатно до 500MB данных
- ✅ Встроенная аутентификация (email/пароль)
- ✅ Автоматическое создание профилей
- ✅ Безопасность через RLS (Row Level Security)
- ✅ Real-time обновления
- ✅ Простая интеграция с React

---

## 🚀 Пошаговая настройка Supabase

### ШАГ 1: Регистрация в Supabase (5 минут)

1. Зайдите на [supabase.com](https://supabase.com)
2. Нажмите **"Start your project"**
3. Войдите через GitHub (рекомендуется)
4. Нажмите **"New Project"**
5. Заполните:
   - **Name:** `seo-generator`
   - **Database Password:** (сохраните в надёжном месте!)
   - **Region:** Frankfurt (ближе к России)
   - **Pricing Plan:** Free
6. Нажмите **"Create new project"**
7. Подождите 2-3 минуты (создаётся база)

---

### ШАГ 2: Получение ключей API (1 минута)

1. В проекте Supabase перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL:** `https://xxxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### ШАГ 3: Создание таблиц базы данных (5 минут)

1. В Supabase перейдите в **SQL Editor** (иконка терминала слева)
2. Нажмите **"New query"**
3. Скопируйте содержимое файла `supabase/migrations/001_initial_schema.sql`
4. Вставьте в редактор
5. Нажмите **"Run"** (или Ctrl+Enter)

**Что создастся:**
- ✅ Таблица `profiles` (профили пользователей)
- ✅ Таблица `generations` (история генераций)
- ✅ Таблица `favorites` (избранное)
- ✅ Таблица `payments` (платежи)
- ✅ Индексы для оптимизации
- ✅ RLS политики безопасности
- ✅ Функции для бизнеса (can_generate, activate_premium, etc.)

---

### ШАГ 4: Настройка переменных окружения (1 минута)

Создайте файл `.env` в корне проекта:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**ВАЖНО:** Замените значения на ваши из Supabase!

---

### ШАГ 5: Обновление кода (10 минут)

Теперь нужно заменить `mockApi.ts` на `supabaseApi.ts`.

#### 5.1. Установите Supabase клиент

```bash
npm install @supabase/supabase-js
```

#### 5.2. Создайте клиент Supabase

Файл `src/lib/supabase.ts` уже создан. Проверьте, что он правильно читает переменные окружения.

#### 5.3. Замените импорты

Во всех файлах замените:

```typescript
// Было:
import * as api from '../lib/mockApi';

// Стало:
import * as api from '../lib/supabaseApi';
```

**Файлы для обновления:**
- `src/components/DescriptionCard.tsx`
- `src/components/HistoryList.tsx`
- `src/components/FavoriteCard.tsx`
- `src/components/AuthForm.tsx`
- `src/components/PaymentModal.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/HistoryPage.tsx`
- `src/pages/FavoritesPage.tsx`
- `src/pages/GenerationPage.tsx`
- `src/pages/PaymentSuccessPage.tsx`
- `src/lib/auth.tsx`

#### 5.4. Исправьте ошибки TypeScript

В `supabaseApi.ts` есть несколько мест, где нужно добавить `await` перед `getCurrentUser()`:

```typescript
// Строка 89
const user = await getCurrentUser();

// Строка 177
const user = await getCurrentUser();

// Строка 211
const user = await getCurrentUser();

// Строка 248
const user = await getCurrentUser();

// Строка 290
const user = await getCurrentUser();

// Строка 340
const user = await getCurrentUser();
if (!user) {
  return {
    user: null,
    profile: { is_premium: false, balance: 0 },
    remaining: 3,
  };
}

// Строка 349
const user = await getCurrentUser();
if (!user) return [];
```

---

### ШАГ 6: Тестирование (5 минут)

1. Запустите проект: `npm run dev`
2. Зарегистрируйте нового пользователя
3. Проверьте в Supabase → **Table Editor**:
   - Таблица `auth.users` → должен появиться пользователь
   - Таблица `profiles` → должен создаться профиль автоматически
4. Сгенерируйте описание
5. Проверьте таблицу `generations` → должна появиться запись
6. Добавьте в избранное
7. Проверьте таблицу `favorites` → должна появиться запись

---

## 📊 Структура базы данных

### Таблица `profiles`

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid | ID пользователя (из auth.users) |
| email | text | Email пользователя |
| is_premium | boolean | Статус премиума |
| premium_expires_at | timestamptz | Когда истекает премиум |
| balance | integer | Количество купленных генераций |
| created_at | timestamptz | Дата регистрации |
| updated_at | timestamptz | Дата обновления |

### Таблица `generations`

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid | ID генерации |
| user_id | uuid | ID пользователя |
| product_name | text | Название товара |
| keywords | text[] | Массив ключевых слов |
| platform | text | Площадка (wildberries/ozon/etsy) |
| descriptions | jsonb | Массив описаний |
| created_at | timestamptz | Дата создания |

### Таблица `favorites`

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid | ID записи |
| user_id | uuid | ID пользователя |
| generation_id | uuid | ID генерации |
| description_index | integer | Индекс описания (0-2) |
| created_at | timestamptz | Дата добавления |

### Таблица `payments`

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid | ID платежа |
| user_id | uuid | ID пользователя |
| yookassa_payment_id | text | ID платежа в ЮKassa |
| amount | numeric | Сумма платежа |
| payment_type | text | Тип платежа |
| status | text | Статус (pending/succeeded/failed) |
| created_at | timestamptz | Дата создания |
| updated_at | timestamptz | Дата обновления |

---

## 🔐 Безопасность (RLS)

**Row Level Security** гарантирует, что пользователи могут работать только со своими данными:

```sql
-- Пользователь может видеть только свой профиль
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Пользователь может создавать только свои генерации
create policy "Users can create own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);
```

**Никто не может:**
- ❌ Подсмотреть чужие данные
- ❌ Подделать премиум-статус
- ❌ Удалить чужие генерации
- ❌ Получить доступ без авторизации

---

## 🔄 Миграция данных из localStorage

Если у вас уже есть пользователи в localStorage, можно мигрировать данные:

```typescript
// Функция миграции (запустить один раз)
async function migrateFromLocalStorage() {
  const users = JSON.parse(localStorage.getItem('seo_gen_users') || '[]');
  const generations = JSON.parse(localStorage.getItem('seo_gen_generations') || '[]');
  
  for (const user of users) {
    // Регистрируем пользователя в Supabase
    const { data } = await supabase.auth.signUp({
      email: user.email,
      password: user.password, // Нужно хранить пароли в открытом виде!
    });
    
    // Мигрируем генерации
    for (const gen of generations.filter(g => g.user_id === user.id)) {
      await supabase.from('generations').insert({
        user_id: data.user.id,
        product_name: gen.product_name,
        keywords: gen.keywords,
        platform: gen.platform,
        descriptions: gen.descriptions,
      });
    }
  }
  
  console.log('Миграция завершена!');
}
```

**ВАЖНО:** Этот код работает только если пароли хранились в открытом виде (что плохо для безопасности). В продакшене лучше попросить пользователей зарегистрироваться заново.

---

## 💡 Дополнительные возможности Supabase

### Real-time обновления

```typescript
// Подписка на изменения в реальном времени
supabase
  .channel('generations')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'generations' },
    (payload) => {
      console.log('Новая генерация!', payload.new);
    }
  )
  .subscribe();
```

### Storage для файлов

```typescript
// Загрузка аватарок пользователей
const { data, error } = await supabase
  .storage
  .from('avatars')
  .upload(`user-${userId}.png`, file);
```

### Edge Functions (серверные функции)

```typescript
// Вызов серверной функции
const { data, error } = await supabase.functions.invoke('send-email', {
  body: { to: 'user@example.com', subject: 'Привет!' },
});
```

---

## 📚 Полезные ссылки

- [Документация Supabase](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Dashboard](https://app.supabase.com)

---

## ✅ Чек-лист настройки

- [ ] Зарегистрирован в Supabase
- [ ] Создан проект
- [ ] Скопированы Project URL и anon key
- [ ] Создан файл `.env` с переменными
- [ ] Выполнена SQL миграция (созданы таблицы)
- [ ] Установлен `@supabase/supabase-js`
- [ ] Обновлены импорты с `mockApi` на `supabaseApi`
- [ ] Исправлены ошибки TypeScript (добавлен `await`)
- [ ] Протестирована регистрация
- [ ] Протестирована генерация
- [ ] Протестировано избранное
- [ ] Проверены данные в Supabase Table Editor

---

## 🎯 Результат

После настройки Supabase вы получите:

✅ **Надёжное хранение данных** — в облачной базе PostgreSQL  
✅ **Синхронизация между устройствами** — данные доступны везде  
✅ **Безопасность** — RLS защищает от подделки  
✅ **Масштабируемость** — можно расти до тысяч пользователей  
✅ **Бесплатно** — до 500MB данных и 50,000 активных пользователей  

**Ваши клиенты будут счастливы!** 🎉
