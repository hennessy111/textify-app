// Утилиты приложения

import { v4 as uuidv4 } from 'uuid';

/** Генерация уникального ID */
export function generateId(): string {
  return uuidv4();
}

/** Форматирование даты */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Получить название платформы */
export function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    wildberries: 'Wildberries',
    ozon: 'Ozon',
    etsy: 'Etsy',
  };
  return labels[platform] || platform;
}

/** Получить цвет платформы */
export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    wildberries: 'bg-purple-100 text-purple-700',
    ozon: 'bg-blue-100 text-blue-700',
    etsy: 'bg-orange-100 text-orange-700',
  };
  return colors[platform] || 'bg-gray-100 text-gray-700';
}

/** Копирование в буфер обмена */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback для старых браузеров
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}

/** Получить IP (мок - возвращаем случайный) */
export function getMockIp(): string {
  return '192.168.1.' + Math.floor(Math.random() * 255);
}

/** Проверка - сегодня ли дата */
export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
