-- ============================================
-- SEO-Генератор: Схема базы данных Supabase
-- ============================================

-- Таблица профилей пользователей
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  is_premium boolean default false,
  premium_expires_at timestamptz,
  balance integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Таблица генераций
create table public.generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_name text not null,
  keywords text[] not null,
  platform text not null check (platform in ('wildberries', 'ozon', 'etsy')),
  descriptions jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Таблица избранного
create table public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  generation_id uuid references public.generations(id) on delete cascade not null,
  description_index integer not null check (description_index >= 0 and description_index < 3),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, generation_id, description_index)
);

-- Таблица платежей
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  yookassa_payment_id text unique not null,
  amount numeric(10, 2) not null,
  payment_type text not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Индексы для оптимизации
create index idx_generations_user_id on public.generations(user_id);
create index idx_generations_created_at on public.generations(created_at desc);
create index idx_favorites_user_id on public.favorites(user_id);
create index idx_payments_user_id on public.payments(user_id);
create index idx_payments_yookassa_id on public.payments(yookassa_payment_id);

-- Функция для автоматического создания профиля при регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Триггер для создания профиля
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Функция для обновления updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Триггеры для updated_at
drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at on public.payments;
create trigger set_updated_at
  before update on public.payments
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- RLS (Row Level Security) Policies
-- ============================================

-- Включаем RLS
alter table public.profiles enable row level security;
alter table public.generations enable row level security;
alter table public.favorites enable row level security;
alter table public.payments enable row level security;

-- Profiles: пользователи могут читать и обновлять только свой профиль
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Generations: пользователи могут управлять только своими генерациями
create policy "Users can view own generations"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "Users can create own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own generations"
  on public.generations for delete
  using (auth.uid() = user_id);

-- Favorites: пользователи могут управлять только своим избранным
create policy "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can create own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- Payments: пользователи могут видеть только свои платежи
create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- ============================================
-- Функции для бизнеса
-- ============================================

-- Функция для получения количества генераций за сегодня
create or replace function public.get_today_generations_count()
returns integer as $$
declare
  count integer;
begin
  select count(*) into count
  from public.generations
  where user_id = auth.uid()
  and created_at >= current_date;
  return count;
end;
$$ language plpgsql security definer;

-- Функция для проверки возможности генерации
create or replace function public.can_generate()
returns boolean as $$
declare
  profile_record public.profiles%rowtype;
  today_count integer;
begin
  -- Получаем профиль пользователя
  select * into profile_record
  from public.profiles
  where id = auth.uid();
  
  -- Если премиум активен
  if profile_record.is_premium and 
     (profile_record.premium_expires_at is null or 
      profile_record.premium_expires_at > now()) then
    return true;
  end if;
  
  -- Считаем генерации за сегодня
  select count(*) into today_count
  from public.generations
  where user_id = auth.uid()
  and created_at >= current_date;
  
  -- 3 бесплатные генерации в день
  if today_count < 3 then
    return true;
  end if;
  
  -- Проверяем баланс купленных генераций
  if profile_record.balance > 0 then
    return true;
  end if;
  
  return false;
end;
$$ language plpgsql security definer;

-- Функция для списания генерации из баланса
create or replace function public.decrement_balance()
returns void as $$
begin
  update public.profiles
  set balance = balance - 1
  where id = auth.uid() and balance > 0;
end;
$$ language plpgsql security definer;

-- Функция для активации премиума
create or replace function public.activate_premium(days integer)
returns void as $$
begin
  update public.profiles
  set 
    is_premium = true,
    premium_expires_at = now() + (days || ' days')::interval
  where id = auth.uid();
end;
$$ language plpgsql security definer;

-- Функция для добавления генераций в баланс
create or replace function public.add_generations_to_balance(amount integer)
returns void as $$
begin
  update public.profiles
  set balance = balance + amount
  where id = auth.uid();
end;
$$ language plpgsql security definer;
