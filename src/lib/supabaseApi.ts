// Supabase API - реальная работа с базой данных

import { supabase } from './supabase';
import type { User, Profile, Generation, Favorite, Platform } from '../types';
import { generateDescriptions } from './prompts';

// ============================================
// AUTH
// ============================================

export async function register(email: string, password: string): Promise<{ user: User; profile: Profile }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Registration failed');

  // Профиль создаётся автоматически через триггер в Supabase
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) throw profileError;

  return {
    user: { id: data.user.id, email: data.user.email! },
    profile: {
      id: profile.id,
      is_premium: profile.is_premium,
      balance: profile.balance,
      created_at: profile.created_at,
    },
  };
}

export async function login(email: string, password: string): Promise<{ user: User; profile: Profile }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Login failed');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) throw profileError;

  return {
    user: { id: data.user.id, email: data.user.email! },
    profile: {
      id: profile.id,
      is_premium: profile.is_premium,
      balance: profile.balance,
      created_at: profile.created_at,
    },
  };
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  return {
    id: data.session.user.id,
    email: data.session.user.email!,
  };
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return null;

  return {
    id: data.id,
    is_premium: data.is_premium,
    balance: data.balance,
    created_at: data.created_at,
  };
}

// ============================================
// GENERATE
// ============================================

export async function generate(
  productName: string,
  keywords: string[],
  platform: Platform
): Promise<{ success: boolean; data?: { id: string; descriptions: { text: string }[] }; error?: string; remaining?: number }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Необходима авторизация' };
  }

  // Проверяем возможность генерации
  const { data: canGen, error: canGenError } = await supabase.rpc('can_generate');
  if (canGenError) throw canGenError;

  if (!canGen) {
    return { success: false, error: 'Лимит генераций исчерпан' };
  }

  // Генерируем описания
  const descriptions = generateDescriptions(productName, keywords, platform);

  // Сохраняем в базу
  const { data: generation, error: genError } = await supabase
    .from('generations')
    .insert({
      user_id: user.id,
      product_name: productName,
      keywords,
      platform,
      descriptions,
    })
    .select()
    .single();

  if (genError) throw genError;

  // Проверяем, нужно ли списать из баланса
  const { data: todayCount } = await supabase.rpc('get_today_generations_count');
  
  const profile = await getCurrentProfile();
  if (profile && todayCount > 3 && profile.balance > 0) {
    await supabase.rpc('decrement_balance');
  }

  // Получаем оставшиеся генерации
  const remaining = await getRemainingGenerations();

  return {
    success: true,
    data: {
      id: generation.id,
      descriptions,
    },
    remaining,
  };
}

// ============================================
// HISTORY
// ============================================

export async function getHistory(
  page: number = 1,
  platform?: Platform
): Promise<{ data: Generation[]; total: number }> {
  const user = await getCurrentUser();
  if (!user) return { data: [], total: 0 };

  let query = supabase
    .from('generations')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (platform) {
    query = query.eq('platform', platform);
  }

  const perPage = 10;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
  };
}

// ============================================
// FAVORITES
// ============================================

export async function addFavorite(generationId: string, descriptionIndex: number): Promise<Favorite> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Необходима авторизация');

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.id,
      generation_id: generationId,
      description_index: descriptionIndex,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    user_id: data.user_id,
    generation_id: data.generation_id,
    description_index: data.description_index,
    created_at: data.created_at,
  };
}

export async function removeFavorite(id: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getFavorites(): Promise<(Favorite & { generation?: Generation })[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      generation:generations(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((fav) => ({
    id: fav.id,
    user_id: fav.user_id,
    generation_id: fav.generation_id,
    description_index: fav.description_index,
    created_at: fav.created_at,
    generation: fav.generation,
  }));
}

// ============================================
// DELETE GENERATION
// ============================================

export async function deleteGeneration(id: string): Promise<void> {
  const { error } = await supabase
    .from('generations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// PAYMENT
// ============================================

export type PaymentType = 'premium_monthly' | 'premium_yearly' | 'pack_3' | 'pack_5' | 'pack_10';

export async function processPayment(yookassaPaymentId: string, paymentType: PaymentType): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Необходима авторизация');

  // Сохраняем платёж
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      yookassa_payment_id: yookassaPaymentId,
      amount: getPaymentAmount(paymentType),
      payment_type: paymentType,
      status: 'succeeded',
    });

  if (paymentError) throw paymentError;

  // Обновляем профиль
  if (paymentType === 'premium_monthly') {
    await supabase.rpc('activate_premium', { days: 30 });
  } else if (paymentType === 'premium_yearly') {
    await supabase.rpc('activate_premium', { days: 365 });
  } else if (paymentType === 'pack_3') {
    await supabase.rpc('add_generations_to_balance', { amount: 3 });
  } else if (paymentType === 'pack_5') {
    await supabase.rpc('add_generations_to_balance', { amount: 5 });
  } else if (paymentType === 'pack_10') {
    await supabase.rpc('add_generations_to_balance', { amount: 10 });
  }
}

function getPaymentAmount(paymentType: PaymentType): number {
  switch (paymentType) {
    case 'premium_monthly': return 200;
    case 'premium_yearly': return 1500;
    case 'pack_3': return 100;
    case 'pack_5': return 150;
    case 'pack_10': return 200;
  }
}

// ============================================
// ME
// ============================================

export async function getMe(): Promise<{ user: User | null; profile: { is_premium: boolean; balance: number }; remaining: number }> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      profile: { is_premium: false, balance: 0 },
      remaining: 3,
    };
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    return {
      user,
      profile: { is_premium: false, balance: 0 },
      remaining: 3,
    };
  }

  const remaining = await getRemainingGenerations();

  return {
    user,
    profile: {
      is_premium: profile.is_premium,
      balance: profile.balance,
    },
    remaining,
  };
}

async function getRemainingGenerations(): Promise<number> {
  const profile = await getCurrentProfile();
  if (!profile) return 0;

  if (profile.is_premium) {
    return Infinity;
  }

  const { data: todayCount } = await supabase.rpc('get_today_generations_count');
  const dailyRemaining = Math.max(0, 3 - todayCount);

  return dailyRemaining + profile.balance;
}

// ============================================
// GET GENERATION BY ID
// ============================================

export async function getGenerationById(id: string): Promise<Generation | null> {
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  return data;
}
