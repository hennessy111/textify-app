// Логика лимитов генераций

import { isToday } from './utils';
import type { Generation } from '../types';

const GUEST_LIMIT = 3; // Разовые генерации для гостей
export const AUTH_LIMIT = 3; // Ежедневные генерации для авторизованных

/** Получить количество генераций за сегодня */
export function getTodayCount(generations: Generation[], userId: string | null, ip: string): number {
  return generations.filter((g) => {
    if (!isToday(g.created_at)) return false;
    if (userId) return g.user_id === userId;
    return g.ip_address === ip;
  }).length;
}

/** Получить общее количество генераций для гостя (разовый лимит) */
export function getTotalGuestCount(generations: Generation[], ip: string): number {
  return generations.filter((g) => g.ip_address === ip).length;
}

/** Получить оставшиеся генерации */
export function getRemaining(
  generations: Generation[],
  userId: string | null,
  ip: string,
  isPremium: boolean,
  balance: number = 0
): number {
  if (isPremium) return Infinity;
  
  if (userId) {
    // Авторизованный пользователь: 3 ежедневные генерации + баланс
    const count = getTodayCount(generations, userId, ip);
    const dailyRemaining = Math.max(0, AUTH_LIMIT - count);
    return dailyRemaining + balance;
  } else {
    // Гость: 3 разовые генерации
    const count = getTotalGuestCount(generations, ip);
    return Math.max(0, GUEST_LIMIT - count);
  }
}

/** Проверить, можно ли генерировать */
export function canGenerate(
  generations: Generation[],
  userId: string | null,
  ip: string,
  isPremium: boolean,
  balance: number = 0
): boolean {
  return getRemaining(generations, userId, ip, isPremium, balance) > 0;
}
