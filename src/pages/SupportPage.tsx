// Страница поддержки

import React, { useState } from 'react';
import { HelpCircle, Mail, MessageCircle, BookOpen, ExternalLink, Send } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

export function SupportPage() {
  const { user, profile } = useAuth();
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Введите сообщение');
      return;
    }

    setIsSending(true);
    // Имитация отправки
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSending(false);
    
    toast.success('Сообщение отправлено! Мы ответим в течение 24 часов.');
    setMessage('');
    setSubject('');
  };

  const faqItems = [
    {
      question: 'Как сгенерировать описание товара?',
      answer: 'Заполните форму на главной странице: укажите название товара, 3 ключевых слова через запятую и выберите маркетплейс. Нажмите "Сгенерировать" и получите 3 варианта описания.',
    },
    {
      question: 'Почему не могу сгенерировать больше описаний?',
      answer: 'Гости могут создать 3 описания всего. Зарегистрированные пользователи получают 3 генерации в день. Для безлимита подключите тариф Премиум.',
    },
    {
      question: 'Как сохранить описание в избранное?',
      answer: 'Зарегистрируйтесь или войдите в аккаунт, затем нажмите кнопку "В избранное" на любом описании. Сохранённые описания доступны в разделе "Избранное".',
    },
    {
      question: 'Как отменить подписку Премиум?',
      answer: 'Напишите нам в поддержку с темой "Отмена подписки". Мы отменим подписку и вернём средства в течение 14 дней с момента оплаты.',
    },
    {
      question: 'Можно ли использовать описания в коммерческих целях?',
      answer: 'Да, все сгенерированные описания принадлежат вам и могут быть использованы для ваших товаров на маркетплейсах без ограничений.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Центр поддержки</h1>
        <p className="text-gray-600">Мы здесь, чтобы помочь вам</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Форма обращения */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
            Написать в поддержку
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="support-subject" className="block text-sm font-medium text-gray-700 mb-1">
                Тема обращения
              </label>
              <input
                id="support-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Кратко опишите проблему"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="support-message" className="block text-sm font-medium text-gray-700 mb-1">
                Сообщение
              </label>
              <textarea
                id="support-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Опишите вашу проблему или вопрос подробнее..."
                rows={5}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            <Button type="submit" size="lg" isLoading={isSending} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Отправить
            </Button>
          </form>

          {user && (
            <p className="mt-3 text-xs text-gray-500">
              Ответ придёт на <span className="font-medium">{user.email}</span>
            </p>
          )}
        </Card>

        {/* Контактная информация */}
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              Контакты
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">onyx.teammm@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Telegram</p>
                  <p className="text-sm text-gray-600">@onyxxxteammm</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Время ответа</p>
                  <p className="text-sm text-gray-600">
                    {profile.is_premium ? 'В течение 2 часов (приоритет)' : 'В течение 24 часов'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Быстрые ссылки</h2>
            <div className="space-y-2">
              <a href="#faq" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                <BookOpen className="w-4 h-4" />
                Часто задаваемые вопросы
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                <ExternalLink className="w-4 h-4" />
                Документация API
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                <ExternalLink className="w-4 h-4" />
                Политика конфиденциальности
              </a>
            </div>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Часто задаваемые вопросы
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, idx) => (
            <Card key={idx} className="p-5" hover>
              <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
