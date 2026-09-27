// Мок API — симуляция бэкенда с localStorage

import type { Generation, Favorite, User, Profile, Platform } from '../types';
import { generateId, getMockIp } from './utils';
import { generateDescriptions } from './prompts';
import { getRemaining, canGenerate } from './limits';

// Ключи localStorage
const KEYS = {
  GENERATIONS: 'seo_gen_generations',
  FAVORITES: 'seo_gen_favorites',
  USER: 'seo_gen_user',
  PROFILE: 'seo_gen_profile',
  IP: 'seo_gen_ip',
};

// Хелперы для работы с localStorage
function getStore<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getObject<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setObject<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Имитация задержки сети
function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Получить IP (сохраняем в localStorage для консистентности)
function getIp(): string {
  let ip = localStorage.getItem(KEYS.IP);
  if (!ip) {
    ip = getMockIp();
    localStorage.setItem(KEYS.IP, ip);
  }
  return ip;
}

// === AUTH ===

export async function register(email: string, password: string): Promise<{ user: User; profile: Profile }> {
  await delay(800);
  
  // Проверяем, не зарегистрирован ли уже
  const existingUsers = getStore<{ email: string; password: string; id: string }>('seo_gen_users');
  if (existingUsers.find((u) => u.email === email)) {
    throw new Error('Пользователь с таким email уже существует');
  }

  const id = generateId();
  const user: User = { id, email };
  const profile: Profile = { id, is_premium: false, created_at: new Date().toISOString() };

  // Сохраняем пользователя
  existingUsers.push({ email, password, id });
  setStore('seo_gen_users', existingUsers);
  setObject(KEYS.USER, user);
  setObject(KEYS.PROFILE, profile);

  return { user, profile };
}

export async function login(email: string, password: string): Promise<{ user: User; profile: Profile }> {
  await delay(800);

  const users = getStore<{ email: string; password: string; id: string }>('seo_gen_users');
  const found = users.find((u) => u.email === email && u.password === password);
  
  if (!found) {
    throw new Error('Неверный email или пароль');
  }

  const user: User = { id: found.id, email: found.email };
  const profile = getObject<Profile>(KEYS.PROFILE) || { id: found.id, is_premium: false, created_at: new Date().toISOString() };
  
  setObject(KEYS.USER, user);
  setObject(KEYS.PROFILE, profile);

  return { user, profile };
}

export async function logout(): Promise<void> {
  await delay(200);
  localStorage.removeItem(KEYS.USER);
  localStorage.removeItem(KEYS.PROFILE);
}

export function getCurrentUser(): User | null {
  return getObject<User>(KEYS.USER);
}

export function getCurrentProfile(): Profile {
  return getObject<Profile>(KEYS.PROFILE) || { id: '', is_premium: false, created_at: '' };
}

// === GENERATE ===

export async function generate(
  productName: string,
  keywords: string[],
  platform: Platform
): Promise<{ success: boolean; data?: { id: string; descriptions: { text: string }[] }; error?: string; remaining?: number }> {
  await delay(1500); // Имитация запроса к OpenAI

  const user = getCurrentUser();
  const profile = getCurrentProfile();
  const ip = getIp();
  const generations = getStore<Generation>(KEYS.GENERATIONS);

  // Проверка лимита
  if (!canGenerate(generations, user?.id || null, ip, profile.is_premium)) {
    return { success: false, error: 'Лимит генераций на сегодня исчерпан' };
  }

  // Генерация описаний
  const descriptions = generateDescriptions(productName, keywords, platform);
  const id = generateId();

  // Сохраняем
  const generation: Generation = {
    id,
    user_id: user?.id || null,
    product_name: productName,
    keywords,
    platform,
    descriptions,
    ip_address: user ? undefined : ip,
    created_at: new Date().toISOString(),
  };

  generations.unshift(generation);
  setStore(KEYS.GENERATIONS, generations);

  const remaining = getRemaining(generations, user?.id || null, ip, profile.is_premium);

  return {
    success: true,
    data: { id, descriptions },
    remaining,
  };
}

// === HISTORY ===

export async function getHistory(
  page: number = 1,
  platform?: Platform
): Promise<{ data: Generation[]; total: number }> {
  await delay(300);

  const user = getCurrentUser();
  const ip = getIp();
  const allGenerations = getStore<Generation>(KEYS.GENERATIONS);

  // Фильтруем по пользователю или IP
  let filtered = allGenerations.filter((g) => {
    if (user) return g.user_id === user.id;
    return g.ip_address === ip;
  });

  // Фильтр по платформе
  if (platform) {
    filtered = filtered.filter((g) => g.platform === platform);
  }

  const total = filtered.length;
  const perPage = 10;
  const start = (page - 1) * perPage;
  const data = filtered.slice(start, start + perPage);

  return { data, total };
}

// === FAVORITES ===

export async function addFavorite(generationId: string, descriptionIndex: number): Promise<Favorite> {
  await delay(300);

  const user = getCurrentUser();
  if (!user) throw new Error('Необходима авторизация');

  const favorites = getStore<Favorite>(KEYS.FAVORITES);
  
  // Проверяем дубликат
  const exists = favorites.find(
    (f) => f.generation_id === generationId && f.description_index === descriptionIndex
  );
  if (exists) throw new Error('Уже в избранном');

  const favorite: Favorite = {
    id: generateId(),
    user_id: user.id,
    generation_id: generationId,
    description_index: descriptionIndex,
    created_at: new Date().toISOString(),
  };

  favorites.unshift(favorite);
  setStore(KEYS.FAVORITES, favorites);

  return favorite;
}

export async function removeFavorite(id: string): Promise<void> {
  await delay(200);

  const favorites = getStore<Favorite>(KEYS.FAVORITES);
  const filtered = favorites.filter((f) => f.id !== id);
  setStore(KEYS.FAVORITES, filtered);
}

export async function getFavorites(): Promise<(Favorite & { generation?: Generation })[]> {
  await delay(300);

  const user = getCurrentUser();
  if (!user) return [];

  const favorites = getStore<Favorite>(KEYS.FAVORITES).filter((f) => f.user_id === user.id);
  const generations = getStore<Generation>(KEYS.GENERATIONS);

  return favorites.map((fav) => ({
    ...fav,
    generation: generations.find((g) => g.id === fav.generation_id),
  }));
}

// === DELETE GENERATION ===

export async function deleteGeneration(id: string): Promise<void> {
  await delay(200);

  const generations = getStore<Generation>(KEYS.GENERATIONS);
  const filtered = generations.filter((g) => g.id !== id);
  setStore(KEYS.GENERATIONS, filtered);

  // Также удаляем связанные избранные
  const favorites = getStore<Favorite>(KEYS.FAVORITES);
  const filteredFavs = favorites.filter((f) => f.generation_id !== id);
  setStore(KEYS.FAVORITES, filteredFavs);
}

// === PAYMENT ===

export async function processPayment(email: string): Promise<void> {
  await delay(2000);

  // Находим пользователя по email
  const users = getStore<{ email: string; password: string; id: string }>('seo_gen_users');
  const found = users.find((u) => u.email === email);
  
  if (!found) throw new Error('Пользователь не найден. Сначала зарегистрируйтесь.');

  // Обновляем профиль
  const profile = getObject<Profile>(KEYS.PROFILE);
  if (profile && profile.id === found.id) {
    profile.is_premium = true;
    setObject(KEYS.PROFILE, profile);
  }
}

// === ME ===

export async function getMe(): Promise<{ user: User | null; profile: { is_premium: boolean }; remaining: number }> {
  await delay(200);

  const user = getCurrentUser();
  const profile = getCurrentProfile();
  const ip = getIp();
  const generations = getStore<Generation>(KEYS.GENERATIONS);

  const remaining = getRemaining(generations, user?.id || null, ip, profile.is_premium);

  return {
    user,
    profile: { is_premium: profile.is_premium },
    remaining,
  };
}

// === GET GENERATION BY ID ===

export async function getGenerationById(id: string): Promise<Generation | null> {
  await delay(200);
  const generations = getStore<Generation>(KEYS.GENERATIONS);
  return generations.find((g) => g.id === id) || null;
}
