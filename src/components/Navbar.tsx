// Компонент навигации

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, History, Heart, Crown, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/auth';

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Генератор', icon: Sparkles },
    { to: '/history', label: 'История', icon: History },
    { to: '/favorites', label: 'Избранное', icon: Heart },
    { to: '/pricing', label: 'Тарифы', icon: Crown },
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

          {/* Auth кнопки */}
          <div className="hidden md:flex items-center gap-2">
            {profile.is_premium && (
              <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                <Crown className="w-3 h-3" />
                Premium
              </span>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Выйти"
                >
                  <LogOut className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ) : (
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
              {user ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти ({user.email})
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
