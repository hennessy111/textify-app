// Компонент навигации

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, History, Heart, Crown, LogIn, LogOut, Menu, X, Settings, Sun, Moon, HelpCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Генератор', icon: Sparkles },
    { to: '/history', label: 'История', icon: History },
    { to: '/favorites', label: 'Избранное', icon: Heart },
    { to: '/pricing', label: 'Тарифы', icon: Crown },
    { to: '/support', label: 'Поддержка', icon: HelpCircle },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">SEO-Генератор</span>
          </Link>

          {/* Десктоп навигация */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive(link.to) 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth и настройки */}
          <div className="hidden md:flex items-center gap-2">
            {profile.is_premium && (
              <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                <Crown className="w-3 h-3" />
                Premium
              </span>
            )}
            
            {/* Кнопка настроек */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Настройки"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>

              {/* Выпадающее меню настроек */}
              {settingsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setSettingsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase">Настройки</p>
                    </div>
                    
                    {/* Переключатель темы */}
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      {theme === 'light' ? (
                        <>
                          <Moon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Темная тема</span>
                        </>
                      ) : (
                        <>
                          <Sun className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Светлая тема</span>
                        </>
                      )}
                    </button>

                    {user && (
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <div className="px-4 py-2">
                          <p className="text-xs text-gray-500">Вы вошли как</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Выйти</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {!user && (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Войти
              </Link>
            )}
          </div>

          {/* Мобильное меню кнопка */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Меню"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Мобильное меню */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                  ${isActive(link.to) 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-gray-100">
              {/* Переключатель темы */}
              <button
                onClick={() => { toggleTheme(); setMobileOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 w-full"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4" />
                    Темная тема
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    Светлая тема
                  </>
                )}
              </button>

              {user ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  <LogIn className="w-4 h-4" />
                  Войти
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
