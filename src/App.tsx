// Главный компонент приложения с роутингом

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './lib/auth';
import { ThemeProvider } from './lib/theme';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { HistoryPage } from './pages/HistoryPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { PricingPage } from './pages/PricingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GenerationPage } from './pages/GenerationPage';
import { SupportPage } from './pages/SupportPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/g/:id" element={<GenerationPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/payment/success" element={<PaymentSuccessPage />} />
              </Routes>
            </main>
            {/* Footer */}
            <footer className="border-t border-gray-100 bg-white mt-16">
              <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    © 2024 SEO-Генератор. Все права защищены.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <a href="#/support" className="hover:text-indigo-600 transition-colors">Поддержка</a>
                    <span>•</span>
                    <span>Сделано с ❤️ для маркетплейсов</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#333',
                color: '#fff',
                fontSize: '14px',
              },
            }}
          />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
