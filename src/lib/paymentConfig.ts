// Конфигурация платёжных систем

export interface PaymentConfig {
  provider: 'yookassa' | 'yoomoney' | 'demo';
  apiUrl?: string; // URL сервера для API запросов
  shopId?: string;
  publicKey?: string;
  webhookUrl?: string;
}

// Конфигурация платёжной системы
// ВАЖНО: Замените apiUrl на URL вашего сервера после деплоя
export const PAYMENT_CONFIG: PaymentConfig = {
  // Для продакшена:
  provider: 'demo', // Измените на 'yookassa' после настройки сервера
  
  // URL вашего сервера (Railway/Render/VPS)
  // apiUrl: 'https://your-server.up.railway.app',
  
  // ЮKassa credentials (НЕ ХРАНИТЕ secretKey на фронтенде!)
  // shopId: 'ваш_shop_id',
  // webhookUrl: 'https://your-server.up.railway.app/api/yookassa-webhook',
};

// Тарифы
export const PRICING = {
  premium_monthly: { amount: 200, label: 'Премиум на 1 месяц', description: 'Безлимитные генерации на 30 дней' },
  premium_yearly: { amount: 1500, label: 'Премиум на 1 год', description: 'Безлимитные генерации на 365 дней' },
  pack_3: { amount: 100, label: 'Пакет 3 генерации', description: '3 генерации без срока действия' },
  pack_5: { amount: 150, label: 'Пакет 5 генераций', description: '5 генераций без срока действия' },
  pack_10: { amount: 200, label: 'Пакет 10 генераций', description: '10 генераций без срока действия' },
};

export type PaymentType = keyof typeof PRICING;
