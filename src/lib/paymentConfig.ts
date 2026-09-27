// Конфигурация платёжных систем

export interface PaymentConfig {
  provider: 'yookassa' | 'yoomoney' | 'demo';
  shopId?: string;
  publicKey?: string;
  webhookUrl?: string;
}

// Конфигурация платёжной системы
// Переключите provider на 'yookassa' после получения credentials
export const PAYMENT_CONFIG: PaymentConfig = {
  // Для продакшена:
  provider: 'demo', // 'yookassa' | 'yoomoney' | 'demo'
  
  // ЮKassa credentials (получите в личном кабинете)
  // shopId: 'ваш_shop_id',
  // publicKey: 'ваш_public_key',
  // webhookUrl: '/api/yookassa-webhook',
  
  // YooMoney (альтернатива для самозанятых)
  // publicKey: 'ваш_yoomoney_public_key',
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
