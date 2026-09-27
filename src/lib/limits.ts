// Логика лимитов генераций

import { isToday } from './utils';
import type { Generation } from '../types';

const GUEST_LIMIT = 3;
const AUTH_LIMIT = 10;

/** Получить количество генераций за сегодня */
export function getTodayCount(generations: Generation[], userId: string | null, ip: string): number {
  return generations.filter((g) => {
    if (!isToday(g.created_at)) return false;
    if (userId) return g.user_id === userId;
    return g.ip_address === ip;
  }).length;
}

/** Получить оставшиеся генерации */
export function getRemaining(
  generations: Generation[],
  userId: string | null,
  ip: string,
  isPremium: boolean
): number {
  if (isPremium) return Infinity;
  
  const limit = userId ? AUTH_LIMIT : GUEST_LIMIT;
  const count = getTodayCount(generations, userId, ip);
  return Math.max(0, limit - count);
}

/** Проверить, можно ли генерировать */
export function canGenerate(
  generations: Generation[],
  userId: string | null,
  ip: string,
  isPremium: boolean
): boolean {
  return getRemaining(generations, userId, ip, isPremium) > 0;
}
